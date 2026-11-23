"use client"

import { createDbCollectionStore, useDbCollection } from "@/lib/db/zustand"
import { todosRepo } from "./todo"

export const todoCollection = createDbCollectionStore(todosRepo)

export function useTodoCollection(options?: {
  live?: boolean
  hydrateOnMount?: boolean
}) {
  return useDbCollection(todoCollection, options)
}