"use client"

import { useState } from "react"

import { todosRepo, type Todo } from "@/lib/db/examples/todo"
import { useLiveRecords } from "@/lib/db/reactive"

export function DbDemo() {
  const todos = useLiveRecords(() => todosRepo.getAll(), [], []) ?? []
  const [title, setTitle] = useState("")

  async function handleAdd() {
    const trimmed = title.trim()
    if (!trimmed) return
    await todosRepo.create({
      title: trimmed,
      done: false,
      createdAt: Date.now(),
    })
    setTitle("")
  }

  async function handleToggle(todo: Todo) {
    if (todo.id == null) return
    await todosRepo.update(todo.id, { done: !todo.done })
  }

  async function handleRemove(id?: number) {
    if (id == null) return
    await todosRepo.remove(id)
  }

  async function handleClear() {
    await todosRepo.clear()
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">Dexie — demonstração</h2>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Novo item"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void handleAdd()
          }}
        />
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
          onClick={() => void handleAdd()}
        >
          Adicionar
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => void handleToggle(todo)}
              />
              <span className={todo.done ? "line-through opacity-60" : ""}>
                {todo.title}
              </span>
            </label>
            <button
              type="button"
              className="text-sm text-destructive"
              onClick={() => void handleRemove(todo.id)}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{todos.length} item(s)</span>
        <button
          type="button"
          className="text-destructive underline"
          onClick={() => void handleClear()}
        >
          Limpar tudo
        </button>
      </div>
    </section>
  )
}
