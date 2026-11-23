"use client"

import { db, tableOf } from "@/lib/db/client"
import { createRepository } from "@/lib/db/repository"
import { runTransaction } from "@/lib/db/transactions"

export interface Todo {
  id?: number
  title: string
  done: boolean
  createdAt: number
  priority?: "low" | "normal" | "high"
}

// Versão 2: esquema inicial da entidade Todo.
db.version(2).stores({
  todos: "++id,done,createdAt,title",
})

export const todosTable = tableOf<Todo, number>("todos")
export const todosRepo = createRepository(todosTable)

// Versão 3: adiciona campo `priority` com migração idempotente.
db.version(3)
  .stores({
    todos: "++id,done,createdAt,title,priority",
  })
  .upgrade(async (tx) => {
    await tx
      .table("todos")
      .toCollection()
      .modify((todo: Record<string, unknown>) => {
        if (todo.priority == null) todo.priority = "normal"
      })
  })

/**
 * Exemplo de escrita transacional: alterna `done` e atualiza `createdAt`
 * como marcador de última alteração.
 */
export async function toggleTodo(todo: Todo): Promise<void> {
  if (todo.id == null) return
  await runTransaction(db, [todosTable], "rw", async () => {
    await todosRepo.update(todo.id as number, {
      done: !todo.done,
      createdAt: Date.now(),
    })
  })
}
