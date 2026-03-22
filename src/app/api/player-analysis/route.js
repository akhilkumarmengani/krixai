/**
 * PLAYER ANALYSIS API ROUTE
 * ══════════════════════════
 * Server-side endpoint for AI player analysis.
 * Called from the player profile page (/player/[name]).
 * Uses generatePlayerAnalysis from ai.js (Sonnet for deep quality).
 */

import { generatePlayerAnalysis } from "@/lib/ai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { playerName, recentStats } = body;

    if (!playerName) {
      return Response.json({ success: false, text: "Missing player name." }, { status: 400 });
    }

    const result = await generatePlayerAnalysis(playerName, recentStats || {});
    return Response.json(result);
  } catch (error) {
    console.error("Player analysis error:", error);
    return Response.json(
      { success: false, text: "Player analysis unavailable. Please try again." },
      { status: 500 }
    );
  }
}
