/**
 * TOURNAMENT CONFIGS
 * ═══════════════════
 * Each tournament defines its own visual identity.
 * Add a new tournament = entire UI adapts automatically.
 *
 * Required fields:
 *   id, name, short, tagline, startDate,
 *   gradient, accent, accentLight, headerColors
 */

export const tournaments = {
  ipl2026: {
    id: "ipl2026",
    name: "TATA IPL 2026",
    short: "IPL 2026",
    tagline: "84 Matches · 10 Teams · 1 Champion",
    startDate: "2026-03-28T19:30:00+05:30",
    gradient: "linear-gradient(135deg, #1a0e3e 0%, #2d1669 30%, #4a1e8a 60%, #6b28b0 100%)",
    accent: "#6c3baa",
    accentLight: "#f0ecf8",
    headerColors: [
      "#e8384f", "#ffc220", "#5b2dff", "#004ba0", "#ec1c24",
      "#f9cd16", "#3a225d", "#254aa5", "#e8702a", "#0078bc",
    ],
  },
  t20wc2026: {
    id: "t20wc2026",
    name: "ICC T20 World Cup 2026",
    short: "T20 WC",
    tagline: "20 Teams · India & Sri Lanka",
    startDate: "2026-02-09T14:00:00+05:30",
    gradient: "linear-gradient(135deg, #001d3d 0%, #003566 30%, #005599 60%, #0077cc 100%)",
    accent: "#0077cc",
    accentLight: "#e6f2ff",
    headerColors: [
      "#0066cc", "#ff9933", "#ffc220", "#006a4e",
      "#006633", "#1a1a1a", "#cf4520", "#1a3668",
    ],
  },
  theashes: {
    id: "theashes",
    name: "The Ashes 2026-27",
    short: "Ashes",
    tagline: "Australia vs England · 5 Tests",
    startDate: "2026-12-01T10:00:00+11:00",
    gradient: "linear-gradient(135deg, #0f2810 0%, #1a4520 30%, #2d6a30 60%, #3d8a40 100%)",
    accent: "#2d7a3a",
    accentLight: "#e8f5e9",
    headerColors: ["#ffc220", "#006241", "#1a3668", "#cf4520"],
  },
};

export const defaultTournamentId = "ipl2026";
