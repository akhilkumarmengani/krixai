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
  fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
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

  // ─── Brand Colors ───
  brand: {
    indiaBlue: "#003DA5",
    saffron: "#FF6B00",
    nearBlack: "#0a0a0a",
  },

  // ─── Page Colors (light theme) ───
  page: {
    bg: "#f7f7f5",
    surface: "#ffffff",
    border: "#ebebeb",
    borderLight: "#f5f5f5",
    text: "#0a0a0a",
    textSecondary: "#444444",
    textMuted: "#666666",
    textDim: "#999999",
    hoverBg: "#f0f0ef",
    inputBg: "#f5f5f3",
    cardBg: "#f5f5f3",
  },

  // ─── Status Colors ───
  status: {
    live: "#22c55e",
    up: "#15803d",
    upBg: "#dcfce7",
    steady: "#FF6B00",
    steadyBg: "#fff0e6",
    danger: "#dc2626",
    dangerBg: "#fee2e2",
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
    gradient: "linear-gradient(135deg, #003DA5, #FF6B00)",
    shimmer: "linear-gradient(90deg, #003DA5, #FF6B00, #003DA5)",
    orbSize: 22,
    badgeBg: "linear-gradient(135deg, rgba(0,61,165,0.15), rgba(255,107,0,0.15))",
    badgeBgHover: "linear-gradient(135deg, rgba(0,61,165,0.25), rgba(255,107,0,0.25))",
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
