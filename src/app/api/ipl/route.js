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
  fetchAllIPLMatchesMultiPage,
  normalizeMatch,
  seedPrediction,
  isCompleted,
  isLive,
  isIPLMatch,
} from "@/lib/cricapi";

import scheduleData from "@/data/ipl2026-schedule.json";

const API_KEY = process.env.CRICKET_API_KEY;

// Static schedule loaded from the committed JSON (no API calls needed for this).
// Populated by running: node scripts/fetch-ipl-schedule.mjs
const STATIC_SCHEDULE = (scheduleData?.matches || []).filter(isIPLMatch);

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
    const { data: currentRaw, raw: currentRawFull } = await fetchCurrentIPLMatches(API_KEY);

    if (currentRawFull.status !== "success") {
      debugLog.push(`currentMatches API error: ${currentRawFull.status} — ${currentRawFull.reason || ""}`);
    } else {
      debugLog.push(`currentMatches → ${currentRaw.length} IPL match(es) (${currentRawFull.data?.length || 0} total returned)`);
      if (currentRaw.length > 0) {
        debugLog.push("Found: " + currentRaw.map(m => m.name).join(" | "));
      }
      if (currentRawFull.info) {
        debugLog.push(`API usage: ${currentRawFull.info.hitsToday}/${currentRawFull.info.hitsLimit} hits today`);
      }
    }

    // Sort: live matches first, then by date ascending (nearest upcoming first)
    // Uses the same isLive() logic as normalizeMatch so they're always consistent
    const sortedCurrent = [...currentRaw].sort((a, b) => {
      const aIsLive = isLive(a) ? 1 : 0;
      const bIsLive = isLive(b) ? 1 : 0;
      if (aIsLive !== bIsLive) return bIsLive - aIsLive; // live beats upcoming
      // Both same liveness — pick the nearest date
      return new Date(a.dateTimeGMT || a.date) - new Date(b.dateTimeGMT || b.date);
    });

    let currentMatch = sortedCurrent[0] ? normalizeMatch(sortedCurrent[0]) : null;
    if (currentMatch) {
      debugLog.push(`Using match: ${currentMatch.name} (${currentMatch.isLive ? "LIVE" : "upcoming"})`);
    }

    // ── 2. Upcoming + completed — prefer static schedule, fall back to API ──
    const useStaticSchedule = STATIC_SCHEDULE.length > 0;
    let allMatches;
    let allMatchesRawFull = { status: "success", reason: "" };

    if (useStaticSchedule) {
      // Zero API calls — use the committed schedule JSON.
      allMatches = STATIC_SCHEDULE;
      debugLog.push(`Using static schedule: ${allMatches.length} IPL match(es) (no API call)`);
    } else {
      // Static file not yet populated — fall back to fetching 2 pages from API.
      debugLog.push("Static schedule empty — fetching /matches (offset 0 + 25) from API…");
      const result = await fetchAllIPLMatchesMultiPage(API_KEY, [0, 25]);
      allMatches       = result.data;
      allMatchesRawFull = result.raw;
      if (allMatchesRawFull.status !== "success") {
        debugLog.push(`/matches API error: ${allMatchesRawFull.status} — ${allMatchesRawFull.reason || ""}`);
      } else {
        debugLog.push(`/matches (2 pages) → ${allMatches.length} IPL match(es)`);
      }
    }

    // If currentMatches returned nothing, find the next upcoming from the schedule
    if (!currentMatch) {
      debugLog.push("No match in /currentMatches — searching schedule for next upcoming…");
      const now = new Date();
      const upcoming = allMatches
        .filter(m => {
          if (isCompleted(m)) return false;
          const matchDate = new Date(m.dateTimeGMT || m.date);
          return matchDate >= now || (m.status || "").toLowerCase().includes("match not started");
        })
        .sort((a, b) =>
          new Date(a.dateTimeGMT || a.date) - new Date(b.dateTimeGMT || b.date)
        );
      if (upcoming[0]) {
        currentMatch = normalizeMatch(upcoming[0]);
        debugLog.push(`Next upcoming: ${upcoming[0].name} on ${upcoming[0].date}`);
      } else {
        debugLog.push("No upcoming IPL match found in schedule");
      }
    }

    // Last completed match (exclude whichever is currently showing as "current")
    const completed = allMatches
      .filter(m => isCompleted(m) && m.id !== (sortedCurrent[0]?.id || currentMatch?.id))
      .sort((a, b) => new Date(b.dateTimeGMT || b.date) - new Date(a.dateTimeGMT || a.date));
    debugLog.push(`Completed IPL matches in schedule: ${completed.length}`);

    let previousMatch = null;
    if (completed.length > 0) {
      debugLog.push(`Last completed: ${completed[0].name} — ${completed[0].status}`);
      const prev    = normalizeMatch(completed[0]);
      const pred    = seedPrediction(prev.id, [prev.team1.name, prev.team2.name]);
      const correct = prev.winner === pred.predictedTeam;
      previousMatch = { ...prev, prediction: { ...pred, correct } };
    } else {
      debugLog.push("No completed IPL match found yet");
    }

    // Detect rate-limit block (only possible if we called the API)
    const isBlocked =
      (currentRawFull.reason || "").toLowerCase().includes("blocked") ||
      (!useStaticSchedule && (allMatchesRawFull.reason || "").toLowerCase().includes("blocked"));

    const source = isBlocked
      ? "blocked"
      : (currentMatch || previousMatch) ? "live" : "empty";

    // Don't cache error/blocked responses — retry sooner
    const cacheHeader = isBlocked
      ? "no-store"
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
