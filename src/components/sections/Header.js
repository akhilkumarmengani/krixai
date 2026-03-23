"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { getTeam } from "@/data/teams";

// ── Shared ball-style map ───────────────────────────────────────────────────
const BALL_STYLE = {
  dot:    { background: "#f0f0f0", color: "#888" },
  run:    { background: "#e8f0ff", color: "#003DA5" },
  four:   { background: "#003DA5", color: "#fff" },
  wicket: { background: "#dc2626", color: "#fff" },
  six:    { background: "#FF6B00", color: "#fff" },
};

// Deterministic demo balls seeded from match id so they don't flicker
function getDemoBalls(matchId) {
  const types = ["dot", "run", "four", "dot", "wicket", "six"];
  return types.map((type, i) => ({
    type,
    label: { dot: "·", run: "1", four: "4", wicket: "W", six: "6" }[type],
  }));
}

// ── Live Match Card ─────────────────────────────────────────────────────────
function LiveMatchCard({ match, loading }) {
  const { tokens: tk } = useTheme();

  if (loading) {
    return (
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 2px 24px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.06)",
          overflow: "hidden",
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#bbb" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "3px solid #e0e0e0",
              borderTopColor: "#003DA5",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 10px",
            }}
          />
          <div style={{ fontSize: 13, fontWeight: 500 }}>Loading IPL match…</div>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const t1 = getTeam(match.team1?.code || match.t1);
  const t2 = getTeam(match.team2?.code || match.t2);

  // Normalise: support both new (team1/team2) and legacy (t1/t2) shapes
  const team1Code  = match.team1?.code  || match.t1;
  const team2Code  = match.team2?.code  || match.t2;
  const team1Score = match.team1?.score || null;
  const team2Score = match.team2?.score || null;
  const prob       = match.prob || [50, 50];
  const status     = match.status || "";
  const venue      = match.venue  || "";
  const date       = match.date   || "";
  const isLive     = match.isLive;
  const chaseStats = match.chaseStats || null;

  // Badge label
  const badgeLabel = isLive
    ? "LIVE"
    : (match.badge || (status.includes("not started") ? "UPCOMING" : "TODAY"));

  const hasScore   = team1Score || team2Score;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 24px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.06)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Top gradient bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${t1.color}, ${t2.color})` }} />

      <div style={{ padding: "22px 26px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: isLive ? "#fff0e6" : "#f0f4ff",
              borderRadius: 100, padding: "4px 10px",
            }}
          >
            <div
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: isLive ? "#FF6B00" : "#003DA5",
                animation: isLive ? "livePulse 2s infinite" : "none",
              }}
            />
            <span
              style={{
                fontSize: 11, fontWeight: 700,
                color: isLive ? "#FF6B00" : "#003DA5",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}
            >
              {badgeLabel}
            </span>
          </div>
          <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>
            {date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
            {venue ? ` · ${venue.split(",")[0]}` : ""}
          </span>
        </div>

        {/* Teams + scores row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          {/* Team 1 */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 14,
                background: t1.color, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: "#fff",
                margin: "0 auto 6px",
                boxShadow: `0 4px 12px ${t1.color}40`,
              }}
            >
              {team1Code}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
              {t1.name.split(" ").slice(-1)[0]}
            </div>
            {team1Score && (
              <div style={{ fontSize: 13, fontWeight: 700, color: t1.color, marginTop: 3 }}>
                {team1Score}
              </div>
            )}
          </div>

          {/* VS divider */}
          <div style={{ textAlign: "center", padding: "0 10px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#bbb" }}>VS</div>
          </div>

          {/* Team 2 */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 14,
                background: t2.color, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800, color: "#fff",
                margin: "0 auto 6px",
                boxShadow: `0 4px 12px ${t2.color}40`,
              }}
            >
              {team2Code}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.02em" }}>
              {t2.name.split(" ").slice(-1)[0]}
            </div>
            {team2Score && (
              <div style={{ fontSize: 13, fontWeight: 700, color: t2.color, marginTop: 3 }}>
                {team2Score}
              </div>
            )}
          </div>
        </div>

        {/* Live status string */}
        {isLive && status && (
          <div
            style={{
              fontSize: 12, color: "#555", fontWeight: 500,
              background: "#fafafa", borderRadius: 8, padding: "7px 10px",
              marginBottom: 12, lineHeight: 1.4,
              borderLeft: "3px solid #FF6B00",
            }}
          >
            {status}
          </div>
        )}

        {/* Win probability bar */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex", justifyContent: "space-between",
              fontSize: 11, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 7,
            }}
          >
            <span style={{ color: t1.color }}>{team1Code} · Win Prob</span>
            <span style={{ color: t2.color }}>{team2Code}</span>
          </div>
          <div
            style={{
              height: 8, background: "#f0f0f0", borderRadius: 100,
              overflow: "hidden", display: "flex",
            }}
          >
            <div
              style={{
                width: `${prob[0]}%`, background: t1.color,
                borderRadius: "100px 0 0 100px",
                transition: "width 0.8s ease",
              }}
            />
            <div
              style={{
                width: `${prob[1]}%`, background: t2.color,
                borderRadius: "0 100px 100px 0",
                transition: "width 0.8s ease",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, marginTop: 5 }}>
            <span style={{ color: t1.color }}>{prob[0]}%</span>
            <span style={{ color: t2.color }}>{prob[1]}%</span>
          </div>
        </div>

        {/* Chase stats (if 2nd innings live) */}
        {chaseStats && (
          <div
            style={{
              display: "flex", gap: 0,
              background: "#f7f8ff", borderRadius: 10, overflow: "hidden",
              marginBottom: 12,
            }}
          >
            {[
              { label: "Target", value: chaseStats.target },
              { label: "Need",   value: `${chaseStats.needed} (${chaseStats.remainingOvers?.toFixed(1)} ov)` },
              { label: "CRR",    value: chaseStats.crr?.toFixed(2) },
              { label: "RRR",    value: chaseStats.rrr?.toFixed(2) },
            ].map((item, i, arr) => (
              <div
                key={i}
                style={{
                  flex: 1, textAlign: "center", padding: "8px 4px",
                  borderRight: i < arr.length - 1 ? "1px solid #eef0ff" : "none",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 800, color: "#003DA5" }}>{item.value}</div>
                <div style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Last 6 balls (demo – until BBB paid tier) */}
        {!chaseStats && (
          <div style={{ marginBottom: 4 }}>
            <div
              style={{
                fontSize: 11, fontWeight: 700, color: "#888",
                textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8,
              }}
            >
              {hasScore ? "Recent Play" : "Last 6 Balls"}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {getDemoBalls(match.id).map((b, i) => (
                <div
                  key={i}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 800,
                    ...BALL_STYLE[b.type],
                  }}
                >
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0f0f0",
          }}
        >
          <div style={{ fontSize: 12, color: "#888" }}>
            {venue.split(",")[0]} · IPL 2026
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#FF6B00", cursor: "pointer" }}>
            Full Analysis →
          </span>
        </div>
      </div>
    </div>
  );
}

// ── AI Insight Card ─────────────────────────────────────────────────────────
function AiInsightCard({ match, loading }) {
  const { tokens: tk } = useTheme();

  // Generate a contextual insight from match data
  function buildInsight(m) {
    if (!m) return "Analysing match conditions…";
    const t1 = getTeam(m.team1?.code || m.t1);
    const cs = m.chaseStats;
    if (cs && m.isLive) {
      const behind = cs.rrr > cs.crr;
      const venue  = (m.venue || "").split(",")[0];
      return `${behind ? `${m.team1?.code || m.t1} need ${cs.rrr?.toFixed(1)} RPO — significantly above their current ${cs.crr?.toFixed(1)}. Wickets in hand remain the key variable.` : `Strong chase in progress. ${m.team1?.code || m.t1} are ahead of the required rate — KrixAI gives them ${m.prob?.[0] || 50}% win probability.`}`;
    }
    return `${t1.name}'s spin attack will be key in the middle overs — 73% of T20s at this venue see acceleration after over 12. Watch the powerplay momentum.`;
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 1px 12px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        opacity: loading ? 0.6 : 1,
        transition: "opacity 0.3s",
      }}
    >
      <div
        style={{
          width: 32, height: 32, background: "#003DA5", borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 14, color: "#fff", fontWeight: 800,
        }}
      >
        ✦
      </div>
      <div>
        <div
          style={{
            fontSize: 10, fontWeight: 700, color: "#FF6B00",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3,
          }}
        >
          KrixAI Live Insight
        </div>
        <div style={{ fontSize: 13, color: "#333", fontWeight: 500, lineHeight: 1.45 }}>
          {buildInsight(match)}
        </div>
      </div>
    </div>
  );
}

// ── Scrolling Ticker ─────────────────────────────────────────────────────────
function Ticker({ items }) {
  return (
    <div
      style={{
        overflow: "hidden",
        background: "rgba(0,61,165,0.04)",
        borderTop: "1px solid rgba(0,61,165,0.08)",
        borderBottom: "1px solid rgba(0,61,165,0.08)",
      }}
    >
      <div
        style={{
          display: "flex", gap: 40, padding: "8px 0",
          whiteSpace: "nowrap",
          animation: "tickerScroll 30s linear infinite",
          width: "max-content",
        }}
      >
        {[...items, ...items].map((s, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: 500, color: "#666", letterSpacing: 0.3 }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Header ──────────────────────────────────────────────────────────────
export default function Header({ onTabChange }) {
  const {
    tokens: tk,
    tournament: T,
    tournamentId,
    setTournament,
    allTournaments,
  } = useTheme();

  const [matchData, setMatchData]   = useState(null);
  const [loadingMatch, setLoading]  = useState(true);

  // Fetch live IPL match data on mount (and every 60s for live matches)
  useEffect(() => {
    let isMounted = true;
    let intervalId;

    async function load() {
      try {
        const res  = await fetch("/api/ipl", { cache: "no-store" });
        const json = await res.json();
        if (isMounted) {
          setMatchData(json.current || null);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    load();

    // Poll every 60s if we have a live match
    intervalId = setInterval(() => {
      if (matchData?.isLive) load();
    }, 60_000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header style={{ background: "#f7f7f5", position: "relative", overflow: "hidden" }}>
      {/* Dot-grid background */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
          backgroundSize: "28px 28px", opacity: 0.4, pointerEvents: "none",
        }}
      />
      {/* India Blue glow top-right */}
      <div
        style={{
          position: "absolute", top: -120, right: -120,
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,61,165,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Saffron glow bottom-left */}
      <div
        style={{
          position: "absolute", bottom: -80, left: -80,
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 10 }}>
        {/* ── Sticky Nav ── */}
        <div
          style={{
            background: "rgba(247,247,245,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            position: "sticky", top: 0, zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: tk.layout.maxWidth + 80,
              margin: "0 auto",
              padding: `0 ${tk.spacing.xxxl}px`,
              height: 60,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img src="/icon.svg" alt="KrixAI" style={{ width: 30, height: 30, borderRadius: 7 }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#0a0a0a", letterSpacing: "-0.03em", fontFamily: tk.fontFamily }}>
                  Krix
                </span>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#FF6B00", letterSpacing: "-0.03em", fontFamily: tk.fontFamily }}>
                  AI
                </span>
              </div>
            </div>

            {/* Tournament switcher */}
            <div
              style={{
                display: "flex", gap: 4,
                background: "rgba(0,0,0,0.05)", borderRadius: 100, padding: 4,
              }}
            >
              {Object.values(allTournaments).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTournament(t.id)}
                  style={{
                    fontFamily: tk.fontFamily,
                    fontSize: 13,
                    fontWeight: tournamentId === t.id ? 600 : 400,
                    padding: "6px 16px", borderRadius: 100, border: "none",
                    cursor: "pointer",
                    background: tournamentId === t.id ? "#fff" : "transparent",
                    color:      tournamentId === t.id ? "#FF6B00" : "#666",
                    boxShadow:  tournamentId === t.id ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {t.short}
                </button>
              ))}
            </div>

            {/* Right: Ask AI + Get Started */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => onTabChange("chat")}
                style={{
                  fontFamily: tk.fontFamily, fontSize: 14, fontWeight: 500,
                  color: "#444", background: "transparent", border: "none", cursor: "pointer",
                }}
              >
                Ask AI
              </button>
              <button
                onClick={() => onTabChange("matches")}
                style={{
                  fontFamily: tk.fontFamily, fontSize: 14, fontWeight: 700,
                  padding: "9px 20px", borderRadius: 8, border: "none",
                  background: "#FF6B00", color: "#fff", cursor: "pointer",
                  letterSpacing: "-0.01em", transition: "background 0.15s",
                }}
              >
                Get Started →
              </button>
            </div>
          </div>
        </div>

        {/* ── Split Hero ── */}
        <div
          style={{
            maxWidth: tk.layout.maxWidth + 80,
            margin: "0 auto",
            padding: "56px 32px 48px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
            minHeight: "calc(100vh - 102px)",
          }}
        >
          {/* Left: Headline + CTAs */}
          <div>
            {/* Badge pill */}
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#fff", border: "1px solid #e0e0e0", borderRadius: 100,
                padding: "5px 14px 5px 7px",
                fontSize: 12, fontWeight: 600, color: "#444",
                letterSpacing: "0.04em", textTransform: "uppercase",
                marginBottom: 26, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                fontFamily: tk.fontFamily,
              }}
            >
              <div
                style={{
                  width: 20, height: 20, background: "#FF6B00",
                  borderRadius: "50%", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 9, color: "#fff", fontWeight: 800,
                }}
              >
                AI
              </div>
              {T.short} · Powered by Artificial Intelligence
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(42px, 5.5vw, 70px)", fontWeight: 900,
                lineHeight: 1.0, letterSpacing: "-0.04em",
                color: "#0a0a0a", margin: "0 0 4px", fontFamily: tk.fontFamily,
              }}
            >
              Cricket
              <br />
              Intelligence,
            </h1>
            <h1
              style={{
                fontSize: "clamp(42px, 5.5vw, 70px)", fontWeight: 900,
                lineHeight: 1.0, letterSpacing: "-0.04em",
                color: "#FF6B00", margin: "0 0 22px", fontFamily: tk.fontFamily,
              }}
            >
              Decoded by AI.
            </h1>

            <p
              style={{
                fontSize: 17, color: "#555", lineHeight: 1.6,
                maxWidth: 440, marginBottom: 34, letterSpacing: "-0.01em",
                fontFamily: tk.fontFamily,
              }}
            >
              Real-time match predictions, player analysis, and tactical
              breakdowns — powered by AI trained on every {T.short} ball
              ever bowled.
            </p>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 30, flexWrap: "wrap" }}>
              {[
                { icon: "🧠", label: "AI Predictions" },
                { icon: "📊", label: "Live Analytics" },
                { icon: "⚡", label: "Real-time" },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 8,
                    background: "#fff", border: "1px solid #ebebeb",
                    fontSize: 13, fontWeight: 600, color: "#444",
                    fontFamily: tk.fontFamily,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <span>{f.icon}</span>
                  {f.label}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                onClick={() => onTabChange("matches")}
                style={{
                  fontFamily: tk.fontFamily, fontSize: 15, fontWeight: 700,
                  padding: "13px 26px", borderRadius: 10, border: "none",
                  background: "#FF6B00", color: "#fff", cursor: "pointer",
                  letterSpacing: "-0.02em",
                  boxShadow: "0 4px 14px rgba(255,107,0,0.35)",
                  transition: "background 0.15s",
                }}
              >
                Explore {T.short} →
              </button>
              <button
                onClick={() => onTabChange("chat")}
                style={{
                  fontFamily: tk.fontFamily, fontSize: 15, fontWeight: 600,
                  padding: "12px 22px", borderRadius: 10, cursor: "pointer",
                  background: "#fff", color: "#0a0a0a", border: "1.5px solid #ddd",
                  letterSpacing: "-0.02em",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "border-color 0.15s",
                }}
              >
                <span style={{ color: "#003DA5", fontWeight: 800 }}>✦</span>
                Ask KrixAI
              </button>
            </div>
          </div>

          {/* Right: Live match card + AI insight */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <LiveMatchCard match={matchData} loading={loadingMatch} />
            <AiInsightCard match={matchData} loading={loadingMatch} />
          </div>
        </div>

        {/* ── Ticker ── */}
        <Ticker
          items={[
            "🏏 74 IPL 2026 Matches",
            "⭐ 10 Franchises",
            "🎯 AI Predictions Live",
            "📊 Ball-by-Ball Analysis",
            "🔥 Season 19",
            "💡 Smart Fantasy Tips",
            "🏟️ 18 Venues",
            "⚡ Real-time Intelligence",
            "📈 Win Probability",
            "🤖 Powered by AI",
            `🏆 ${T.short}`,
            "🎪 March 22 – May 25 · 2026",
          ]}
        />
      </div>
    </header>
  );
}
