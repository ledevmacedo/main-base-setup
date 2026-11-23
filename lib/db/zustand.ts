"use client"

import { create } from "zustand"
import { useShallow } from "zustand/react/shallow"
import { liveQuery } from "dexie"

import { useEffect } from "react"

import type { StoreApi, UseBoundStore } from "zustand"

import type { DbKey } from "./types"
import { createRepository } from "./repository"

export type DbRepository<T, TKey extends DbKey> = ReturnType<
  typeof createRepository<T, TKey>
>

export type DbCollectionStatus = "idle" | "loading" | "ready" | "error"

export interface DbCollectionState<T, TKey extends DbKey> {
  items: T[]
  status: DbCollectionStatus
  error: string | null
  lastSyncedAt: number | null
  hydrate: () => Promise<void>
  refresh: () => Promise<void>
  upsert: (record: T, key?: TKey) => Promise<TKey>
  remove: (key: TKey) => Promise<void>
  clear: () => Promise<void>
  setItems: (items: T[]) => void
}

export interface DbCollectionStore<T, TKey extends DbKey> {
  useStore: UseBoundStore<StoreApi<DbCollectionState<T, TKey>>>
  repository: DbRepository<T, TKey>
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Cria uma store Zustand vinculada a um repositório Dexie.
 * A store mantém um cache global dos registros e ações de escrita
 * que sincronizam o banco e o estado.
 */
export function createDbCollectionStore<T, TKey extends DbKey = DbKey>(
  repository: DbRepository<T, TKey>
): DbCollectionStore<T, TKey> {
  const useStore = create<DbCollectionState<T, TKey>>()((set, get) => ({
    items: [],
    status: "idle",
    error: null,
    lastSyncedAt: null,

    hydrate: async () => {
      set({ status: "loading", error: null })
      try {
        const items = await repository.getAll()
        set({ items, status: "ready", lastSyncedAt: Date.now() })
      } catch (error) {
        set({ status: "error", error: toMessage(error) })
      }
    },

    refresh: async () => {
      await get().hydrate()
    },

    upsert: async (record, key) => {
      const savedKey = await repository.upsert(record, key)
      await get().hydrate()
      return savedKey
    },

    remove: async (key) => {
      await repository.remove(key)
      await get().hydrate()
    },

    clear: async () => {
      await repository.clear()
      set({ items: [], status: "ready", lastSyncedAt: Date.now() })
    },

    setItems: (items) => {
      set({ items, status: "ready", lastSyncedAt: Date.now() })
    },
  }))

  return { useStore, repository }
}

// Referências para sincronização reativa compartilhada por store.
const syncCounts = new WeakMap<object, number>()
const syncTeardowns = new WeakMap<object, () => void>()

/**
 * Hook React que hidrata a store e, opcionalmente, mantém sincronia
 * reativa com o IndexedDB via liveQuery. A sincronização é compartilhada
 * entre componentes (reference counting) para evitar assinaturas duplicadas.
 */
export function useDbCollection<T, TKey extends DbKey>(
  collection: DbCollectionStore<T, TKey>,
  options: { live?: boolean; hydrateOnMount?: boolean } = {}
) {
  const { useStore, repository } = collection

  const live = options.live ?? false
  const hydrateOnMount = options.hydrateOnMount ?? true

  useEffect(() => {
    if (hydrateOnMount) {
      void useStore.getState().hydrate()
    }

    if (!live) return

    const key = useStore as unknown as object
    const currentCount = syncCounts.get(key) ?? 0
    const nextCount = currentCount + 1
    syncCounts.set(key, nextCount)

    if (nextCount === 1) {
      const subscription = liveQuery(() => repository.getAll()).subscribe({
        next: (items) => useStore.getState().setItems(items),
        error: (error) => {
          useStore.setState({ status: "error", error: toMessage(error) })
        },
      })
      syncTeardowns.set(key, () => subscription.unsubscribe())
    }

    return () => {
      const remaining = (syncCounts.get(key) ?? 1) - 1
      if (remaining <= 0) {
        syncCounts.delete(key)
        syncTeardowns.get(key)?.()
        syncTeardowns.delete(key)
      } else {
        syncCounts.set(key, remaining)
      }
    }
  }, [useStore, repository, live, hydrateOnMount])

  return useStore(
    useShallow((state) => ({
      items: state.items,
      status: state.status,
      error: state.error,
      lastSyncedAt: state.lastSyncedAt,
      hydrate: state.hydrate,
      refresh: state.refresh,
      upsert: state.upsert,
      remove: state.remove,
      clear: state.clear,
    }))
  )
}