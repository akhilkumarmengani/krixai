"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { getTeam } from "@/data/teams";

// ─── Card ───
export function Card({ children, style = {}, hover = true, onClick, ...props }) {
  const { tokens: tk } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: tk.page.surface,
        borderRadius: tk.radius.lg,
        border: `1px solid ${tk.page.border}`,
        transition: `all ${tk.motion.normal} ease`,
        boxShadow: hovered && hover ? tk.shadow.lg : tk.shadow.sm,
        transform: hovered && hover ? "translateY(-2px)" : "none",
        cursor: hover ? "pointer" : "default",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Badge ───
export function Badge({ children, color, bg }) {
  const { tokens: tk } = useTheme();
  return (
    <span style={{
      fontSize: tk.fontSize.xs + 1,
      fontWeight: tk.fontWeight.bold,
      padding: `3px ${tk.spacing.md}px`,
      borderRadius: tk.radius.sm,
      background: bg || `${color}15`,
      color: color,
      border: bg ? "none" : `1px solid ${color}25`,
      display: "inline-block",
    }}>
      {children}
    </span>
  );
}

// ─── Trend Badge ───
export function TrendBadge({ trend }) {
  const { tokens: tk } = useTheme();
  const isUp = trend === "up";
  return (
    <span style={{
      fontSize: tk.fontSize.xs + 1,
      fontWeight: tk.fontWeight.semibold,
      padding: `2px ${tk.spacing.sm}px`,
      borderRadius: tk.radius.sm,
      background: isUp ? tk.status.upBg : tk.status.steadyBg,
      color: isUp ? tk.status.up : tk.status.steady,
    }}>
      {isUp ? "▲ Hot" : "● Steady"}
    </span>
  );
}

// ─── Team Logo Square ───
export function TeamLogo({ teamId, size = 56 }) {
  const { tokens: tk } = useTheme();
  const tm = getTeam(teamId);

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: tm.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.28,
      fontWeight: tk.fontWeight.extrabold,
      color: "#fff",
      fontFamily: tk.fontFamily,
      boxShadow: tk.shadow.glow(tm.color),
      margin: "0 auto",
    }}>
      {tm.short}
    </div>
  );
}

// ─── Action Button ───
export function ActionButton({ children, onClick, variant = "primary", style: customStyle = {} }) {
  const { tokens: tk, tournament } = useTheme();
  const [hovered, setHovered] = useState(false);

  const styles = {
    primary: {
      background: "#fff",
      color: tournament.accent,
      border: "none",
      boxShadow: tk.shadow.xl,
    },
    ai: {
      background: hovered ? tk.ai.badgeBgHover : tk.ai.badgeBg,
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.2)",
      backdropFilter: "blur(8px)",
    },
    ghost: {
      background: hovered ? tk.page.hoverBg : "transparent",
      color: tk.page.textMuted,
      border: `1px solid ${tk.page.border}`,
    },
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: tk.fontFamily,
        fontSize: tk.fontSize.lg,
        fontWeight: tk.fontWeight.bold,
        padding: `${tk.spacing.md + 2}px ${tk.spacing.xxl + 4}px`,
        borderRadius: tk.radius.lg,
        cursor: "pointer",
        transition: `all ${tk.motion.normal}`,
        display: "flex",
        alignItems: "center",
        gap: tk.spacing.sm,
        ...styles[variant],
        ...customStyle,
      }}
    >
      {children}
    </button>
  );
}
