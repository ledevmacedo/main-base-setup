"use client"

import Dexie from "dexie"

/**
 * Nome do banco IndexedDB compartilhado pela aplicação.
 * Mantenha estável entre versões para não perder dados.
 */
export const DB_NAME = "main-base-setup"

/**
 * Versão base. Módulos de feature podem registrar versões maiores
 * chamando `db.version(n).stores(...)` (e `.upgrade(...)` quando necessário).
 * As chamadas de versão devem ocorrer antes do primeiro acesso à tabela.
 */
export const DB_VERSION = 1

export const db = new Dexie(DB_NAME)

// Versão base intencionalmente vazia: a base não conhece entidades.
db.version(DB_VERSION).stores({})

/**
 * Retorna um handle tipado para uma tabela registrada por um módulo de feature.
 * Use em vez de acessar `db` diretamente para manter a tipagem genérica.
 */
export function tableOf<T, TKey = number>(name: string) {
  return db.table<T, TKey>(name)
}
