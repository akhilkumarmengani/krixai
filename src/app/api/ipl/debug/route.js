/**
 * GET /api/ipl/debug
 * ══════════════════
 * Diagnostic endpoint for troubleshooting CricAPI data issues.
 *
 * Uses the SAME cached fetch functions as /api/ipl — visiting this endpoint
 * will NOT consume extra API hits if called within the cache window.
 */

import {
  fetchCurrentIPLMatches,
  fetchAllIPLMatchesMultiPage,
  IPL_TEAM_MAP,
} from "@/lib/cricapi";

const API_KEY     = process.env.CRICKET_API_KEY;
const IPL_NAMES   = new Set(Object.keys(IPL_TEAM_MAP));

export async function GET() {
  const keyPresent = !!(API_KEY && API_KEY !== "YOUR_API_KEY_HERE");

  if (!keyPresent) {
    return Response.json({
      error: "CRICKET_API_KEY not set",
      hint:  "Add CRICKET_API_KEY to Vercel → Settings → Environment Variables, then redeploy.",
    }, { headers: { "Cache-Control": "no-store" } });
  }

  const out = {
    apiKeyPresent:      true,
    apiKeyPrefix:       API_KEY.slice(0, 6) + "…",
    iplTeamNamesFilter: [...IPL_NAMES],
    currentMatches:     null,
    allMatches:         null,
  };

  // ── /currentMatches ─────────────────────────────────────────────────────
  try {
    const { data: iplMatches, raw } = await fetchCurrentIPLMatches(API_KEY);

    // All team pairs from the raw response (to spot name mismatches)
    const allPairs = (raw.data || []).map(m => ({
      name:   m.name,
      teams:  m.teams || [],
      status: m.status,
      date:   m.date,
      passesIplFilter: (m.teams || []).length >= 2 &&
                       IPL_NAMES.has(m.teams[0]) &&
                       IPL_NAMES.has(m.teams[1]),
    }));

    out.currentMatches = {
      apiStatus:     raw.status,
      apiReason:     raw.reason || null,
      hitsToday:     raw.info?.hitsToday  ?? "n/a",
      hitsLimit:     raw.info?.hitsLimit  ?? "n/a",
      totalReturned: raw.data?.length     ?? 0,
      iplMatchCount: iplMatches.length,
      iplMatches:    iplMatches.map(m => ({ name: m.name, teams: m.teams, status: m.status, date: m.date })),
      // Full list — look for IPL team names that DON'T pass our filter
      allTeamPairs:  allPairs,
    };
  } catch (e) {
    out.currentMatches = { error: e.message };
  }

  // ── /matches ─────────────────────────────────────────────────────────────
  try {
    const { data: iplMatches, raw } = await fetchAllIPLMatches(API_KEY, 0);

    const allPairs = (raw.data || []).map(m => ({
      name:   m.name,
      teams:  m.teams || [],
      status: m.status,
      date:   m.date,
      passesIplFilter: (m.teams || []).length >= 2 &&
                       IPL_NAMES.has(m.teams[0]) &&
                       IPL_NAMES.has(m.teams[1]),
    }));

    out.allMatches = {
      apiStatus:     raw.status,
      apiReason:     raw.reason || null,
      hitsToday:     raw.info?.hitsToday  ?? "n/a",
      hitsLimit:     raw.info?.hitsLimit  ?? "n/a",
      totalReturned: raw.data?.length     ?? 0,
      iplMatchCount: iplMatches.length,
      iplMatches:    iplMatches.map(m => ({
        name:   m.name,
        teams:  m.teams,
        status: m.status,
        date:   m.date,
      })),
      allTeamPairs: allPairs,
    };
  } catch (e) {
    out.allMatches = { error: e.message };
  }

  return Response.json(out, {
    headers: { "Cache-Control": "no-store" },
  });
}
