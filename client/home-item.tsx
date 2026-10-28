import type { PluginSidebarItemProps } from "@getpaseo/plugin/client"

export function HomeSidebarItem({ theme, openScreen }: PluginSidebarItemProps) {
  return (
    <div
      style={{
        paddingLeft: 8,
        paddingRight: 8,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.colors.surface1
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent"
        }}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          minHeight: 28,
          borderRadius: 8,
          background: "transparent",
        }}
      >
        <button
          type="button"
          onClick={() => openScreen({ screenId: "home" })}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 5.5,
            minHeight: 28,
            paddingTop: 4,
            paddingBottom: 4,
            paddingLeft: 8,
            paddingRight: 8,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            font: "inherit",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={theme.colors.foregroundMuted}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M3 10.5L12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
          </svg>
          <span
            style={{
              fontSize: 16,
              fontWeight: 400,
              color: theme.colors.foregroundMuted,
              flexShrink: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Home
          </span>
        </button>
      </div>
    </div>
  )
}
