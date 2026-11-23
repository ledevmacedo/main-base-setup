"use client"

import { liveQuery } from "dexie"
import { useLiveQuery } from "dexie-react-hooks"

import type { Table } from "dexie"
import type { DbKey } from "./types"

/**
 * Observável com todos os registros da tabela.
 */
export function liveAll<T, TKey extends DbKey = DbKey>(table: Table<T, TKey>) {
  return liveQuery(() => table.toArray())
}

/**
 * Cria um observável a partir de uma consulta Dexie arbitrária.
 */
export function liveRecords<T>(querier: () => T | Promise<T>) {
  return liveQuery(querier)
}

export { useLiveQuery }

/**
 * Wrapper tipado de `useLiveQuery` para leituras reativas em React.
 */
export function useLiveRecords<T>(
  querier: () => T | Promise<T>,
  deps: unknown[] = [],
  defaultResult?: T
) {
  return useLiveQuery(querier, deps, defaultResult)
}
