/**
 * One-time script: fetch the full IPL 2026 schedule from Cricbuzz (RapidAPI)
 * and save it as a static JSON file so the app never needs to hit the API
 * for upcoming match lookups.
 *
 * Run from project root:
 *   RAPIDAPI_KEY=your_key node scripts/fetch-ipl-schedule.mjs
 *
 * Output: src/data/ipl2026-schedule.json
 * Commit that file — the app reads it directly at runtime.
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY   = process.env.RAPIDAPI_KEY;
const HOST      = "cricbuzz-cricket.p.rapidapi.com";
const BASE_URL  = `https://${HOST}`;
const OUT_PATH  = path.join(__dirname, "../src/data/ipl2026-schedule.json");

if (!API_KEY) {
  console.error("❌  Set RAPIDAPI_KEY environment variable first.");
  console.error("    Example: RAPIDAPI_KEY=abc123 node scripts/fetch-ipl-schedule.mjs");
  process.exit(1);
}

const HEADERS = {
  "X-RapidAPI-Key":  API_KEY,
  "X-RapidAPI-Host": HOST,
};

// ── IPL series detection ─────────────────────────────────────────────────────

function isIPLSeries(name = "") {
  const s = name.toLowerCase();
  return s.includes("indian premier league") || s.includes(" ipl ") ||
         s.startsWith("ipl ") || s.endsWith(" ipl") || s === "ipl";
}

// ── Flatten Cricbuzz nested response ────────────────────────────────────────

function extractMatches(data) {
  const out = [];
  for (const typeGroup of data?.typeMatches || []) {
    for (const sm of typeGroup?.seriesMatches || []) {
      const wrapper = sm?.seriesAdWrapper;
      if (!wrapper?.matches) continue;
      for (const m of wrapper.matches) {
        out.push({ ...m, _seriesName: wrapper.seriesName || "" });
      }
    }
  }
  return out;
}

function filterIPL(matches) {
  return matches.filter(m => isIPLSeries(m._seriesName || m.matchInfo?.seriesName || ""));
}

// ── Fetch helpers ────────────────────────────────────────────────────────────

async function fetchEndpoint(path) {
  const url = `${BASE_URL}${path}`;
  console.log(`  GET ${url}`);
  const res  = await fetch(url, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return res.json();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏏  Fetching IPL 2026 schedule from Cricbuzz (RapidAPI)…\n");

  const seen = new Set();
  const all  = [];

  function addMatches(matches) {
    for (const m of matches) {
      const id = String(m.matchInfo?.matchId || Math.random());
      if (!seen.has(id)) {
        seen.add(id);
        all.push(m);
      }
    }
  }

  // Fetch all three endpoints to get the full season picture
  for (const endpoint of ["/matches/v1/upcoming", "/matches/v1/live", "/matches/v1/recent"]) {
    try {
      const data = await fetchEndpoint(endpoint);
      const iplMatches = filterIPL(extractMatches(data));
      console.log(`  ${endpoint} → ${iplMatches.length} IPL match(es) found`);
      addMatches(iplMatches);
    } catch (err) {
      console.warn(`  ⚠️  ${endpoint} failed: ${err.message}`);
    }
  }

  // Sort by startDate ascending
  all.sort((a, b) =>
    parseInt(a.matchInfo?.startDate || 0) - parseInt(b.matchInfo?.startDate || 0)
  );

  // Write output
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  const output = {
    fetchedAt:  new Date().toISOString(),
    season:     "IPL 2026",
    source:     "Cricbuzz via RapidAPI",
    matchCount: all.length,
    matches:    all,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));

  console.log(`\n✅  Saved ${all.length} IPL matches to src/data/ipl2026-schedule.json`);
  console.log("    Commit this file and push — the app will use it for upcoming match lookups.\n");

  // Print a preview
  console.log("Preview (first 5 matches):");
  for (const m of all.slice(0, 5)) {
    const t1    = m.matchInfo?.team1?.teamSName || m.matchInfo?.team1?.teamName || "?";
    const t2    = m.matchInfo?.team2?.teamSName || m.matchInfo?.team2?.teamName || "?";
    const ms    = parseInt(m.matchInfo?.startDate || 0);
    const date  = ms ? new Date(ms).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "?";
    const venue = m.matchInfo?.venueName || "?";
    console.log(`  ${t1} vs ${t2}  —  ${date}  —  ${venue}`);
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
