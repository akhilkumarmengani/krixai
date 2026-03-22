/**
 * CRICMIND API LAYER
 * ═══════════════════
 * Handles all external API calls.
 *
 * Phase 1 (MVP): CricketData.org
 * Phase 2: Switch to Roanuz Cricket API
 *
 * SETUP:
 * 1. Sign up at https://cricketdata.org
 * 2. Get your API key
 * 3. Add to .env.local: CRICKET_API_KEY=your_key_here
 */

const CRICKET_API_BASE = "https://api.cricapi.com/v1";
const API_KEY = process.env.CRICKET_API_KEY || "YOUR_API_KEY_HERE";

/**
 * Fetch current/recent matches
 */
export async function fetchMatches() {
  try {
    const res = await fetch(
      `${CRICKET_API_BASE}/currentMatches?apikey=${API_KEY}&offset=0`
    );
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return [];
  }
}

/**
 * Fetch match scorecard
 */
export async function fetchScorecard(matchId) {
  try {
    const res = await fetch(
      `${CRICKET_API_BASE}/match_scorecard?apikey=${API_KEY}&id=${matchId}`
    );
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error("Failed to fetch scorecard:", error);
    return null;
  }
}

/**
 * Fetch match info
 */
export async function fetchMatchInfo(matchId) {
  try {
    const res = await fetch(
      `${CRICKET_API_BASE}/match_info?apikey=${API_KEY}&id=${matchId}`
    );
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error("Failed to fetch match info:", error);
    return null;
  }
}

/**
 * Fetch player info
 */
export async function fetchPlayerInfo(playerId) {
  try {
    const res = await fetch(
      `${CRICKET_API_BASE}/players_info?apikey=${API_KEY}&id=${playerId}`
    );
    const data = await res.json();
    return data.data || null;
  } catch (error) {
    console.error("Failed to fetch player:", error);
    return null;
  }
}

/**
 * Search players
 */
export async function searchPlayers(query) {
  try {
    const res = await fetch(
      `${CRICKET_API_BASE}/players?apikey=${API_KEY}&offset=0&search=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to search players:", error);
    return [];
  }
}

/**
 * Fetch series/tournament list
 */
export async function fetchSeries() {
  try {
    const res = await fetch(
      `${CRICKET_API_BASE}/series?apikey=${API_KEY}&offset=0`
    );
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("Failed to fetch series:", error);
    return [];
  }
}
