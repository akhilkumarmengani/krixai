/**
 * CRICMIND DESIGN TOKENS
 * ══════════════════════
 * Single source of truth for all visual values.
 * Change these to reskin the entire application.
 *
 * Usage: import { tokens } from '@/lib/tokens'
 */

export const tokens = {
  // ─── Typography ───
  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
  fontSize: {
    xs: 10,
    sm: 12,
    md: 13,
    lg: 14,
    xl: 15,
    h4: 17,
    h3: 22,
    h2: 28,
    h1: 44,
    stat: 28,
    countdown: 30,
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // ─── Spacing ───
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    section: 60,
  },

  // ─── Border Radius ───
  radius: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 12,
    xl: 16,
    xxl: 20,
    pill: 24,
    circle: 999,
  },

  // ─── Shadows ───
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.06)",
    md: "0 2px 8px rgba(0,0,0,0.1)",
    lg: "0 2px 16px rgba(0,0,0,0.1)",
    xl: "0 4px 20px rgba(0,0,0,0.25)",
    glow: (color) => `0 4px 16px ${color}40`,
  },

  // ─── Page Colors (light theme) ───
  page: {
    bg: "#f0f2f5",
    surface: "#fff",
    border: "#e0e0e0",
    borderLight: "#f0f0f0",
    text: "#1c1e21",
    textSecondary: "#4b4f56",
    textMuted: "#65676b",
    textDim: "#8a8d91",
    hoverBg: "#f5f5f5",
    inputBg: "#f0f2f5",
    cardBg: "#f5f6f7",
  },

  // ─── Status Colors ───
  status: {
    live: "#4cd964",
    up: "#1b8c3e",
    upBg: "#e7f5ec",
    steady: "#e67e00",
    steadyBg: "#fff3e0",
    danger: "#e8384f",
    dangerBg: "#fdeaed",
  },

  // ─── Animation ───
  motion: {
    fast: "0.15s",
    normal: "0.2s",
    slow: "0.3s",
    gauge: 800,
    stagger: 0.05,
  },

  // ─── Layout ───
  layout: {
    maxWidth: 1060,
    sidebarWidth: 320,
    cardMinWidth: 480,
    insightMinWidth: 320,
  },

  // ─── AI Branding ───
  ai: {
    gradient: "linear-gradient(135deg, #00d4ff, #7b2dff, #ff3366)",
    shimmer: "linear-gradient(90deg, #00d4ff, #a78bfa, #ff6bcb, #00d4ff)",
    orbSize: 22,
    badgeBg: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,45,255,0.2))",
    badgeBgHover: "linear-gradient(135deg, rgba(0,212,255,0.3), rgba(123,45,255,0.3))",
  },
};

/**
 * DARK THEME OVERRIDE
 * Uncomment and merge with tokens.page to switch to dark mode
 */
export const darkPageTokens = {
  bg: "#1a1a2e",
  surface: "#16213e",
  border: "#2a2a4a",
  borderLight: "#1f1f3a",
  text: "#e0e0e0",
  textSecondary: "#a0a0b0",
  textMuted: "#7a7a8e",
  textDim: "#55556a",
  hoverBg: "#1e1e3a",
  inputBg: "#12122a",
  cardBg: "#1a1a32",
};
