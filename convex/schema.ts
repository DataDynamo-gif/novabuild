import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    credits: v.number(),
  }).index("by_email", ["email"]),

  projects: defineTable({
    userId: v.string(),
    prompt: v.string(),
    techStack: v.string(),
    result: v.string(),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),
});