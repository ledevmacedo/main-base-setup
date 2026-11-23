import type { IndexableType } from "dexie"

/**
 * Chave primária compatível com o IndexedDB/Dexie.
 */
export type DbKey = IndexableType

/**
 * Especificação genérica de consulta em memória.
 * Para datasets grandes, prefira consultas indexadas via `whereEquals`
 * ou métodos nativos do Dexie.
 */
export interface ListQuery<T> {
  /** Filtro de igualdade por campos. */
  where?: Partial<T>
  /** Campo usado para ordenação. */
  sortBy?: Extract<keyof T, string>
  /** Inverte a ordenação quando `true`. */
  reverse?: boolean
  /** Quantidade máxima de registros. */
  limit?: number
  /** Deslocamento inicial. */
  offset?: number
}
