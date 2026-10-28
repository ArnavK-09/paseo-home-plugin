import type { PluginServerContext } from "@getpaseo/plugin/server"
import { homeStats } from "./shared/home"

type AgentRow = {
  agent: {
    id: string
    provider: string
    status: string
    createdAt: string
    updatedAt: string
    lastUserMessageAt?: string | null
    requiresAttention?: boolean
    archivedAt?: string | null
  }
  project?: {
    projectName?: string
  }
}

type WorkspaceRow = {
  id: string
  projectId: string
}

const dayKey = (iso: string | null | undefined) => {
  if (!iso) return null
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toDateString()
}

export default function contribute(server: PluginServerContext) {
  server.handle(homeStats, async (_input, { paseo }) => {
    try {
      const workspaces: WorkspaceRow[] = []
      let workspaceCursor: string | undefined
      do {
        const page = await paseo.workspaces.list({
          page: { limit: 200, cursor: workspaceCursor },
        })
        workspaces.push(...((page.entries ?? []) as WorkspaceRow[]))
        workspaceCursor = page.pageInfo?.nextCursor ?? undefined
      } while (workspaceCursor)

      const agents: AgentRow[] = []
      let agentCursor: string | undefined
      do {
        const page = await paseo.agents.list({
          filter: { includeArchived: true },
          page: { limit: 200, cursor: agentCursor },
        })
        agents.push(...((page.entries ?? []) as AgentRow[]))
        agentCursor = page.pageInfo?.nextCursor ?? undefined
      } while (agentCursor)

      const projectList = await paseo.projects.list()
      const projectCount =
        projectList.projects?.length ??
        new Set(workspaces.map((workspace) => workspace.projectId)).size

      const days: Array<{ key: string; label: string; created: number; active: number }> = []
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date()
        date.setHours(0, 0, 0, 0)
        date.setDate(date.getDate() - offset)
        days.push({
          key: date.toDateString(),
          label: date.toLocaleDateString(undefined, { weekday: "short" }),
          created: 0,
          active: 0,
        })
      }
      const dayIndex = new Map(days.map((day, index) => [day.key, index]))

      const status = {
        running: 0,
        idle: 0,
        initializing: 0,
        error: 0,
        closed: 0,
      }
      const providers = new Map<string, number>()
      const projects = new Map<string, number>()
      let archived = 0
      let attention = 0

      for (const row of agents) {
        const agent = row.agent

        const createdKey = dayKey(agent.createdAt)
        const createdIndex = createdKey ? dayIndex.get(createdKey) : undefined
        if (createdIndex !== undefined) days[createdIndex].created += 1

        const activeKey = dayKey(agent.lastUserMessageAt ?? agent.updatedAt)
        const activeIndex = activeKey ? dayIndex.get(activeKey) : undefined
        if (activeIndex !== undefined) days[activeIndex].active += 1

        if (agent.archivedAt) {
          archived += 1
          continue
        }

        if (Object.prototype.hasOwnProperty.call(status, agent.status)) {
          status[agent.status as keyof typeof status] += 1
        }
        if (agent.requiresAttention === true) attention += 1
        if (agent.provider) {
          providers.set(agent.provider, (providers.get(agent.provider) ?? 0) + 1)
        }
        const projectName = row.project?.projectName
        if (projectName) {
          projects.set(projectName, (projects.get(projectName) ?? 0) + 1)
        }
      }

      return {
        projects: projectCount,
        workspaces: workspaces.length,
        threads: agents.length,
        activeThreads: agents.length - archived,
        archived,
        running: status.running,
        idle: status.idle,
        attention,
        status,
        providers: Array.from(providers.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        topProjects: Array.from(projects.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6),
        activity: days.map(({ label, created, active }) => ({ label, created, active })),
        error: null,
      }
    } catch (error) {
      return {
        projects: 0,
        workspaces: 0,
        threads: 0,
        activeThreads: 0,
        archived: 0,
        running: 0,
        idle: 0,
        attention: 0,
        status: { running: 0, idle: 0, initializing: 0, error: 0, closed: 0 },
        providers: [],
        topProjects: [],
        activity: Array.from({ length: 7 }, (_, index) => {
          const date = new Date()
          date.setHours(0, 0, 0, 0)
          date.setDate(date.getDate() - (6 - index))
          return {
            label: date.toLocaleDateString(undefined, { weekday: "short" }),
            created: 0,
            active: 0,
          }
        }),
        error: error instanceof Error ? error.message : String(error),
      }
    }
  })
  return () => {}
}
