import type { Table } from "dexie"

import type { DbKey } from "./types"
import type { ListQuery } from "./types"

/**
 * Cria um registro e retorna sua chave primária.
 */
export async function createRecord<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>,
  record: T
): Promise<TKey> {
  return table.add(record)
}

/**
 * Cria vários registros e retorna todas as chaves primárias.
 */
export async function createMany<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>,
  records: readonly T[]
): Promise<TKey[]> {
  return table.bulkAdd(records, { allKeys: true })
}

/**
 * Obtém um registro pela chave primária.
 */
export async function getRecord<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>,
  key: TKey
): Promise<T | undefined> {
  return table.get(key)
}

/**
 * Obtém todos os registros da tabela.
 */
export async function getAllRecords<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>
): Promise<T[]> {
  return table.toArray()
}

/**
 * Conta os registros da tabela.
 */
export async function countRecords<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>
): Promise<number> {
  return table.count()
}

/**
 * Lista registros com filtro de igualdade, ordenação e paginação em memória.
 * Adequado para conjuntos pequenos/médios. Para grandes volumes, use consultas
 * indexadas do Dexie diretamente.
 */
export async function listRecords<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>,
  query: ListQuery<T> = {}
): Promise<T[]> {
  let rows = await table.toArray()

  if (query.where) {
    const entries = Object.entries(query.where as Record<string, unknown>)
    rows = rows.filter((row) =>
      entries.every(
        ([key, value]) => (row as Record<string, unknown>)[key] === value
      )
    )
  }

  if (query.sortBy) {
    const key = query.sortBy
    rows = [...rows].sort((a, b) => {
      const av = (a as Record<string, unknown>)[key]
      const bv = (b as Record<string, unknown>)[key]
      if (av === bv) return 0
      if (av == null) return 1
      if (bv == null) return -1
      return av < bv ? -1 : 1
    })
    if (query.reverse) rows.reverse()
  }

  const start = query.offset ?? 0
  const end = query.limit != null ? start + query.limit : undefined
  return rows.slice(start, end)
}

/**
 * Consulta indexada por igualdade em um campo.
 */
export async function whereEquals<
  T,
  K extends Extract<keyof T, string>,
  TKey extends DbKey = DbKey,
>(table: Table<T, TKey>, field: K, value: T[K]): Promise<T[]> {
  return table
    .where(field)
    .equals(value as unknown as DbKey)
    .toArray()
}

/**
 * Atualiza campos de um registro existente.
 */
export async function updateRecord<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>,
  key: TKey,
  changes: Partial<T>
): Promise<number> {
  return table.update(key, changes as never)
}

/**
 * Insere ou substitui um registro (upsert).
 */
export async function upsertRecord<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>,
  record: T,
  key?: TKey
): Promise<TKey> {
  return table.put(record, key)
}

/**
 * Remove um registro pela chave primária.
 */
export async function deleteRecord<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>,
  key: TKey
): Promise<void> {
  await table.delete(key)
}

/**
 * Remove vários registros pelas chaves primárias.
 */
export async function deleteMany<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>,
  keys: readonly TKey[]
): Promise<void> {
  await table.bulkDelete(keys as TKey[])
}

/**
 * Remove todos os registros da tabela.
 */
export async function clearTable<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>
): Promise<void> {
  await table.clear()
}

/**
 * Factory que vincula uma tabela a um conjunto de operações CRUD.
 * Útil para expor um repositório por entidade.
 */
export function createRepository<T, TKey extends DbKey = DbKey>(
  table: Table<T, TKey>
) {
  return {
    create: (record: T) => createRecord(table, record),
    createMany: (records: readonly T[]) => createMany(table, records),
    get: (key: TKey) => getRecord(table, key),
    getAll: () => getAllRecords(table),
    list: (query?: ListQuery<T>) => listRecords(table, query),
    whereEquals: <K extends Extract<keyof T, string>>(field: K, value: T[K]) =>
      whereEquals(table, field, value),
    count: () => countRecords(table),
    update: (key: TKey, changes: Partial<T>) =>
      updateRecord(table, key, changes),
    upsert: (record: T, key?: TKey) => upsertRecord(table, record, key),
    remove: (key: TKey) => deleteRecord(table, key),
    removeMany: (keys: readonly TKey[]) => deleteMany(table, keys),
    clear: () => clearTable(table),
  }
}
