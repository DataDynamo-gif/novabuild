import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Project save karne ke liye mutation
export const saveProject = mutation({
  args: {
    userId: v.string(),
    prompt: v.string(),
    techStack: v.string(),
    result: v.string(),
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("projects", {
      userId: args.userId,
      prompt: args.prompt,
      techStack: args.techStack,
      result: args.result,
      createdAt: new Date().toISOString(),
    });
    return projectId;
  },
});

// User ke saare projects fetch karne ke liye query
export const getUserProjects = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});