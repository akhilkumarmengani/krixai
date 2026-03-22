"use client";

import { useTheme } from "@/context/ThemeContext";

const TABS = [
  { id: "feed", label: "Feed", icon: "🏠" },
  { id: "matches", label: "Matches", icon: "🏏" },
  { id: "insights", label: "Insights", icon: "📊" },
  { id: "players", label: "Players", icon: "👤" },
  { id: "chat", label: "Ask AI", icon: "✨" },
];

export default function TabBar({ activeTab, onTabChange }) {
  const { tokens: tk, tournament } = useTheme();

  return (
    <div
      style={{
        background: tk.page.surface,
        borderBottom: `1px solid ${tk.page.border}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: tk.layout.maxWidth,
          margin: "0 auto",
          display: "flex",
          padding: `0 ${tk.spacing.xl}px`,
          overflowX: "auto",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              fontFamily: tk.fontFamily,
              fontSize: tk.fontSize.md,
              fontWeight: activeTab === t.id ? tk.fontWeight.semibold : tk.fontWeight.normal,
              padding: `${tk.spacing.md + 1}px ${tk.spacing.xl - 2}px`,
              border: "none",
              cursor: "pointer",
              background: "transparent",
              color: activeTab === t.id ? tournament.accent : tk.page.textMuted,
              borderBottom: activeTab === t.id ? `3px solid ${tournament.accent}` : "3px solid transparent",
              transition: `all ${tk.motion.fast}`,
              display: "flex",
              alignItems: "center",
              gap: 5,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
