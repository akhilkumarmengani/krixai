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
  fetchLiveIPLMatches,
  fetchUpcomingIPLMatches,
  fetchRecentIPLMatches,
  normalizeMatch,
  seedPrediction,
  filterIPL,
  extractAllMatches,
} from "@/lib/cricbuzz";

import scheduleData from "@/data/ipl2026-schedule.json";

// RAPIDAPI_KEY — set in Vercel → Settings → Environment Variables
const API_KEY = process.env.RAPIDAPI_KEY;

// ── Static schedule (zero API calls for upcoming/completed lookups) ──────────
// Populated by running: RAPIDAPI_KEY=xxx node scripts/fetch-ipl-schedule.mjs
// Cricbuzz match objects stored as-is; we normalize on demand.
const STATIC_SCHEDULE = scheduleData?.matches || [];

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
  if (!API_KEY) {
    return Response.json({
      current:  null,
      previous: null,
      source:   "no_key",
      debug:    { reason: "RAPIDAPI_KEY not set. Add it to .env.local or Vercel env vars." },
    });
  }

  const debugLog = [];

  try {
    // ── 1. Live matches (/matches/v1/live) ────────────────────────────────
    debugLog.push("Fetching Cricbuzz /matches/v1/live…");
    const { data: liveMatches } = await fetchLiveIPLMatches(API_KEY);
    debugLog.push(`/live → ${liveMatches.length} live IPL match(es)`);
    if (liveMatches.length > 0) {
      debugLog.push("Live: " + liveMatches.map(m => m.matchInfo?.seriesName + " — " + m.matchInfo?.matchDesc).join(" | "));
    }

    // Use the first live match if available
    let currentMatch = liveMatches[0] ? normalizeMatch(liveMatches[0]) : null;

    // ── 2. Upcoming — prefer static schedule, fall back to Cricbuzz API ──
    const useStaticSchedule = STATIC_SCHEDULE.length > 0;

    if (!currentMatch) {
      debugLog.push("No live match — searching for next upcoming…");

      if (useStaticSchedule) {
        // Static schedule: zero API calls
        const now = new Date();
        debugLog.push(`Static schedule has ${STATIC_SCHEDULE.length} match(es) — filtering upcoming…`);

        // Static matches are raw Cricbuzz objects; find upcoming ones by startDate
        const upcoming = STATIC_SCHEDULE
          .filter(m => {
            const state = (m.matchInfo?.state || "").toLowerCase();
            if (state === "complete" || state === "abandon") return false;
            const ms = parseInt(m.matchInfo?.startDate || "0", 10);
            return ms > now.getTime();
          })
          .sort((a, b) =>
            parseInt(a.matchInfo?.startDate || 0) - parseInt(b.matchInfo?.startDate || 0)
          );

        if (upcoming[0]) {
          currentMatch = normalizeMatch(upcoming[0]);
          debugLog.push(`Next upcoming (static): ${currentMatch.name} on ${currentMatch.date}`);
        } else {
          debugLog.push("No upcoming match found in static schedule");
        }

      } else {
        // Fall back: call /matches/v1/upcoming
        debugLog.push("Static schedule empty — fetching /matches/v1/upcoming from Cricbuzz…");
        const { data: upcomingMatches } = await fetchUpcomingIPLMatches(API_KEY);
        debugLog.push(`/upcoming → ${upcomingMatches.length} IPL match(es)`);

        // Sort by startDate ascending (nearest first)
        const sorted = [...upcomingMatches].sort((a, b) =>
          parseInt(a.matchInfo?.startDate || 0) - parseInt(b.matchInfo?.startDate || 0)
        );
        if (sorted[0]) {
          currentMatch = normalizeMatch(sorted[0]);
          debugLog.push(`Next upcoming (API): ${currentMatch.name} on ${currentMatch.date}`);
        } else {
          debugLog.push("No upcoming IPL match from Cricbuzz /upcoming");
        }
      }
    }

    if (currentMatch) {
      debugLog.push(`Showing: ${currentMatch.name} (${currentMatch.isLive ? "LIVE" : "upcoming"})`);
    }

    // ── 3. Last completed match ───────────────────────────────────────────
    debugLog.push("Fetching Cricbuzz /matches/v1/recent for completed…");
    const { data: recentMatches } = await fetchRecentIPLMatches(API_KEY);
    debugLog.push(`/recent → ${recentMatches.length} recent IPL match(es)`);

    // Sort descending (most recent first), skip whichever is current
    const currentId = currentMatch?.id;
    const completed = [...recentMatches]
      .filter(m => String(m.matchInfo?.matchId) !== currentId)
      .sort((a, b) =>
        parseInt(b.matchInfo?.startDate || 0) - parseInt(a.matchInfo?.startDate || 0)
      );

    let previousMatch = null;
    if (completed[0]) {
      debugLog.push(`Last completed: ${completed[0].matchInfo?.seriesName} — ${completed[0].matchInfo?.matchDesc}`);
      const prev    = normalizeMatch(completed[0]);
      const pred    = seedPrediction(prev.id, [prev.team1.name, prev.team2.name]);
      const correct = prev.winner === pred.predictedTeam;
      previousMatch = { ...prev, prediction: { ...pred, correct } };
    } else {
      debugLog.push("No completed IPL match found yet");
    }

    // Cricbuzz is reliable — no "blocked" state to track
    const source      = (currentMatch || previousMatch) ? "live" : "empty";
    const cacheHeader = currentMatch?.isLive
      ? "s-maxage=60,  stale-while-revalidate=90"
      : "s-maxage=120, stale-while-revalidate=180";

    return Response.json({
      current:  currentMatch,
      previous: previousMatch,
      source,
      debug:    { log: debugLog },
    }, {
      headers: { "Cache-Control": cacheHeader },
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
