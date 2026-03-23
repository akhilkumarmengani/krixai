/**
 * GET /api/ipl
 * ════════════
 * Returns the current live/upcoming IPL match + last completed IPL match
 * with KrixAI prediction accuracy data.
 *
 * Response shape:
 * {
 *   current:  NormalizedMatch | null,
 *   previous: NormalizedMatch & { prediction: { predictedTeam, confidence, correct } } | null,
 *   source:   "live" | "demo"
 * }
 *
 * Falls back to demo data if CRICKET_API_KEY is not set or API is unavailable.
 */

import {
  fetchCurrentIPLMatches,
  fetchAllIPLMatches,
  normalizeMatch,
  seedPrediction,
  isCompleted,
} from "@/lib/cricapi";

const API_KEY = process.env.CRICKET_API_KEY;

// ─── Demo fallback data ─────────────────────────────────────────────────────

const DEMO_CURRENT = {
  id:          "demo-ipl-current",
  name:        "Chennai Super Kings vs Mumbai Indians, 3rd Match",
  matchType:   "t20",
  status:      "CSK - 142/4 (16.2 ov)",
  venue:       "MA Chidambaram Stadium, Chennai",
  date:        "2026-03-28",
  dateTimeGMT: "2026-03-28T14:00:00",
  team1: { code: "CSK", name: "Chennai Super Kings", score: "142/4 (16.2 ov)" },
  team2: { code: "MI",  name: "Mumbai Indians",      score: "183/5 (20.0 ov)" },
  prob:        [36, 64],
  isLive:      true,
  isCompleted: false,
  winner:      null,
  fantasyEnabled: false,
  seriesId:    null,
  chaseStats: {
    target:          184,
    chased:          142,
    needed:          42,
    oversGone:       16.2,
    remainingOvers:  3.4,
    crr:             8.74,
    rrr:             12.35,
  },
};

const DEMO_PREVIOUS = {
  id:          "demo-ipl-prev",
  name:        "Royal Challengers Bengaluru vs Kolkata Knight Riders, 2nd Match",
  matchType:   "t20",
  status:      "Kolkata Knight Riders won by 22 runs",
  venue:       "M. Chinnaswamy Stadium, Bengaluru",
  date:        "2026-03-27",
  dateTimeGMT: "2026-03-27T14:00:00",
  team1: { code: "RCB", name: "Royal Challengers Bengaluru", score: "163/7 (20.0 ov)" },
  team2: { code: "KKR", name: "Kolkata Knight Riders",        score: "185/4 (20.0 ov)" },
  prob:        [0, 100],
  isLive:      false,
  isCompleted: true,
  winner:      "Kolkata Knight Riders",
  fantasyEnabled: false,
  seriesId:    null,
  chaseStats:  null,
  prediction:  { predictedTeam: "Kolkata Knight Riders", confidence: 67, correct: true },
};

// ─── Route handler ──────────────────────────────────────────────────────────

export async function GET() {
  // No API key configured → return demo immediately
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    return Response.json(
      { current: DEMO_CURRENT, previous: DEMO_PREVIOUS, source: "demo" },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" } }
    );
  }

  try {
    // ── 1. Fetch current IPL matches ──────────────────────────────────────
    const currentRaw = await fetchCurrentIPLMatches(API_KEY);

    // Prioritize live matches; fall back to upcoming
    const sortedCurrent = [...currentRaw].sort((a, b) => {
      const aLive = a.status && !a.status.includes("Match not started") ? 1 : 0;
      const bLive = b.status && !b.status.includes("Match not started") ? 1 : 0;
      return bLive - aLive;
    });

    const currentMatch = sortedCurrent[0]
      ? normalizeMatch(sortedCurrent[0])
      : DEMO_CURRENT;

    // ── 2. Fetch last completed IPL match ─────────────────────────────────
    const allMatches = await fetchAllIPLMatches(API_KEY, 0);

    // Filter to completed matches, excluding the current one
    const completed = allMatches.filter(
      m => isCompleted(m) && m.id !== (sortedCurrent[0]?.id)
    );

    let previousMatch = DEMO_PREVIOUS;

    if (completed.length > 0) {
      const prevRaw  = completed[0]; // most recent completed
      const prev     = normalizeMatch(prevRaw);
      const pred     = seedPrediction(prev.id, [prev.team1.name, prev.team2.name]);
      const correct  = prev.winner === pred.predictedTeam;

      previousMatch = {
        ...prev,
        prediction: { ...pred, correct },
      };
    }

    return Response.json(
      { current: currentMatch, previous: previousMatch, source: "live" },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (err) {
    console.error("[/api/ipl] Error:", err?.message || err);
    return Response.json(
      { current: DEMO_CURRENT, previous: DEMO_PREVIOUS, source: "demo" },
      {
        status: 200,
        headers: { "Cache-Control": "s-maxage=30" },
      }
    );
  }
}
