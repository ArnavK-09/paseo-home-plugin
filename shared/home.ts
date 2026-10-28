import { defineRpc } from "@getpaseo/plugin"
import { z } from "zod"

export const homeStats = defineRpc({
  name: "home.stats",
  input: z.object({}).strict(),
  output: z.object({
    projects: z.number(),
    workspaces: z.number(),
    threads: z.number(),
    activeThreads: z.number(),
    archived: z.number(),
    running: z.number(),
    idle: z.number(),
    attention: z.number(),
    status: z.object({
      running: z.number(),
      idle: z.number(),
      initializing: z.number(),
      error: z.number(),
      closed: z.number(),
    }),
    providers: z.array(z.object({ name: z.string(), count: z.number() })),
    topProjects: z.array(z.object({ name: z.string(), count: z.number() })),
    activity: z.array(
      z.object({
        label: z.string(),
        created: z.number(),
        active: z.number(),
      }),
    ),
    error: z.string().nullable(),
  }),
})

export type HomeStats = z.infer<typeof homeStats.output>
