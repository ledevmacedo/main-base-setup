import Dexie from "dexie"
import type { Table } from "dexie"

/**
 * Executa uma função dentro de uma transação Dexie.
 *
 * Regra importante: não chame APIs assíncronas não-Dexie dentro de `fn`
 * a menos que estejam envolvidas com `Dexie.waitFor()`.
 */
export async function runTransaction<TResult>(
  db: Dexie,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tables: Table<any, any>[],
  mode: "r" | "rw" | "readonly" | "readwrite",
  fn: () => TResult | Promise<TResult>
): Promise<TResult> {
  return db.transaction(mode, tables, async () => fn())
}
