import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  groceryLists: defineTable({
    userId: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }),
  groceryItems: defineTable({
    listId: v.id('groceryLists'),
    userId: v.string(),
    name: v.string(),
    category: v.string(),
    quantity: v.number(),
    completed: v.boolean(),
    priority: v.union(v.literal('high'), v.literal('normal')),
    createdAt: v.number(),
  }).index('by_list', ['listId']),
})