/**
 * GET /api/ipl/debug
 * ══════════════════
 * Shows raw CricAPI responses for troubleshooting.
 * Useful for seeing exactly what the API returns before filtering.
 *
 * Visit this URL in your browser to diagnose data issues.
 */

const CRICAPI_BASE = "https://api.cricapi.com/v1";
const API_KEY = process.env.CRICKET_API_KEY;

export async function GET() {
  if (!API_KEY || API_KEY === "YOUR_API_KEY_HERE") {
    return Response.json({
      error: "CRICKET_API_KEY not set in environment variables",
      hint: "Add CRICKET_API_KEY to .env.local (local) or Vercel environment variables (production)",
    });
  }

  const results = {};

  // 1. Fetch raw currentMatches
  try {
    const res  = await fetch(`${CRICAPI_BASE}/currentMatches?apikey=${API_KEY}&offset=0`, { cache: "no-store" });
    const json = await res.json();
    results.currentMatches = {
      status:     json.status,
      reason:     json.reason,
      totalRows:  json.info?.totalRows,
      hitsToday:  json.info?.hitsToday,
      hitsLimit:  json.info?.hitsLimit,
      matchCount: json.data?.length ?? 0,
      matches:    (json.data || []).map(m => ({
        id:           m.id,
        name:         m.name,
        status:       m.status,
        matchType:    m.matchType,
        teams:        m.teams,
        date:         m.date,
        fantasyEnabled: m.fantasyEnabled,
        hasScore:     (m.score || []).length > 0,
      })),
    };
  } catch (e) {
    results.currentMatches = { error: e.message };
  }

  // 2. Fetch raw matches list
  try {
    const res  = await fetch(`${CRICAPI_BASE}/matches?apikey=${API_KEY}&offset=0`, { cache: "no-store" });
    const json = await res.json();
    results.allMatches = {
      status:     json.status,
      reason:     json.reason,
      totalRows:  json.info?.totalRows,
      hitsToday:  json.info?.hitsToday,
      hitsLimit:  json.info?.hitsLimit,
      matchCount: json.data?.length ?? 0,
      // Show first 10 to keep response readable
      matches:    (json.data || []).slice(0, 10).map(m => ({
        id:        m.id,
        name:      m.name,
        status:    m.status,
        matchType: m.matchType,
        teams:     m.teams,
        date:      m.date,
      })),
    };
  } catch (e) {
    results.allMatches = { error: e.message };
  }

  // 3. Show IPL team names we look for
  results.iplTeamNames = [
    "Royal Challengers Bengaluru",
    "Royal Challengers Bangalore",
    "Sunrisers Hyderabad",
    "Mumbai Indians",
    "Chennai Super Kings",
    "Kolkata Knight Riders",
    "Rajasthan Royals",
    "Delhi Capitals",
    "Punjab Kings",
    "Kings XI Punjab",
    "Gujarat Titans",
    "Lucknow Super Giants",
  ];

  return Response.json(results, {
    headers: { "Content-Type": "application/json" },
  });
}
