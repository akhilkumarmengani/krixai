/**
 * GET /api/ipl/debug
 * ══════════════════
 * Diagnostic endpoint — shows what Cricbuzz is returning for live,
 * upcoming, and recent IPL matches.
 *
 * Uses the SAME cached fetch functions as /api/ipl so visiting this
 * endpoint within the cache window costs zero extra API hits.
 */

import {
  fetchLiveIPLMatches,
  fetchUpcomingIPLMatches,
  fetchRecentIPLMatches,
  extractAllMatches,
  filterIPL,
} from "@/lib/cricbuzz";

const API_KEY = process.env.RAPIDAPI_KEY;

export async function GET() {
  if (!API_KEY) {
    return Response.json({
      error: "RAPIDAPI_KEY not set",
      hint:  "Add RAPIDAPI_KEY to Vercel → Settings → Environment Variables, then redeploy.",
    }, { headers: { "Cache-Control": "no-store" } });
  }

  const out = {
    apiKeyPrefix: API_KEY.slice(0, 8) + "…",
    live:     null,
    upcoming: null,
    recent:   null,
  };

  // Helper to summarise a match for debug output
  const summarise = m => ({
    matchId:    m.matchInfo?.matchId,
    matchDesc:  m.matchInfo?.matchDesc,
    seriesName: m.matchInfo?.seriesName || m._seriesName,
    team1:      m.matchInfo?.team1?.teamName,
    team2:      m.matchInfo?.team2?.teamName,
    state:      m.matchInfo?.state,
    status:     m.matchInfo?.status,
    startDate:  m.matchInfo?.startDate
                  ? new Date(parseInt(m.matchInfo.startDate)).toISOString()
                  : null,
    venue:      m.matchInfo?.venueName,
    isIPL:      true, // only IPL matches are included here
  });

  try {
    const { data: live, raw } = await fetchLiveIPLMatches(API_KEY);
    const allLive = extractAllMatches(raw);
    out.live = {
      iplMatchCount: live.length,
      totalReturned: allLive.length,
      iplMatches:    live.map(summarise),
      // Non-IPL matches — useful to spot if something is being filtered
      otherMatches:  allLive
        .filter(m => !filterIPL([m]).length)
        .slice(0, 5)
        .map(m => ({ seriesName: m._seriesName, team1: m.matchInfo?.team1?.teamName, team2: m.matchInfo?.team2?.teamName })),
    };
  } catch (e) {
    out.live = { error: e.message };
  }

  try {
    const { data: upcoming, raw } = await fetchUpcomingIPLMatches(API_KEY);
    out.upcoming = {
      iplMatchCount: upcoming.length,
      totalReturned: extractAllMatches(raw).length,
      iplMatches:    upcoming.map(summarise),
    };
  } catch (e) {
    out.upcoming = { error: e.message };
  }

  try {
    const { data: recent, raw } = await fetchRecentIPLMatches(API_KEY);
    out.recent = {
      iplMatchCount: recent.length,
      totalReturned: extractAllMatches(raw).length,
      iplMatches:    recent.map(summarise),
    };
  } catch (e) {
    out.recent = { error: e.message };
  }

  return Response.json(out, {
    headers: { "Cache-Control": "no-store" },
  });
}
