import { useRpc, type PluginScreenProps } from "@getpaseo/plugin/client"
import { useQuery } from "@tanstack/react-query"
import type { CSSProperties, ReactNode } from "react"
import { homeStats, type HomeStats } from "../shared/home"

const bg = "var(--paseo-home-surface0)"
const text = "var(--paseo-home-foreground)"
const muted = "var(--paseo-home-foreground-muted)"
const faint = "var(--paseo-home-foreground-muted)"
const border = "var(--paseo-home-border)"
const panel = "var(--paseo-home-surface1)"
const grid = "var(--paseo-home-border)"
const green = "var(--paseo-home-success)"
const blue = "var(--paseo-home-accent)"
const amber = "var(--paseo-home-warning)"
const red = "var(--paseo-home-danger)"
const slate = "var(--paseo-home-foreground-muted)"

type ThemeStyle = CSSProperties & { [key: `--${string}`]: string }

const panelStyle: CSSProperties = {
  position: "relative",
  background: panel,
  border: `1px solid ${border}`,
  borderRadius: 14,
  padding: 20,
  boxSizing: "border-box",
  overflow: "hidden",
}

const pretty = (value: string) =>
  value.replace(/[-_]/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())

function Panel({
  title,
  subtitle,
  action,
  children,
  style,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <section style={{ ...panelStyle, ...style }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: text, letterSpacing: 0.1 }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 11, color: faint, marginTop: 4, lineHeight: 1.45 }}>
              {subtitle}
            </div>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

function Kpi({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: number | string
  hint?: string
  accent?: string
}) {
  return (
    <div
      style={{
        ...panelStyle,
        padding: "16px 18px",
        borderTop: `2px solid ${accent ?? border}`,
      }}
    >
      <div style={{ fontSize: 10, color: faint, letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          lineHeight: 1.1,
          fontWeight: 600,
          color: text,
          marginTop: 8,
          letterSpacing: -1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {hint && <div style={{ fontSize: 11, color: faint, marginTop: 5 }}>{hint}</div>}
    </div>
  )
}

const statusItems = (status: HomeStats["status"], total: number) => {
  const items = [
    { label: "Running", value: status.running, color: green },
    { label: "Idle", value: status.idle, color: blue },
    { label: "Initializing", value: status.initializing, color: amber },
    { label: "Error", value: status.error, color: red },
    { label: "Closed", value: status.closed, color: slate },
  ]
  return items
    .filter((item) => item.value > 0 || item.label === "Running")
    .map((item) => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : 0,
    }))
}

function StatusDonut({ status }: { status: HomeStats["status"] }) {
  const total = status.running + status.idle + status.initializing + status.error + status.closed
  const items = statusItems(status, total)
  let offset = 0

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <div style={{ position: "relative", width: 148, height: 148, flexShrink: 0 }}>
        <svg viewBox="0 0 120 120" width="148" height="148" style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke={grid}
            strokeWidth="10"
          />
          {items.map((item) => {
            const length = (item.value / Math.max(1, total)) * 100
            const segment = (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r="48"
                fill="none"
                stroke={item.color}
                strokeWidth="10"
                pathLength={100}
                strokeDasharray={`${length} ${100 - length}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += length
            return segment
          })}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: text,
              lineHeight: 1,
              letterSpacing: -1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {total}
          </div>
          <div style={{ fontSize: 9.5, color: faint, marginTop: 5, letterSpacing: 0.6 }}>
            ACTIVE THREADS
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, minWidth: 120 }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: 99,
                background: item.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, color: muted, flex: 1 }}>{item.label}</span>
            <span
              style={{
                fontSize: 12,
                color: text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityChart({ activity }: { activity: HomeStats["activity"] }) {
  const max = Math.max(1, ...activity.map((day) => Math.max(day.created, day.active)))
  const axisMax = Math.max(2, Math.ceil(max / 2) * 2)
  const lines = [axisMax, axisMax / 2, 0]

  return (
    <div style={{ display: "flex", gap: 12, marginTop: 2 }}>
      <div
        style={{
          width: 28,
          height: 186,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: 10,
          color: faint,
          fontVariantNumeric: "tabular-nums",
          paddingBottom: 1,
        }}
      >
        {lines.map((line) => (
          <span key={line}>{Math.round(line)}</span>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: "relative", height: 186 }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {lines.map((line) => (
              <div key={line} style={{ borderTop: `1px solid ${grid}`, height: 0 }} />
            ))}
          </div>

          <div
            style={{
              position: "relative",
              height: "100%",
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              padding: "0 6px",
            }}
          >
            {activity.map((day) => (
              <div
                key={day.label}
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <div
                  title={`${day.created} created`}
                  style={{
                    width: 14,
                    maxWidth: 18,
                    height: `${Math.max(2, (day.created / axisMax) * 100)}%`,
                    borderRadius: "4px 4px 2px 2px",
                    background: green,
                    opacity: day.created > 0 ? 1 : 0.28,
                  }}
                />
                <div
                  title={`${day.active} active`}
                  style={{
                    width: 14,
                    maxWidth: 18,
                    height: `${Math.max(2, (day.active / axisMax) * 100)}%`,
                    borderRadius: "4px 4px 2px 2px",
                    background: blue,
                    opacity: day.active > 0 ? 1 : 0.28,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "0 6px",
            marginTop: 9,
          }}
        >
          {activity.map((day) => (
            <div
              key={day.label}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 10.5,
                color: faint,
                letterSpacing: 0.3,
              }}
            >
              {day.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BarList({
  rows,
  empty,
  gradient,
}: {
  rows: Array<{ name: string; count: number }>
  empty: string
  gradient: string
}) {
  const max = Math.max(1, ...rows.map((row) => row.count))

  if (rows.length === 0) {
    return <div style={{ fontSize: 12, color: faint, padding: "18px 0" }}>{empty}</div>
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((row) => (
        <div key={row.name}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                fontSize: 12,
                color: muted,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pretty(row.name)}
            </span>
            <span
              style={{
                fontSize: 11.5,
                color: text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.count}
            </span>
          </div>
          <div
            style={{
              height: 5,
              borderRadius: 99,
              background: "var(--paseo-home-surface2)",
              marginTop: 6,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(row.count / max) * 100}%`,
                height: "100%",
                borderRadius: 99,
                background: gradient,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const legendDot = (color: string) => (
  <span
    style={{ width: 7, height: 7, borderRadius: 99, background: color, display: "inline-block" }}
  />
)

export function HomeScreen({ theme }: PluginScreenProps) {
  const call = useRpc(homeStats)
  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["home-stats"],
    queryFn: () => call({}),
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    retry: 1,
    staleTime: 3000,
  })

  const s: HomeStats | undefined = data
  const stats = s?.error === null ? s : undefined
  const error = s?.error ?? (queryError ? "Unable to retrieve home statistics." : null)

  const headline =
    stats && stats.running > 0
      ? `${stats.running} agent${stats.running === 1 ? "" : "s"} working`
      : stats && stats.attention > 0
        ? `${stats.attention} need${stats.attention === 1 ? "s" : ""} attention`
        : stats
          ? "All quiet right now"
          : isLoading
            ? "Loading your workspace"
            : error
              ? "Home status unavailable"
              : "Waiting for your first status response."

  const statusTotal = stats
    ? stats.status.running +
      stats.status.idle +
      stats.status.initializing +
      stats.status.error +
      stats.status.closed
    : 0

  const themeStyle: ThemeStyle = {
    "--paseo-home-surface0": theme.colors.surface0,
    "--paseo-home-surface1": theme.colors.surface1,
    "--paseo-home-surface2": theme.colors.surface2,
    "--paseo-home-border": theme.colors.border,
    "--paseo-home-foreground": theme.colors.foreground,
    "--paseo-home-foreground-muted": theme.colors.foregroundMuted,
    "--paseo-home-accent": theme.colors.accent,
    "--paseo-home-success": theme.colors.statusSuccess,
    "--paseo-home-warning": theme.colors.statusWarning,
    "--paseo-home-danger": theme.colors.statusDanger,
  }

  return (
    <div
      style={{
        ...themeStyle,
        width: "100%",
        minHeight: "100%",
        background: bg,
        color: text,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        overflowX: "hidden",
      }}
    >
      <style>{`
        @keyframes paseo-home-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.82); }
        }
        @keyframes paseo-home-rise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 440px at 18% -35%, var(--paseo-home-accent), transparent 62%), radial-gradient(760px 420px at 88% -25%, var(--paseo-home-accent), transparent 60%), radial-gradient(600px 320px at 50% 130%, var(--paseo-home-success), transparent 62%)",
            opacity: 0.22,
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.16,
            backgroundImage:
              "radial-gradient(var(--paseo-home-foreground) 0.6px, transparent 0.6px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(ellipse 70% 80% at 50% 20%, black 10%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 80% at 50% 20%, black 10%, transparent 72%)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "70%",
            width: "175%",
            height: 540,
            transform: "translateX(-50%)",
            borderRadius: "50%",
            border: "1px solid var(--paseo-home-accent)",
            boxShadow: "0 -24px 110px var(--paseo-home-accent), inset 0 30px 90px var(--paseo-home-accent)",
            opacity: 0.2,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 1240,
            margin: "0 auto",
            padding: "54px 32px 58px",
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              margin: "0 0 0",
              fontSize: "clamp(63px, 8.1vw, 102px)",
              lineHeight: 1.02,
              letterSpacing: -2.6,
              fontWeight: 900,
              color: text,
              maxWidth: 900,
            }}
          >
            {headline}
          </h1>

          <p
            style={{
              margin: "14px 0 0",
              fontSize: 14,
              lineHeight: 1.55,
              color: muted,
              maxWidth: 640,
            }}
          >
            {stats
              ? `${stats.activeThreads} active thread${stats.activeThreads === 1 ? "" : "s"} across ${stats.projects} project${stats.projects === 1 ? "" : "s"} and ${stats.workspaces} workspace${stats.workspaces === 1 ? "" : "s"}.`
              : isLoading
                ? "Reading your workspace…"
                : error
                  ? "Paseo did not return home statistics."
                  : "Waiting for the first status response."}
          </p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24 }}>
            {[
              { label: `${stats?.running ?? "—"} running`, color: green },
              { label: `${stats?.threads ?? "—"} threads`, color: blue },
              { label: `${stats?.archived ?? "—"} archived`, color: slate },
            ].map((chip) => (
              <span
                key={chip.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "5px 10px",
                  borderRadius: 99,
                  border: `1px solid ${border}`,
                  background: "var(--paseo-home-surface1)",
                  fontSize: 11,
                  color: text,
                  backdropFilter: "blur(6px)",
                }}
              >
                {legendDot(chip.color)}
                {chip.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <main
        style={{
          position: "relative",
          maxWidth: 1240,
          margin: "0 auto",
          padding: "22px 32px 56px",
          boxSizing: "border-box",
          animation: "paseo-home-rise 0.4s ease both",
        }}
      >
        {error && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${red}`,
              background: "var(--paseo-home-surface1)",
              color: red,
              fontSize: 12,
            }}
          >
            Home statistics unavailable: {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(168px, 1fr))",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <Kpi label="Projects" value={stats?.projects ?? "—"} hint="tracked repositories" />
          <Kpi label="Workspaces" value={stats?.workspaces ?? "—"} hint="open directories" />
          <Kpi
            label="Threads"
            value={stats?.threads ?? "—"}
            hint={`${stats?.activeThreads ?? "—"} active`}
            accent={blue}
          />
          <Kpi label="Archived" value={stats?.archived ?? "—"} hint="closed threads" />
          <Kpi
            label="Running now"
            value={stats?.running ?? "—"}
            hint={`${stats?.attention ?? "—"} need attention`}
            accent={green}
          />
        </div>

        <Panel
          title="Activity"
          subtitle="Threads created and activity over the last 7 days"
          style={{ marginBottom: 12 }}
          action={
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10.5,
                  color: faint,
                }}
              >
                {legendDot(green)} Created
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 10.5,
                  color: faint,
                }}
              >
                {legendDot(blue)} Active
              </span>
            </div>
          }
        >
          {stats ? (
            <ActivityChart activity={stats.activity} />
          ) : (
            <div
              style={{
                height: 208,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: faint,
              }}
            >
              {isLoading ? "Loading activity…" : "Activity data unavailable."}
            </div>
          )}
        </Panel>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          <Panel
            title="Thread status"
            subtitle={
              stats
                ? `${statusTotal} active thread${statusTotal === 1 ? "" : "s"}`
                : "Status unavailable"
            }
          >
            {stats ? (
              <StatusDonut status={stats.status} />
            ) : (
              <div style={{ fontSize: 12, color: faint, padding: "18px 0" }}>
                {isLoading ? "Loading status…" : "Status data unavailable."}
              </div>
            )}
          </Panel>

          <Panel title="Providers" subtitle="Active threads by runtime">
            <BarList
              rows={stats?.providers ?? []}
              empty={stats ? "No active threads yet." : "Statistics unavailable."}
              gradient="var(--paseo-home-accent)"
            />
          </Panel>

          <Panel title="Top projects" subtitle="Active threads per project">
            <BarList
              rows={stats?.topProjects ?? []}
              empty={stats ? "No project activity yet." : "Statistics unavailable."}
              gradient="var(--paseo-home-accent)"
            />
          </Panel>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 18,
            fontSize: 10.5,
            color: faint,
            letterSpacing: 0.3,
          }}
        >
          <span>Counts only · no thread titles</span>
          <span>Refreshes every 5 seconds</span>
        </div>
      </main>
    </div>
  )
}
