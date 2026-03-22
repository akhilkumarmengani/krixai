/**
 * CRICMIND AI SERVICE
 * ════════════════════
 * Handles AI-powered analysis via Claude API.
 *
 * COST STRATEGY (important!):
 * ───────────────────────────
 * Your $20/month Claude Pro plan is for YOU chatting on claude.ai.
 * The API is a SEPARATE product, billed per token (pay-as-you-go).
 *
 * We use a TIERED MODEL approach to minimize costs:
 *   - Haiku 4.5 ($1/$5 per MTok) → chat, quick Q&A, simple analysis
 *   - Sonnet 4.6 ($3/$15 per MTok) → deep match analysis, detailed player reports
 *
 * Estimated costs:
 *   100 chats/day for 60 days (IPL season) ≈ $12 total on Haiku
 *   Add 10 deep analyses/day on Sonnet ≈ $30 total
 *   TOTAL IPL SEASON COST: ~$40-50
 *
 * SETUP:
 * 1. Go to https://console.anthropic.com
 * 2. Create account + add payment method (separate from your Pro plan)
 * 3. Generate an API key
 * 4. Add to .env.local: ANTHROPIC_API_KEY=sk-ant-xxxxx
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Model selection — change these to adjust cost/quality tradeoff
const MODELS = {
  fast: "claude-haiku-4-5-20251001",   // $1/$5 per MTok — for chat, quick Q&A
  deep: "claude-sonnet-4-6",            // $3/$15 per MTok — for detailed analysis
};

// System prompt (shared across all calls — keep it concise to save tokens)
const SYSTEM_PROMPT = `You are CricMind AI, an expert cricket analyst specializing in IPL and T20 cricket. You have deep knowledge of player stats, venue conditions, tactical patterns, and historical data. Answer with specific numbers, percentages, and comparisons. Be concise (2-3 short paragraphs max). Never make up statistics — if unsure, say so.`;

/**
 * Generate AI analysis for a match (uses DEEP model for quality)
 */
export async function generateMatchAnalysis(matchData) {
  const prompt = `Analyze this IPL match: ${matchData.team1} vs ${matchData.team2} at ${matchData.venue} on ${matchData.date}. Give: win prediction with %, key matchups, venue factors, and one tactical insight.`;
  return callClaude(prompt, MODELS.deep);
}

/**
 * Generate AI player analysis (uses DEEP model)
 */
export async function generatePlayerAnalysis(playerName, recentStats) {
  const prompt = `Analyze ${playerName} for IPL 2026. Recent: ${JSON.stringify(recentStats)}. Give: form rating /100, T20 strengths/weaknesses, key matchups, fantasy recommendation. Be specific with stats.`;
  return callClaude(prompt, MODELS.deep);
}

/**
 * AI Chat — answer any cricket question (uses FAST model to save cost)
 */
export async function chatWithAI(userMessage, conversationHistory = []) {
  const messages = [
    ...conversationHistory.slice(-6).map(msg => ({  // Only keep last 6 messages to save tokens
      role: msg.from === "user" ? "user" : "assistant",
      content: msg.text,
    })),
    { role: "user", content: userMessage },
  ];

  return callClaude(null, MODELS.fast, messages);
}

/**
 * Internal: Call Claude API
 */
async function callClaude(prompt, model, messages = null) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    return {
      success: true,
      text: "📊 [Demo Mode] Configure your Anthropic API key in .env.local to enable live AI analysis. Get one at console.anthropic.com (separate from your Claude Pro subscription).",
      isDemo: true,
    };
  }

  try {
    const body = {
      model: model,
      max_tokens: 512,  // Keep responses concise to save cost
      system: SYSTEM_PROMPT,
      messages: messages || [{ role: "user", content: prompt }],
    };

    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.content && data.content[0]) {
      return { success: true, text: data.content[0].text, isDemo: false };
    }

    return { success: false, text: "AI analysis unavailable. Please try again.", isDemo: false };
  } catch (error) {
    console.error("Claude API error:", error);
    return { success: false, text: "AI analysis unavailable. Please try again.", isDemo: false };
  }
}
