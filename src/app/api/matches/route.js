import { fetchMatches } from "@/lib/api";
import { matches as demoMatches } from "@/data/matches";

export async function GET() {
  try {
    // Try real API first
    const liveMatches = await fetchMatches();

    if (liveMatches.length > 0) {
      return Response.json({ data: liveMatches, source: "live" });
    }

    // Fall back to demo data
    return Response.json({ data: demoMatches, source: "demo" });
  } catch (error) {
    console.error("Matches API error:", error);
    return Response.json({ data: demoMatches, source: "demo" });
  }
}
