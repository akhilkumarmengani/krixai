/**
 * MATCH ANALYSIS API ROUTE
 * ════════════════════════
 * Server-side endpoint for AI match analysis.
 * Called from the match detail page (/match/[id]).
 * Uses generateMatchAnalysis from ai.js (Sonnet for deep quality).
 */

import { generateMatchAnalysis } from "@/lib/ai";

export async function POST(request) {
  try {
    const body = await request.json();
    const { team1, team2, venue, date } = body;

    if (!team1 || !team2) {
      return Response.json({ success: false, text: "Missing match data." }, { status: 400 });
    }

    const result = await generateMatchAnalysis({ team1, team2, venue, date });
    return Response.json(result);
  } catch (error) {
    console.error("Match analysis error:", error);
    return Response.json(
      { success: false, text: "Match analysis unavailable. Please try again." },
      { status: 500 }
    );
  }
}
