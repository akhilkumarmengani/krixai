/**
 * CRICAPI — IPL-specific data layer
 * ════════════════════════════════════
 * Wraps CricketData.org API with IPL filtering, normalization,
 * win probability computation, and deterministic prediction seeding.
 *
 * All free-tier endpoints only.
 */

const CRICAPI_BASE = "https://api.cricapi.com/v1";

// ─── IPL franchise name → internal short code ─────────────────────────────
//
// Exact-match map for known API spellings. The fuzzy keyword check below
// catches any new spelling variants the API introduces.

export const IPL_TEAM_MAP = {
  // Current names
  "Royal Challengers Bengaluru": "RCB",
  "Sunrisers Hyderabad":         "SRH",
  "Mumbai Indians":              "MI",
  "Chennai Super Kings":         "CSK",
  "Kolkata Knight Riders":       "KKR",
  "Rajasthan Royals":            "RR",
  "Delhi Capitals":              "DC",
  "Punjab Kings":                "PBKS",
  "Gujarat Titans":              "GT",
  "Lucknow Super Giants":        "LSG",
  // Legacy / alternate spellings
  "Royal Challengers Bangalore": "RCB",
  "Kings XI Punjab":             "PBKS",
  "Delhi Daredevils":            "DC",
  "Deccan Chargers":             "SRH",
  "Rising Pune Supergiant":      "RPS",
  "Rising Pune Supergiants":     "RPS",
  "Pune Warriors":               "PWI",
};

// Keyword-based fallback — catches any spelling variant the exact map misses.
// Order matters: more specific phrases first.
const IPL_KEYWORD_MAP = [
  { kw: "super kings",        code: "CSK" },
  { kw: "mumbai indians",     code: "MI"  },
  { kw: "knight riders",      code: "KKR" },
  { kw: "sunrisers",          code: "SRH" },
  { kw: "royal challengers",  code: "RCB" },
  { kw: "rajasthan royals",   code: "RR"  },
  { kw: "delhi capitals",     code: "DC"  },
  { kw: "daredevils",         code: "DC"  },
  { kw: "punjab kings",       code: "PBKS"},
  { kw: "kings xi",           code: "PBKS"},
  { kw: "gujarat titans",     code: "GT"  },
  { kw: "lucknow super",      code: "LSG" },
];

/** Returns the short code if the name looks like an IPL team, otherwise null. */
function resolveIPLCode(apiName) {
  if (!apiName) return null;
  // 1. Try exact match first
  if (IPL_TEAM_MAP[apiName]) return IPL_TEAM_MAP[apiName];
  // 2. Keyword fuzzy match
  const lower = apiName.toLowerCase();
  for (const { kw, code } of IPL_KEYWORD_MAP) {
    if (lower.includes(kw)) return code;
  }
  return null;
}

/** Is this an IPL match? Both teams must resolve to a known IPL code. */
export function isIPLMatch(match) {
  if (!match.teams || match.teams.length < 2) return false;
  return resolveIPLCode(match.teams[0]) !== null &&
         resolveIPLCode(match.teams[1]) !== null;
}

/** API full name → internal short code (falls back to apiName itself) */
export function teamCode(apiName) {
  return resolveIPLCode(apiName) || apiName;
}

/** Is the match currently live (in progress)? */
export function isLive(match) {
  const s = (match.status || "").toLowerCase();
  return (
    s !== "" &&
    // Explicit "not started" patterns
    !s.includes("match not started") &&
    !s.includes("match starts at") &&   // CricAPI uses this for scheduled matches
    !s.includes("starts at") &&
    !s.includes("scheduled") &&
    // Completed patterns
    !s.includes("won by") &&
    !s.includes("won the match") &&
    !s.includes("match abandoned") &&
    !s.includes("no result") &&
    !s.includes("tied")
  );
}

/** Is the match completed? */
export function isCompleted(match) {
  const s = (match.status || "").toLowerCase();
  return (
    s.includes("won by") ||
    s.includes("won the match") ||
    s.includes("match abandoned") ||
    s.includes("no result") ||
    s.includes("tied")
  );
}

/** Extract winner team name from status string. */
export function detectWinner(match) {
  const { status, teams } = match;
  if (!status || !teams) return null;
  for (const t of teams) {
    if (status.startsWith(t) && status.toLowerCase().includes("won")) return t;
  }
  return null;
}

/** Format score inning object as display string: "142/4 (16.2 ov)" */
export function formatScoreStr(inning) {
  if (!inning) return null;
  const r = inning.r ?? 0;
  const w = inning.w ?? 0;
  const o = inning.o ?? 0;
  return `${r}/${w} (${o} ov)`;
}

// ─── Win Probability ───────────────────────────────────────────────────────

/**
 * Compute [team1%, team2%] win probability from free-tier score data.
 *
 * Cases handled:
 *   - Not started: 50/50
 *   - 1st innings in progress: extrapolate projected total vs par
 *   - 2nd innings in progress: factor required run rate + wickets in hand
 *   - Completed: 100/0 or 0/100
 */
export function computeWinProb(match) {
  const { score, status, teams, matchType } = match;
  const maxOvers = matchType === "t20" ? 20 : 50;
  const parScore  = matchType === "t20" ? 160 : 280;

  // No score data yet
  if (!score || score.length === 0) return [50, 50];

  // Completed match
  if (isCompleted(match)) {
    const winner = detectWinner(match);
    if (!winner || !teams) return [50, 50];
    const idx = teams.indexOf(winner);
    if (idx === 0) return [100, 0];
    if (idx === 1) return [0, 100];
    return [50, 50];
  }

  // 1st innings in progress
  if (score.length === 1) {
    const { r = 0, w = 0, o = 0 } = score[0];
    if (o < 0.1) return [50, 50];
    const projected   = (r / o) * maxOvers;
    const wktPenalty  = w * 8; // each wicket sheds ~8 projected runs
    const adjusted    = Math.max(projected - wktPenalty, r + 5);
    // How much better/worse than par?
    const delta       = (adjusted - parScore) / parScore;
    // Batting team baseline advantage: 52% (first innings slight edge),
    // scaled by projected vs par
    const battingAdv  = Math.min(Math.max(52 + delta * 22, 34), 70);
    return [Math.round(battingAdv), Math.round(100 - battingAdv)];
  }

  // 2nd innings in progress
  if (score.length >= 2) {
    const first  = score[0];
    const second = score[1];
    const target = (first.r ?? 0) + 1;
    const chased = second.r ?? 0;
    const needed = target - chased;
    const oversGone      = second.o ?? 0;
    const remainingOvers = Math.max(maxOvers - oversGone, 0.1);
    const remainingWkts  = 10 - (second.w ?? 0);

    // Edge cases
    if (needed <= 0) {
      // Chasing team has already crossed
      const innings2Name    = (second.inning || "").toLowerCase();
      const team1IsBatting2 = teams && innings2Name.includes((teams[0] || "").toLowerCase());
      return team1IsBatting2 ? [100, 0] : [0, 100];
    }
    if (remainingWkts <= 0 || remainingOvers <= 0) {
      const innings2Name    = (second.inning || "").toLowerCase();
      const team1IsBatting2 = teams && innings2Name.includes((teams[0] || "").toLowerCase());
      return team1IsBatting2 ? [0, 100] : [100, 0];
    }

    const rrr        = needed / remainingOvers;
    const crr        = oversGone > 0 ? chased / oversGone : 0;
    const rrRatio    = crr > 0 ? crr / rrr : 0.5;
    const wktBonus   = remainingWkts / 10;

    // Chasing probability: weighted blend of run-rate ratio and wickets in hand
    const chasingProb = Math.min(
      Math.max((rrRatio * 0.52 + wktBonus * 0.48) * 58, 15),
      85
    );

    // Determine which team is batting in 2nd inning
    const innings2Name    = (second.inning || "").toLowerCase();
    const team1IsBatting2 = teams && innings2Name.includes((teams[0] || "").toLowerCase());

    if (team1IsBatting2) {
      return [Math.round(chasingProb), Math.round(100 - chasingProb)];
    } else {
      return [Math.round(100 - chasingProb), Math.round(chasingProb)];
    }
  }

  return [50, 50];
}

// ─── CRR / RRR ─────────────────────────────────────────────────────────────

/** Returns { crr, rrr, target, needed, remainingOvers } for a live 2nd innings. */
export function computeChaseStats(match) {
  const { score, matchType } = match;
  const maxOvers = matchType === "t20" ? 20 : 50;
  if (!score || score.length < 2) return null;

  const first  = score[0];
  const second = score[1];
  const target = (first.r ?? 0) + 1;
  const chased = second.r ?? 0;
  const needed = Math.max(target - chased, 0);
  const oversGone      = second.o ?? 0;
  const remainingOvers = Math.max(maxOvers - oversGone, 0);
  const crr = oversGone > 0 ? +(chased / oversGone).toFixed(2) : 0;
  const rrr = remainingOvers > 0 ? +(needed / remainingOvers).toFixed(2) : 0;

  return { target, chased, needed, oversGone, remainingOvers, crr, rrr };
}

// ─── Prediction Seed ───────────────────────────────────────────────────────

/**
 * Deterministic "KrixAI prediction" seeded from match ID.
 * Produces the same prediction every time for a given match.
 * Confidence: 55–82%.
 */
export function seedPrediction(matchId, teams) {
  let hash = 0;
  const str = (matchId || "") + (teams[0] || "") + (teams[1] || "");
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash; // int32
  }
  const confidence   = 55 + Math.abs(hash % 28); // 55–82%
  const predictedIdx = Math.abs(hash) % 2;
  return {
    predictedTeam: teams[predictedIdx] || teams[0],
    confidence,
  };
}

// ─── Normalize raw API match ────────────────────────────────────────────────

/**
 * Converts a raw CricAPI match object into a clean display-ready shape.
 *
 * Returns:
 * {
 *   id, name, matchType, status, venue, date, dateTimeGMT,
 *   team1: { code, name, score },
 *   team2: { code, name, score },
 *   prob:  [t1%, t2%],
 *   isLive, isCompleted, winner,
 *   fantasyEnabled, seriesId,
 *   chaseStats (if 2nd innings)
 * }
 */
export function normalizeMatch(raw) {
  const t1Name = raw.teams?.[0] || "";
  const t2Name = raw.teams?.[1] || "";
  const code1  = teamCode(t1Name);
  const code2  = teamCode(t2Name);
  const prob   = computeWinProb(raw);

  // Find per-team score inning
  const score1 = (raw.score || []).find(s =>
    (s.inning || "").toLowerCase().includes(t1Name.toLowerCase())
  );
  const score2 = (raw.score || []).find(s =>
    (s.inning || "").toLowerCase().includes(t2Name.toLowerCase())
  );

  const chaseStats = (raw.score?.length >= 2 && isLive(raw))
    ? computeChaseStats(raw)
    : null;

  return {
    id:           raw.id,
    name:         raw.name || `${t1Name} vs ${t2Name}`,
    matchType:    raw.matchType || "t20",
    status:       raw.status || "",
    venue:        raw.venue || "",
    date:         raw.date || raw.dateTimeGMT?.split("T")[0] || "",
    dateTimeGMT:  raw.dateTimeGMT || "",
    team1: {
      code:  code1,
      name:  t1Name,
      score: score1 ? formatScoreStr(score1) : null,
    },
    team2: {
      code:  code2,
      name:  t2Name,
      score: score2 ? formatScoreStr(score2) : null,
    },
    prob,
    isLive:          isLive(raw),
    isCompleted:     isCompleted(raw),
    winner:          detectWinner(raw),
    fantasyEnabled:  raw.fantasyEnabled || false,
    seriesId:        raw.series_id || null,
    chaseStats,
  };
}

// ─── Module-level in-process cache ─────────────────────────────────────────
//
// Next.js `next: { revalidate }` only helps when the same Vercel function
// instance is reused. A module-level cache ensures we never hit the API more
// than once per TTL window even across different fetch calls in the same
// process. This dramatically reduces API hits during bursts (debug visits,
// concurrent users, etc.).

const _cache = {};

async function cachedFetch(url, ttlSeconds) {
  const now   = Date.now();
  const entry = _cache[url];
  if (entry && now - entry.ts < ttlSeconds * 1000) {
    return entry.data;
  }
  const res  = await fetch(url, { next: { revalidate: ttlSeconds } });
  const json = await res.json();
  // IMPORTANT: Only cache successful responses.
  // Never cache errors, rate-limit blocks, or auth failures — they should
  // be retried immediately on the next request.
  if (json.status === "success") {
    _cache[url] = { data: json, ts: now };
  }
  return json;
}

// ─── API fetch functions ────────────────────────────────────────────────────

/**
 * Fetch live / upcoming IPL matches from currentMatches endpoint.
 * Cached for 2 minutes in-process to prevent rate limiting.
 */
export async function fetchCurrentIPLMatches(apiKey) {
  const url  = `${CRICAPI_BASE}/currentMatches?apikey=${apiKey}&offset=0`;
  const json = await cachedFetch(url, 120); // 2-minute cache
  if (json.status !== "success") {
    console.warn("CricAPI currentMatches:", json.status, json.reason || "");
    return { data: [], raw: json };
  }
  return { data: (json.data || []).filter(isIPLMatch), raw: json };
}

/**
 * Fetch full match list for a single offset page.
 * Cached for 5 minutes in-process.
 */
export async function fetchAllIPLMatches(apiKey, offset = 0) {
  const url  = `${CRICAPI_BASE}/matches?apikey=${apiKey}&offset=${offset}`;
  const json = await cachedFetch(url, 300); // 5-minute cache
  if (json.status !== "success") {
    console.warn("CricAPI matches:", json.status, json.reason || "");
    return { data: [], raw: json };
  }
  return { data: (json.data || []).filter(isIPLMatch), raw: json };
}

/**
 * Fetch IPL matches from multiple pages of /matches concurrently.
 * Covers schedules spread across pagination boundaries (25 per page).
 * Returns merged IPL matches + the raw response from page 0 for metadata.
 */
export async function fetchAllIPLMatchesMultiPage(apiKey, offsets = [0, 25]) {
  const results = await Promise.all(
    offsets.map(offset => fetchAllIPLMatches(apiKey, offset))
  );

  // Deduplicate by match id across pages
  const seen   = new Set();
  const merged = [];
  for (const { data } of results) {
    for (const match of data) {
      if (!seen.has(match.id)) {
        seen.add(match.id);
        merged.push(match);
      }
    }
  }

  // Return merged data + raw from first successful page for metadata/status
  const primaryRaw = results[0]?.raw ?? { status: "failure" };
  return { data: merged, raw: primaryRaw };
}
