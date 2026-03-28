/**
 * GET /api/ipl?demo=true|false
 * ════════════════════════════
 * Returns current live/upcoming IPL match + last completed IPL match.
 *
 * Query params:
 *   demo=true  → return demo data (only when explicitly requested via toggle)
 *   demo=false → live data (default)
 *
 * Returns null for current/previous when no real data exists.
 * Never silently substitutes dummy data for real data.
 */

import {
  fetchCurrentIPLMatches,
  fetchAllIPLMatches,
  normalizeMatch,
  seedPrediction,
  isCompleted,
} from "@/lib/cricapi";

const API_KEY = process.env.CRICKET_API_KEY;

// ─── Demo data (only used when toggle is ON) ────────────────────────────────

const DEMO_CURRENT = {
  id:          "demo-ipl-current",
  name:        "Chennai Super Kings vs Mumbai Indians, 3rd Match",
  matchType:   "t20",
  status:      "MI need 42 runs off 24 balls",
  venue:       "MA Chidambaram Stadium, Chennai",
  date:        "2026-03-28",
  dateTimeGMT: "2026-03-28T14:00:00",
  team1: { code: "CSK", name: "Chennai Super Kings", score: "183/5 (20.0 ov)" },
  team2: { code: "MI",  name: "Mumbai Indians",      score: "142/4 (16.2 ov)" },
  prob:        [64, 36],
  isLive:      true,
  isCompleted: false,
  winner:      null,
  fantasyEnabled: false,
  seriesId:    null,
  chaseStats: {
    target: 184, chased: 142, needed: 42,
    oversGone: 16.2, remainingOvers: 3.4,
    crr: 8.74, rrr: 12.35,
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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const forceDemo = searchParams.get("demo") === "true";

  // Demo mode explicitly toggled on by user
  if (forceDemo) {
    return Response.json({
      current:  DEMO_CURRENT,
      previous: DEMO_PREVIOUS,
      source:   "demo",
      debug:    { reason: "Demo mode enabled via toggle" },
    });
  }

  // No API key — tell the client clearly
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    return Response.json({
      current:  null,
      previous: null,
      source:   "no_key",
      debug:    { reason: "CRICKET_API_KEY not set. Add it to .env.local or Vercel env vars." },
    });
  }

  const debugLog = [];

  try {
    // ── 1. Fetch current IPL matches ──────────────────────────────────────
    debugLog.push("Fetching /currentMatches…");
    const currentRaw = await fetchCurrentIPLMatches(API_KEY);
    debugLog.push(`currentMatches → ${currentRaw.length} IPL match(es)`);
    if (currentRaw.length > 0) {
      debugLog.push("Found: " + currentRaw.map(m => m.name).join(" | "));
    }

    // Prioritise live over upcoming
    const sortedCurrent = [...currentRaw].sort((a, b) => {
      const aLive = a.status && !a.status.toLowerCase().includes("match not started") ? 1 : 0;
      const bLive = b.status && !b.status.toLowerCase().includes("match not started") ? 1 : 0;
      return bLive - aLive;
    });

    const currentMatch = sortedCurrent[0] ? normalizeMatch(sortedCurrent[0]) : null;
    if (!currentMatch) debugLog.push("No current IPL match in API response");

    // ── 2. Fetch last completed IPL match ─────────────────────────────────
    debugLog.push("Fetching /matches for last completed IPL match…");
    const allMatches = await fetchAllIPLMatches(API_KEY, 0);
    debugLog.push(`/matches → ${allMatches.length} IPL match(es)`);

    const completed = allMatches.filter(
      m => isCompleted(m) && m.id !== sortedCurrent[0]?.id
    );
    debugLog.push(`Completed IPL matches: ${completed.length}`);

    let previousMatch = null;
    if (completed.length > 0) {
      debugLog.push(`Last completed: ${completed[0].name} — ${completed[0].status}`);
      const prev    = normalizeMatch(completed[0]);
      const pred    = seedPrediction(prev.id, [prev.team1.name, prev.team2.name]);
      const correct = prev.winner === pred.predictedTeam;
      previousMatch = { ...prev, prediction: { ...pred, correct } };
    } else {
      debugLog.push("No completed IPL match found in API response");
    }

    const source = (currentMatch || previousMatch) ? "live" : "empty";

    return Response.json({
      current:  currentMatch,
      previous: previousMatch,
      source,
      debug:    { log: debugLog },
    }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
    });

  } catch (err) {
    const errMsg = err?.message || String(err);
    console.error("[/api/ipl] Error:", errMsg);
    return Response.json({
      current:  null,
      previous: null,
      source:   "error",
      debug:    { error: errMsg, log: debugLog },
    });
  }
}
