/**
 * CRICBUZZ — IPL data layer via RapidAPI
 * ════════════════════════════════════════
 * Wraps the Cricbuzz Cricket API (cricbuzz-cricket.p.rapidapi.com) with
 * IPL filtering, normalization, and an in-process cache to keep RapidAPI
 * hit counts low.
 *
 * Environment variable: RAPIDAPI_KEY
 *   Set in Vercel → Settings → Environment Variables.
 *
 * Endpoints used:
 *   GET /matches/v1/live     — currently in-progress matches
 *   GET /matches/v1/upcoming — scheduled/upcoming matches
 *   GET /matches/v1/recent   — recently completed matches
 *
 * Response shape (same as before — no frontend changes needed):
 *   { id, name, matchType, status, venue, date, dateTimeGMT,
 *     team1: { code, name, score }, team2: { code, name, score },
 *     prob, isLive, isCompleted, winner, chaseStats }
 */

const CRICBUZZ_HOST = "cricbuzz-cricket.p.rapidapi.com";
const CRICBUZZ_BASE = `https://${CRICBUZZ_HOST}`;

// ─── In-process cache ───────────────────────────────────────────────────────
// Prevents hammering RapidAPI on every request. Only caches HTTP 200 responses
// with actual data (never error payloads).

const _cache = {};

async function cachedFetch(url, apiKey, ttlSeconds) {
  const now = Date.now();
  if (_cache[url] && now - _cache[url].ts < ttlSeconds * 1000) {
    return _cache[url].data;
  }

  const res  = await fetch(url, {
    headers: {
      "X-RapidAPI-Key":  apiKey,
      "X-RapidAPI-Host": CRICBUZZ_HOST,
    },
    // Next.js edge cache aligned with our in-process TTL
    next: { revalidate: ttlSeconds },
  });

  const json = await res.json();

  // Only cache successful responses
  if (res.ok && json.typeMatches) {
    _cache[url] = { data: json, ts: now };
  }

  return json;
}

// ─── IPL detection ──────────────────────────────────────────────────────────

/**
 * Cricbuzz groups matches by series inside typeMatches → seriesMatches.
 * We detect IPL by the series name.
 */
function isIPLSeries(seriesName = "") {
  const s = seriesName.toLowerCase();
  return (
    s.includes("indian premier league") ||
    s.includes(" ipl ") ||
    s.startsWith("ipl ")  ||
    s.endsWith(" ipl")    ||
    s === "ipl"
  );
}

// ─── Team name → short code ─────────────────────────────────────────────────

const TEAM_CODE_MAP = {
  "Royal Challengers Bengaluru": "RCB",
  "Royal Challengers Bangalore": "RCB",
  "Sunrisers Hyderabad":         "SRH",
  "Mumbai Indians":              "MI",
  "Chennai Super Kings":         "CSK",
  "Kolkata Knight Riders":       "KKR",
  "Rajasthan Royals":            "RR",
  "Delhi Capitals":              "DC",
  "Delhi Daredevils":            "DC",
  "Punjab Kings":                "PBKS",
  "Kings XI Punjab":             "PBKS",
  "Gujarat Titans":              "GT",
  "Lucknow Super Giants":        "LSG",
};

function resolveCode(name = "") {
  if (TEAM_CODE_MAP[name]) return TEAM_CODE_MAP[name];
  // Fuzzy fallback
  const l = name.toLowerCase();
  if (l.includes("royal challengers")) return "RCB";
  if (l.includes("sunrisers"))         return "SRH";
  if (l.includes("mumbai"))            return "MI";
  if (l.includes("super kings"))       return "CSK";
  if (l.includes("knight riders"))     return "KKR";
  if (l.includes("rajasthan royals"))  return "RR";
  if (l.includes("delhi"))             return "DC";
  if (l.includes("punjab") || l.includes("kings xi")) return "PBKS";
  if (l.includes("gujarat"))           return "GT";
  if (l.includes("lucknow"))           return "LSG";
  // Fall back to Cricbuzz's own short name if available
  return null;
}

// ─── Response helpers ───────────────────────────────────────────────────────

/**
 * Flatten the deeply nested Cricbuzz response into a flat array of match
 * objects, injecting seriesName onto each so we can filter later.
 *
 * Structure: data.typeMatches[].seriesMatches[].seriesAdWrapper.matches[]
 */
export function extractAllMatches(data) {
  const out = [];
  for (const typeGroup of data?.typeMatches || []) {
    for (const sm of typeGroup?.seriesMatches || []) {
      // Some entries are "adDetail" (ads) rather than seriesAdWrapper
      const wrapper = sm?.seriesAdWrapper;
      if (!wrapper?.matches) continue;
      const seriesName = wrapper.seriesName || "";
      for (const m of wrapper.matches) {
        out.push({ ...m, _seriesName: seriesName });
      }
    }
  }
  return out;
}

/** Keep only IPL matches from a flat match array. */
export function filterIPL(matches) {
  return matches.filter(m => isIPLSeries(m._seriesName || m.matchInfo?.seriesName || ""));
}

/** Format a Cricbuzz innings object → "185/5 (20.0 ov)" or null. */
function fmtScore(inngs) {
  if (!inngs) return null;
  const runs = inngs.runs    ?? 0;
  const wkts = inngs.wickets ?? 0;
  const overs = parseFloat(inngs.overs ?? 0).toFixed(1);
  return `${runs}/${wkts} (${overs} ov)`;
}

/** Unix millisecond timestamp → "2026-03-28T14:00:00" (UTC, no ms). */
function tsToISO(msStr) {
  if (!msStr) return null;
  const ms = parseInt(msStr, 10);
  if (!ms) return null;
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, "");
}

/** Detect winner from status string, returns full team name or null. */
function detectWinner(status = "") {
  // Pattern: "<TeamName> won by ..."
  const m = status.match(/^(.+?)\s+won\s+by/i);
  return m ? m[1].trim() : null;
}

// ─── Normalize ──────────────────────────────────────────────────────────────

/**
 * Convert a raw Cricbuzz match object into the standard shape the app uses.
 * Mirrors the output of the old cricapi normalizeMatch() exactly.
 */
export function normalizeMatch(raw) {
  const info  = raw.matchInfo  || {};
  const score = raw.matchScore || {};

  // Teams
  const t1Name = info.team1?.teamName  || "Team 1";
  const t1Code = info.team1?.teamSName || resolveCode(t1Name) || "T1";
  const t2Name = info.team2?.teamName  || "Team 2";
  const t2Code = info.team2?.teamSName || resolveCode(t2Name) || "T2";

  // Scores (innings 1 of each team's score block)
  const t1Inns = score.team1Score?.inngs1 ?? null;
  const t2Inns = score.team2Score?.inngs1 ?? null;

  // Date / time
  const dateTimeGMT = tsToISO(info.startDate);
  const date        = dateTimeGMT ? dateTimeGMT.slice(0, 10) : null;

  // Match state — Cricbuzz uses `state`, not `status`, for machine-readable state
  const state  = (info.state  || "").toLowerCase();
  const status = info.status || "";

  const matchIsLive      = state === "in progress" || state === "toss";
  const matchIsCompleted = state === "complete"    || state === "abandon";
  const winner           = matchIsCompleted ? detectWinner(status) : null;

  // Chase stats (only meaningful in a live 2nd innings)
  let chaseStats = null;
  if (matchIsLive && t1Inns && t2Inns) {
    const target      = (t1Inns.runs ?? 0) + 1;
    const chased      = t2Inns.runs  ?? 0;
    const needed      = Math.max(target - chased, 0);
    const oversGone   = parseFloat(t2Inns.overs ?? 0);
    const remOvers    = Math.max(20 - oversGone, 0);
    if (oversGone > 0 && remOvers > 0) {
      chaseStats = {
        target,
        chased,
        needed,
        oversGone: +oversGone.toFixed(1),
        remainingOvers: +remOvers.toFixed(1),
        crr: +(chased / oversGone).toFixed(2),
        rrr: remOvers > 0 ? +(needed / remOvers).toFixed(2) : 0,
      };
    }
  }

  // Win probability — mirrors computeWinProb() logic using Cricbuzz score shape
  const prob = computeWinProbCricbuzz({ info, score, state });

  return {
    id:          String(info.matchId || Math.random()),
    name:        `${t1Name} vs ${t2Name}, ${info.matchDesc || ""}`.trim(),
    matchType:   (info.matchFormat || "T20").toLowerCase(),
    status,
    venue:       info.venueName || "",
    date,
    dateTimeGMT,
    team1:       { code: t1Code, name: t1Name, score: fmtScore(t1Inns) },
    team2:       { code: t2Code, name: t2Name, score: fmtScore(t2Inns) },
    prob,
    isLive:      matchIsLive,
    isCompleted: matchIsCompleted,
    winner,
    fantasyEnabled: false,
    seriesId:    String(info.seriesId || ""),
    chaseStats,
  };
}

// ─── Win probability (adapted for Cricbuzz score shape) ─────────────────────

function computeWinProbCricbuzz({ info, score, state }) {
  const t1Inns = score.team1Score?.inngs1;
  const t2Inns = score.team2Score?.inngs1;
  const maxOvers = 20;
  const parScore = 160;

  if (state === "complete" || state === "abandon") {
    const status = (info.status || "").toLowerCase();
    if (status.includes(((info.team1?.teamName) || "").toLowerCase())) return [100, 0];
    if (status.includes(((info.team2?.teamName) || "").toLowerCase())) return [0, 100];
    return [50, 50];
  }

  // 1st innings only
  if (t1Inns && !t2Inns) {
    const r = t1Inns.runs ?? 0;
    const w = t1Inns.wickets ?? 0;
    const o = parseFloat(t1Inns.overs ?? 0);
    if (o < 0.1) return [50, 50];
    const projected  = (r / o) * maxOvers;
    const adjusted   = Math.max(projected - w * 8, r + 5);
    const delta      = (adjusted - parScore) / parScore;
    const battingAdv = Math.min(Math.max(52 + delta * 22, 34), 70);
    return [Math.round(battingAdv), Math.round(100 - battingAdv)];
  }

  // 2nd innings
  if (t1Inns && t2Inns) {
    const target       = (t1Inns.runs ?? 0) + 1;
    const chased       = t2Inns.runs    ?? 0;
    const needed       = Math.max(target - chased, 0);
    const oversGone    = parseFloat(t2Inns.overs   ?? 0);
    const remainOvers  = Math.max(maxOvers - oversGone, 0.1);
    const remainWkts   = 10 - (t2Inns.wickets ?? 0);
    if (needed <= 0) return [0, 100]; // chasing team won
    if (remainWkts <= 0) return [100, 0];
    const rrr      = needed / remainOvers;
    const crr      = oversGone > 0 ? chased / oversGone : 0;
    const rrRatio  = crr > 0 ? crr / rrr : 0.5;
    const wktBonus = remainWkts / 10;
    const chasingProb = Math.min(Math.max((rrRatio * 0.52 + wktBonus * 0.48) * 58, 15), 85);
    return [Math.round(100 - chasingProb), Math.round(chasingProb)];
  }

  return [50, 50];
}

// ─── Deterministic prediction seed (unchanged from cricapi.js) ───────────────

export function seedPrediction(matchId, teamNames) {
  let hash = 0;
  const str = String(matchId) + teamNames.join("|");
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  const pct  = 55 + (Math.abs(hash) % 26);   // 55–80 %
  const pick = hash % 2 === 0 ? 0 : 1;
  return {
    predictedTeam: teamNames[pick] || teamNames[0],
    confidence:    pct,
    prob:          pick === 0 ? [pct, 100 - pct] : [100 - pct, pct],
  };
}

// ─── API fetch functions ─────────────────────────────────────────────────────

/**
 * Fetch live IPL matches.
 * Cached for 60 seconds — live scores change every ball.
 */
export async function fetchLiveIPLMatches(apiKey) {
  const url  = `${CRICBUZZ_BASE}/matches/v1/live`;
  const json = await cachedFetch(url, apiKey, 60);
  const all  = extractAllMatches(json);
  return { data: filterIPL(all), raw: json };
}

/**
 * Fetch upcoming IPL matches.
 * Cached for 10 minutes — schedule rarely changes.
 */
export async function fetchUpcomingIPLMatches(apiKey) {
  const url  = `${CRICBUZZ_BASE}/matches/v1/upcoming`;
  const json = await cachedFetch(url, apiKey, 600);
  const all  = extractAllMatches(json);
  return { data: filterIPL(all), raw: json };
}

/**
 * Fetch recently completed IPL matches.
 * Cached for 5 minutes.
 */
export async function fetchRecentIPLMatches(apiKey) {
  const url  = `${CRICBUZZ_BASE}/matches/v1/recent`;
  const json = await cachedFetch(url, apiKey, 300);
  const all  = extractAllMatches(json);
  return { data: filterIPL(all), raw: json };
}
