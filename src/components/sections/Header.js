"use client";

import { useTheme } from "@/context/ThemeContext";
import { useCountdown } from "@/hooks/useCountdown";
import { teams } from "@/data/teams";
import { matches } from "@/data/matches";
import { StadiumBg } from "@/components/graphics";

function Ticker({ items }) {
  return (
    <div
      style={{
        overflow: "hidden",
        background: "rgba(0,0,0,0.2)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
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
              color: "rgba(255,255,255,0.55)",
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

export default function Header({ onTabChange }) {
  const { tokens: tk, tournament: T, tournamentId, setTournament, allTournaments } = useTheme();
  const cd = useCountdown(T.startDate);
  const firstMatch = matches[0];
  const t1 = teams[firstMatch.t1];
  const t2 = teams[firstMatch.t2];

  return (
    <header
      style={{
        background: T.gradient,
        position: "relative",
        overflow: "hidden",
        transition: "background 0.6s ease",
      }}
    >
      {/* Layer 1: Stadium SVG */}
      <StadiumBg colors={T.headerColors} />

      {/* Layer 2: Floating team badges */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {Object.entries(teams)
          .slice(0, 10)
          .map(([k, tm], i) => {
            const sz = 28 + (i % 4) * 5;
            return (
              <div
                key={k}
                style={{
                  position: "absolute",
                  left: `${5 + i * 9.5}%`,
                  top: `${15 + Math.sin(i * 1.2) * 30}%`,
                  width: sz,
                  height: sz,
                  borderRadius: sz * 0.3,
                  background: tm.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: sz > 36 ? 10 : 8,
                  fontWeight: 800,
                  color: "#fff",
                  fontFamily: tk.fontFamily,
                  opacity: 0.35,
                  boxShadow: `0 0 ${sz}px ${tm.color}40`,
                  animation: `floatBadge${i % 3} ${12 + i * 2}s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                {tm.short}
              </div>
            );
          })}
      </div>

      {/* Layer 3: Gradient mesh */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 30%, rgba(255,255,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.3) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 4: Particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(i * 5.1 + 3) % 100}%`,
              top: `${(i * 7.3 + 10) % 100}%`,
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
              animation: `floatBadge${i % 3} ${8 + (i % 5) * 3}s ease-in-out infinite`,
              animationDelay: `${(i % 7) * 0.7}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {/* Nav */}
        <div
          style={{
            maxWidth: tk.layout.maxWidth,
            margin: "0 auto",
            padding: `${tk.spacing.lg}px ${tk.spacing.xl}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: tk.spacing.md }}>
            <img
              src="/icon.svg"
              alt="KrixAI"
              style={{ width: 44, height: 44, borderRadius: tk.radius.lg, boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
            />
            <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
              <span style={{ fontSize: tk.fontSize.h3, fontWeight: tk.fontWeight.black, color: "#fff", fontFamily: tk.fontFamily, letterSpacing: "-0.5px" }}>
                Krix
              </span>
              <span style={{ fontSize: tk.fontSize.h3, fontWeight: tk.fontWeight.black, color: "#FF6B00", fontFamily: tk.fontFamily, letterSpacing: "-0.5px" }}>
                AI
              </span>
            </div>
          </div>

          {/* Tournament switcher */}
          <div
            style={{
              display: "flex",
              gap: 6,
              background: "rgba(255,255,255,0.08)",
              borderRadius: tk.radius.pill,
              padding: 4,
            }}
          >
            {Object.values(allTournaments).map((t) => (
              <button
                key={t.id}
                onClick={() => setTournament(t.id)}
                style={{
                  fontFamily: tk.fontFamily,
                  fontSize: tk.fontSize.md,
                  fontWeight: tournamentId === t.id ? tk.fontWeight.semibold : tk.fontWeight.normal,
                  padding: `${tk.spacing.sm}px ${tk.spacing.xl}px`,
                  borderRadius: tk.radius.xxl,
                  border: "none",
                  cursor: "pointer",
                  background: tournamentId === t.id ? "#fff" : "transparent",
                  color: tournamentId === t.id ? T.accent : "rgba(255,255,255,0.6)",
                  transition: `all ${tk.motion.normal}`,
                  boxShadow: tournamentId === t.id ? tk.shadow.md : "none",
                }}
              >
                {t.short}
              </button>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div
          style={{
            maxWidth: tk.layout.maxWidth,
            margin: "0 auto",
            padding: `${tk.spacing.xxl}px ${tk.spacing.xl}px ${tk.spacing.xxxl}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 28,
          }}
        >
          <div style={{ maxWidth: 580 }}>
            {/* AI Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                padding: "7px 18px",
                borderRadius: tk.radius.pill,
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <div style={{ position: "relative", width: tk.ai.orbSize, height: tk.ai.orbSize }}>
                <div
                  style={{
                    width: tk.ai.orbSize,
                    height: tk.ai.orbSize,
                    borderRadius: tk.ai.orbSize / 2,
                    background: tk.ai.gradient,
                    animation: "aiOrbSpin 3s linear infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 3,
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: 8, fontWeight: tk.fontWeight.black, color: "#fff" }}>AI</span>
                </div>
              </div>
              <span style={{ fontSize: tk.fontSize.md, fontWeight: tk.fontWeight.bold, color: "#fff", letterSpacing: 0.5 }}>
                POWERED BY ARTIFICIAL INTELLIGENCE
              </span>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  background: tk.status.live,
                  animation: "livePulse 2s infinite",
                }}
              />
            </div>

            {/* Tournament line */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold, color: "rgba(255,255,255,0.6)" }}>
                {T.name}
              </span>
              <span style={{ fontSize: tk.fontSize.sm, color: "rgba(255,255,255,0.35)" }}>·</span>
              <span style={{ fontSize: tk.fontSize.sm, color: "rgba(255,255,255,0.4)" }}>{T.tagline}</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: tk.fontSize.h1,
                fontWeight: tk.fontWeight.black,
                color: "#fff",
                margin: "0 0 6px",
                letterSpacing: "-1px",
                lineHeight: 1.1,
                fontFamily: tk.fontFamily,
                textShadow: "0 2px 30px rgba(0,0,0,0.4)",
              }}
            >
              Cricket Intelligence,
            </h1>
            <h1
              style={{
                fontSize: tk.fontSize.h1,
                fontWeight: tk.fontWeight.black,
                margin: "0 0 8px",
                letterSpacing: "-1px",
                lineHeight: 1.1,
                fontFamily: tk.fontFamily,
                background: tk.ai.shimmer,
                backgroundSize: "300% 100%",
                animation: "shimmerText 4s linear infinite",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Powered by AI.
            </h1>

            {/* Feature pills */}
            <div style={{ display: "flex", gap: tk.spacing.lg, marginBottom: 20, marginTop: tk.spacing.lg, flexWrap: "wrap" }}>
              {[
                { icon: "🧠", label: "AI Predictions", desc: "Ball-by-ball" },
                { icon: "📊", label: "Smart Analytics", desc: "200+ data points" },
                { icon: "⚡", label: "Real-time", desc: "Live intelligence" },
              ].map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: tk.spacing.sm,
                    padding: `${tk.spacing.sm}px ${tk.spacing.md + 2}px`,
                    borderRadius: tk.radius.md,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.bold, color: "#fff" }}>{f.label}</div>
                    <div style={{ fontSize: tk.fontSize.xs, color: "rgba(255,255,255,0.45)" }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: tk.spacing.md, alignItems: "center" }}>
              <button
                onClick={() => onTabChange("matches")}
                style={{
                  fontFamily: tk.fontFamily,
                  fontSize: tk.fontSize.lg,
                  fontWeight: tk.fontWeight.bold,
                  padding: `${tk.spacing.md + 2}px ${tk.spacing.xxxl}px`,
                  borderRadius: tk.radius.lg,
                  border: "none",
                  background: "#fff",
                  color: T.accent,
                  cursor: "pointer",
                  boxShadow: tk.shadow.xl,
                  transition: `transform ${tk.motion.normal}`,
                }}
              >
                Explore Matches →
              </button>
              <button
                onClick={() => onTabChange("chat")}
                style={{
                  fontFamily: tk.fontFamily,
                  fontSize: tk.fontSize.lg,
                  fontWeight: tk.fontWeight.bold,
                  padding: `${tk.spacing.md + 2}px ${tk.spacing.xxl + 4}px`,
                  borderRadius: tk.radius.lg,
                  background: tk.ai.badgeBg,
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: `all ${tk.motion.normal}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>✨</span> Ask AI Anything
              </button>
            </div>
          </div>

          {/* Countdown */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
              borderRadius: tk.radius.xl + 2,
              padding: `${tk.spacing.xxl}px ${tk.spacing.xxxl}px`,
              border: "1px solid rgba(255,255,255,0.12)",
              animation: "glowPulse 4s ease-in-out infinite",
              minWidth: 260,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: 3, background: tk.status.live, animation: "livePulse 2s infinite" }} />
              <span style={{ fontSize: 11, fontWeight: tk.fontWeight.semibold, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}>
                FIRST BALL IN
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[
                { v: cd.d, l: "days" },
                { v: cd.h, l: "hrs" },
                { v: cd.m, l: "min" },
                { v: cd.s, l: "sec" },
              ].map((u, i) => (
                <div key={i} style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      fontSize: tk.fontSize.countdown,
                      fontWeight: tk.fontWeight.extrabold,
                      color: "#fff",
                      fontFamily: tk.fontFamily,
                      lineHeight: 1,
                      animation: u.l === "sec" ? "countTick 1s ease infinite" : "none",
                      textShadow: "0 0 20px rgba(255,255,255,0.2)",
                    }}
                  >
                    {String(u.v).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: tk.fontSize.xs, color: "rgba(255,255,255,0.4)", marginTop: 6, fontWeight: tk.fontWeight.medium }}>
                    {u.l}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: tk.spacing.lg,
                paddingTop: tk.spacing.md,
                borderTop: "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                {[t1, t2].map((tm, i) => (
                  <div
                    key={i}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: tm.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: tk.fontFamily,
                    }}
                  >
                    {tm.short}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.semibold, color: "rgba(255,255,255,0.8)" }}>
                  {t1.short} vs {t2.short}
                </div>
                <div style={{ fontSize: tk.fontSize.xs, color: "rgba(255,255,255,0.4)" }}>
                  {firstMatch.date} · {firstMatch.venue.split(",")[0]}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
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
            "🏆 IPL 2026",
            "🎪 March 28 - May 31",
          ]}
        />
      </div>
    </header>
  );
}
