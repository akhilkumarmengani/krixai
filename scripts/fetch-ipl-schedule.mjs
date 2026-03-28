/**
 * One-time script: fetch the full IPL 2026 schedule from CricAPI and save
 * it as a static JSON file so the app never needs to hit the API for
 * upcoming match lookups.
 *
 * Run from project root:
 *   CRICKET_API_KEY=your_key node scripts/fetch-ipl-schedule.mjs
 *
 * Output: src/data/ipl2026-schedule.json
 * Commit that file — the app will use it as the schedule source of truth.
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY   = process.env.CRICKET_API_KEY;
const BASE_URL  = "https://api.cricapi.com/v1";
const OUT_PATH  = path.join(__dirname, "../src/data/ipl2026-schedule.json");

// ── IPL team detection ───────────────────────────────────────────────────────
// Same team list as cricapi.js so filtering is consistent.
const IPL_TEAMS = new Set([
  "Chennai Super Kings",
  "Mumbai Indians",
  "Royal Challengers Bengaluru",
  "Royal Challengers Bangalore",
  "Kolkata Knight Riders",
  "Sunrisers Hyderabad",
  "Delhi Capitals",
  "Rajasthan Royals",
  "Punjab Kings",
  "Gujarat Titans",
  "Lucknow Super Giants",
  "Punjab Kings",
]);

function isIPLMatch(match) {
  const teams = match.teams || [];
  // At least one team must be an IPL team (handles partial data)
  return teams.some(t => IPL_TEAMS.has(t));
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchPage(offset) {
  const url = `${BASE_URL}/matches?apikey=${API_KEY}&offset=${offset}`;
  console.log(`  GET ${url.replace(API_KEY, "***")}`);
  const res  = await fetch(url);
  const json = await res.json();
  return json;
}

async function main() {
  if (!API_KEY) {
    console.error("❌  Set CRICKET_API_KEY environment variable first.");
    console.error("    Example: CRICKET_API_KEY=abc123 node scripts/fetch-ipl-schedule.mjs");
    process.exit(1);
  }

  console.log("🏏  Fetching IPL 2026 schedule from CricAPI…\n");

  const allIPL = [];
  const seen   = new Set();
  let offset   = 0;
  let emptyPages = 0;

  while (true) {
    const json = await fetchPage(offset);

    if (json.status !== "success") {
      console.error(`\n❌  API error at offset ${offset}:`, json.status, json.reason || "");
      console.error("    Saving what we have so far…");
      break;
    }

    const matches = json.data || [];
    console.log(`  offset=${offset} → ${matches.length} total, API hits today: ${json.info?.hitsToday ?? "?"}`);

    if (matches.length === 0) break;

    let newIPL = 0;
    for (const m of matches) {
      if (!seen.has(m.id) && isIPLMatch(m)) {
        seen.add(m.id);
        allIPL.push(m);
        newIPL++;
      }
    }

    console.log(`  → ${newIPL} new IPL match(es) found (running total: ${allIPL.length})`);

    // Stop if the page had no new IPL matches twice in a row (we've gone past the season)
    if (newIPL === 0) {
      emptyPages++;
      if (emptyPages >= 2) {
        console.log("\n  No more IPL matches found in two consecutive pages — stopping.");
        break;
      }
    } else {
      emptyPages = 0;
    }

    if (matches.length < 25) break;     // Last page
    if (offset >= 250) break;            // Safety limit

    offset += 25;
    await sleep(600);                    // Respect rate limit (~100 req/min)
  }

  // Sort by date ascending
  allIPL.sort((a, b) => new Date(a.dateTimeGMT || a.date) - new Date(b.dateTimeGMT || b.date));

  // Write output
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  const output = {
    fetchedAt:  new Date().toISOString(),
    season:     "IPL 2026",
    matchCount: allIPL.length,
    matches:    allIPL,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));

  console.log(`\n✅  Saved ${allIPL.length} IPL matches to src/data/ipl2026-schedule.json`);
  console.log("    Commit this file and push — the app will use it for schedule lookups.");
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
