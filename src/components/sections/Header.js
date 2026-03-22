"use client";

import { useTheme } from "@/context/ThemeContext";
import { matches } from "@/data/matches";
import { getTeam } from "@/data/teams";

// ── Live Match Card (hero right side) ──────────────────────────────────────
function LiveMatchCard({ match }) {
  const { tokens: tk, tournament: T } = useTheme();
  const t1 = getTeam(match.t1);
  const t2 = getTeam(match.t2);

  const lastBalls = [
    { type: "dot",    label: "·" },
    { type: "run",    label: "1" },
    { type: "four",   label: "4" },
    { type: "dot",    label: "·" },
    { type: "wicket", label: "W" },
    { type: "six",    label: "6" },
  ];

  const ballStyle = {
    dot:    { background: "#f0f0f0", color: "#888" },
    run:    { background: "#e8f0ff", color: "#003DA5" },
    four:   { background: "#003DA5", color: "#fff" },
    wicket: { background: "#dc2626", color: "#fff" },
    six:    { background: "#FF6B00", color: "#fff" },
  };

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
      {/* Top gradient bar using team colors */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${t1.color}, ${t2.color})` }} />

      <div style={{ padding: "22px 26px" }}>
        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff0e6",
              borderRadius: 100,
              padding: "4px 10px",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#FF6B00",
                animation: "livePulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#FF6B00",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {match.badge || "UPCOMING"}
            </span>
          </div>
          <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>
            {match.date} · {match.venue.split(",")[0]}
          </span>
        </div>

        {/* Teams row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: t1.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                color: "#fff",
                margin: "0 auto 6px",
                boxShadow: `0 4px 12px ${t1.color}40`,
              }}
            >
              {t1.short}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0a0a0a",
                letterSpacing: "-0.02em",
              }}
            >
              {t1.name}
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "0 10px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#bbb" }}>VS</div>
          </div>

          <div style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: t2.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 800,
                color: "#fff",
                margin: "0 auto 6px",
                boxShadow: `0 4px 12px ${t2.color}40`,
              }}
            >
              {t2.short}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "#0a0a0a",
                letterSpacing: "-0.02em",
              }}
            >
              {t2.name}
            </div>
          </div>
        </div>

        {/* Win probability */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 7,
            }}
          >
            <span style={{ color: t1.color }}>{t1.short} · Win Probability</span>
            <span style={{ color: t2.color }}>{t2.short}</span>
          </div>
          <div
            style={{
              height: 8,
              background: "#f0f0f0",
              borderRadius: 100,
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                width: `${match.prob[0]}%`,
                background: t1.color,
                borderRadius: "100px 0 0 100px",
              }}
            />
            <div
              style={{
                width: `${match.prob[1]}%`,
                background: t2.color,
                borderRadius: "0 100px 100px 0",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              fontWeight: 800,
              marginTop: 5,
            }}
          >
            <span style={{ color: t1.color }}>{match.prob[0]}%</span>
            <span style={{ color: t2.color }}>{match.prob[1]}%</span>
          </div>
        </div>

        {/* Last 6 balls */}
        <div style={{ marginBottom: 0 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 8,
            }}
          >
            Last 6 Balls
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {lastBalls.map((b, i) => (
              <div
                key={i}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 800,
                  ...ballStyle[b.type],
                }}
              >
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <div style={{ fontSize: 12, color: "#888" }}>
            {match.time} IST · {match.venue.split(",")[0]}
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#FF6B00",
              cursor: "pointer",
            }}
          >
            View Full Analysis →
          </span>
        </div>
      </div>
    </div>
  );
}

// ── AI Insight Mini Card ───────────────────────────────────────────────────
function AiInsightCard({ match }) {
  const t1 = getTeam(match.t1);
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
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          background: "#003DA5",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 14,
          color: "#fff",
          fontWeight: 800,
        }}
      >
        ✦
      </div>
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#FF6B00",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 3,
          }}
        >
          KrixAI Live Insight
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#333",
            fontWeight: 500,
            lineHeight: 1.45,
          }}
        >
          {t1.name}&apos;s spin attack will be key in the middle overs — 73% of T20s at this venue see 55+ powerplay scores. Watch the momentum shift around over 12.
        </div>
      </div>
    </div>
  );
}

// ── Scrolling Ticker ───────────────────────────────────────────────────────
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
          display: "flex",
          gap: 40,
          padding: "8px 0",
          whiteSpace: "nowrap",
          animation: "tickerScroll 30s linear infinite",
          width: "max-content",
        }}
      >
        {[...items, ...items].map((s, i) => (
          <span
            key={i}
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#666",
              letterSpacing: 0.3,
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main Header ────────────────────────────────────────────────────────────
export default function Header({ onTabChange }) {
  const {
    tokens: tk,
    tournament: T,
    tournamentId,
    setTournament,
    allTournaments,
  } = useTheme();

  const featuredMatch = matches[0];

  return (
    <header
      style={{ background: "#f7f7f5", position: "relative", overflow: "hidden" }}
    >
      {/* Subtle dot-grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.4,
          pointerEvents: "none",
        }}
      />
      {/* India Blue radial glow, top-right */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,61,165,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      {/* Saffron glow, bottom-left */}
      <div
        style={{
          position: "absolute",
          bottom: -80,
          left: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)",
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
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: tk.layout.maxWidth + 80,
              margin: "0 auto",
              padding: `0 ${tk.spacing.xxxl}px`,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src="/icon.svg"
                alt="KrixAI"
                style={{ width: 30, height: 30, borderRadius: 7 }}
              />
              <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#0a0a0a",
                    letterSpacing: "-0.03em",
                    fontFamily: tk.fontFamily,
                  }}
                >
                  Krix
                </span>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: "#FF6B00",
                    letterSpacing: "-0.03em",
                    fontFamily: tk.fontFamily,
                  }}
                >
                  AI
                </span>
              </div>
            </div>

            {/* Tournament switcher (center) */}
            <div
              style={{
                display: "flex",
                gap: 4,
                background: "rgba(0,0,0,0.05)",
                borderRadius: 100,
                padding: 4,
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
                    padding: "6px 16px",
                    borderRadius: 100,
                    border: "none",
                    cursor: "pointer",
                    background:
                      tournamentId === t.id ? "#fff" : "transparent",
                    color:
                      tournamentId === t.id ? "#FF6B00" : "#666",
                    boxShadow:
                      tournamentId === t.id
                        ? "0 1px 4px rgba(0,0,0,0.12)"
                        : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {t.short}
                </button>
              ))}
            </div>

            {/* Right: Ask AI + Get Started */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <button
                onClick={() => onTabChange("chat")}
                style={{
                  fontFamily: tk.fontFamily,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#444",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Ask AI
              </button>
              <button
                onClick={() => onTabChange("matches")}
                style={{
                  fontFamily: tk.fontFamily,
                  fontSize: 14,
                  fontWeight: 700,
                  padding: "9px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#FF6B00",
                  color: "#fff",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                  transition: "background 0.15s",
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
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 100,
                padding: "5px 14px 5px 7px",
                fontSize: 12,
                fontWeight: 600,
                color: "#444",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 26,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                fontFamily: tk.fontFamily,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  background: "#FF6B00",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                AI
              </div>
              {T.short} · Powered by Artificial Intelligence
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(42px, 5.5vw, 70px)",
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: "-0.04em",
                color: "#0a0a0a",
                margin: "0 0 4px",
                fontFamily: tk.fontFamily,
              }}
            >
              Cricket
              <br />
              Intelligence,
            </h1>
            <h1
              style={{
                fontSize: "clamp(42px, 5.5vw, 70px)",
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: "-0.04em",
                color: "#FF6B00",
                margin: "0 0 22px",
                fontFamily: tk.fontFamily,
              }}
            >
              Decoded by AI.
            </h1>

            <p
              style={{
                fontSize: 17,
                color: "#555",
                lineHeight: 1.6,
                maxWidth: 440,
                marginBottom: 34,
                letterSpacing: "-0.01em",
                fontFamily: tk.fontFamily,
              }}
            >
              Real-time match predictions, player analysis, and tactical
              breakdowns — powered by AI trained on every {T.short} ball
              ever bowled.
            </p>

            {/* Feature pills */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 30,
                flexWrap: "wrap",
              }}
            >
              {[
                { icon: "🧠", label: "AI Predictions" },
                { icon: "📊", label: "Live Analytics" },
                { icon: "⚡", label: "Real-time" },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 8,
                    background: "#fff",
                    border: "1px solid #ebebeb",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#444",
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
            <div
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              <button
                onClick={() => onTabChange("matches")}
                style={{
                  fontFamily: tk.fontFamily,
                  fontSize: 15,
                  fontWeight: 700,
                  padding: "13px 26px",
                  borderRadius: 10,
                  border: "none",
                  background: "#FF6B00",
                  color: "#fff",
                  cursor: "pointer",
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
                  fontFamily: tk.fontFamily,
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "12px 22px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: "#fff",
                  color: "#0a0a0a",
                  border: "1.5px solid #ddd",
                  letterSpacing: "-0.02em",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "border-color 0.15s",
                }}
              >
                <span style={{ color: "#003DA5", fontWeight: 800 }}>✦</span>
                Ask KrixAI
              </button>
            </div>
          </div>

          {/* Right: Live match card + AI insight */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <LiveMatchCard match={featuredMatch} />
            <AiInsightCard match={featuredMatch} />
          </div>
        </div>

        {/* ── Ticker ── */}
        <Ticker
          items={[
            "🏏 84 Matches",
            "⭐ 10 Teams",
            "🎯 AI Predictions Live",
            "📊 Ball-by-Ball Analysis",
            "🔥 Season 19",
            "💡 Smart Fantasy Tips",
            "🏟️ 18 Venues",
            "⚡ Real-time Intelligence",
            "📈 Win Probability",
            "🤖 Powered by AI",
            `🏆 ${T.short}`,
            "🎪 March 28 - May 31",
          ]}
        />
      </div>
    </header>
  );
}
