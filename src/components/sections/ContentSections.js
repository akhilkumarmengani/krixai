"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Card, Badge, TrendBadge, TeamLogo } from "@/components/ui";
import { WinGauge, Sparkline, MomentumLine, RadarChart, WagonWheel } from "@/components/graphics";
import { matches } from "@/data/matches";
import { players } from "@/data/players";
import { insights } from "@/data/insights";
import { getTeam } from "@/data/teams";

// ─── Shared empty state ───────────────────────────────────────────────────────
function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "64px 24px", textAlign: "center",
      background: "#fafafa", borderRadius: 16,
      border: "1.5px dashed #e0e0e0",
    }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, maxWidth: 320 }}>{subtitle}</div>
    </div>
  );
}

// ═══ MATCHES SECTION ═══
export function MatchesSection() {
  const { tokens: tk, tournament } = useTheme();
  const router = useRouter();

  if (matches.length === 0) {
    return (
      <EmptyState
        icon="🏏"
        title="No matches loaded yet"
        subtitle="Live IPL match data from CricketData.org will appear here. Make sure CRICKET_API_KEY is set and IPL season is active."
      />
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${tk.layout.cardMinWidth}px, 1fr))`, gap: tk.spacing.lg }}>
      {matches.map((m, i) => {
        const a = getTeam(m.t1), b = getTeam(m.t2);
        return (
          <Card key={m.id} style={{ overflow: "hidden", animation: `fadeUp 0.4s ease ${i * tk.motion.stagger}s both` }} onClick={() => router.push(`/match/${m.id}`)}>
            <div style={{ height: 4, display: "flex" }}>
              <div style={{ flex: m.prob[0], background: a.color }} />
              <div style={{ flex: m.prob[1], background: b.color }} />
            </div>
            <div style={{ padding: tk.spacing.xl }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: tk.spacing.lg }}>
                <div style={{ fontSize: tk.fontSize.md, color: tk.page.textMuted }}>{m.date} · {m.time} IST</div>
                {m.badge && <Badge color={tournament.accent}>{m.badge}</Badge>}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <TeamLogo teamId={m.t1} size={52} />
                  <div style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.semibold, marginTop: tk.spacing.sm }}>{a.name}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 160 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <WinGauge pct={m.prob[0]} color={a.color} size={60} label={a.short} />
                    <WinGauge pct={m.prob[1]} color={b.color} size={60} label={b.short} />
                  </div>
                  <MomentumLine data={m.momentum} c1={a.color} c2={b.color} w={150} h={30} />
                  <div style={{ fontSize: 8, color: tk.page.textDim }}>MOMENTUM</div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <TeamLogo teamId={m.t2} size={52} />
                  <div style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.semibold, marginTop: tk.spacing.sm }}>{b.name}</div>
                </div>
              </div>
              <div style={{ marginTop: tk.spacing.md + 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: tk.fontSize.sm, color: tk.page.textDim }}>📍 {m.venue}</div>
                <div style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.semibold, color: tournament.accent }}>View Details →</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ═══ INSIGHTS SECTION ═══
export function InsightsSection() {
  const { tokens: tk, tournament } = useTheme();

  if (insights.length === 0) {
    return (
      <EmptyState
        icon="🧠"
        title="AI insights not generated yet"
        subtitle="KrixAI will generate match insights, venue analysis, and player breakdowns once IPL matches begin."
      />
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${tk.layout.insightMinWidth}px, 1fr))`, gap: tk.spacing.lg }}>
      {insights.map((ins, i) => (
        <Card key={i} style={{ padding: tk.spacing.xl, animation: `fadeUp 0.4s ease ${i * tk.motion.stagger}s both` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: tk.spacing.md }}>
            <Badge color={tournament.accent}>{ins.cat}</Badge>
            <div style={{ fontSize: tk.fontSize.stat - 2, fontWeight: tk.fontWeight.extrabold, color: tournament.accent, lineHeight: 1 }}>{ins.stat}</div>
          </div>
          <div style={{ fontSize: tk.fontSize.xl, fontWeight: tk.fontWeight.semibold, marginBottom: 6, lineHeight: 1.35 }}>{ins.title}</div>
          <div style={{ fontSize: tk.fontSize.md, color: tk.page.textSecondary, lineHeight: 1.6, marginBottom: tk.spacing.md + 2 }}>{ins.body}</div>
          <Sparkline data={ins.trend} color={tournament.accent} w={280} h={44} />
        </Card>
      ))}
    </div>
  );
}

// ═══ PLAYERS SECTION ═══
// Strength labels per role (maps to radar[0..5])
function getStrengthBars(p) {
  const r = p.radar;
  if (p.role === "Batter") {
    return [
      { label: "Powerplay",   pct: r[0], color: "#003DA5" },
      { label: "Death Overs", pct: r[4], color: "#FF6B00" },
      { label: "vs Pace",     pct: r[3], color: "#003DA5" },
    ];
  }
  if (p.role === "Pacer") {
    return [
      { label: "Death Overs",  pct: r[4], color: "#003DA5" },
      { label: "Economy",      pct: r[2], color: "#FF6B00" },
      { label: "Wicket Rate",  pct: r[1], color: "#003DA5" },
    ];
  }
  if (p.role === "Spinner") {
    return [
      { label: "Economy",      pct: r[1], color: "#003DA5" },
      { label: "Wickets",      pct: r[5], color: "#FF6B00" },
      { label: "Consistency",  pct: r[3], color: "#003DA5" },
    ];
  }
  // All-rounder
  return [
    { label: "Batting",   pct: r[0], color: "#003DA5" },
    { label: "Bowling",   pct: r[1], color: "#FF6B00" },
    { label: "Pressure",  pct: r[3], color: "#003DA5" },
  ];
}

export function PlayersSection() {
  const { tokens: tk, tournament } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(null);

  if (players.length === 0) {
    return (
      <EmptyState
        icon="🏃"
        title="No player data yet"
        subtitle="Player cards with KrixAI ratings, form index, and strength analysis will populate here from live IPL squad data."
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill, minmax(340px, 1fr))`,
        gap: tk.spacing.lg,
      }}
    >
      {players.map((p, i) => {
        const tm = getTeam(p.team);
        const isExpanded = expanded === i;
        const strengths = getStrengthBars(p);
        const formUp = p.trend === "up";
        // Extract stat details for pills
        const statParts = p.stat.split(" & ");

        return (
          <div
            key={i}
            onClick={() => setExpanded(isExpanded ? null : i)}
            style={{
              background: "#fff",
              borderRadius: 20,
              border: "1px solid #ebebeb",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
              overflow: "hidden",
              cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.2s",
              animation: `fadeUp 0.4s ease ${i * tk.motion.stagger}s both`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "none";
            }}
          >
            {/* Top color bar */}
            <div
              style={{
                height: 3,
                background: `linear-gradient(90deg, ${tm.color}, #FF6B00)`,
              }}
            />

            <div style={{ padding: "20px 22px" }}>
              {/* Player header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 16,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${tm.color}, #FF6B00)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                    boxShadow: `0 3px 10px ${tm.color}40`,
                  }}
                >
                  🏏
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#0a0a0a",
                      letterSpacing: "-0.02em",
                      fontFamily: tk.fontFamily,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#888",
                      marginTop: 2,
                      fontFamily: tk.fontFamily,
                    }}
                  >
                    {tm.short} · {p.role} · India
                  </div>
                </div>
              </div>

              {/* Rating + Form row */}
              <div
                style={{
                  background: "#f0f4ff",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#888",
                      fontFamily: tk.fontFamily,
                      marginBottom: 2,
                    }}
                  >
                    KrixAI Rating
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#003DA5",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      fontFamily: tk.fontFamily,
                    }}
                  >
                    {p.rating}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#888",
                      fontFamily: tk.fontFamily,
                      marginBottom: 2,
                    }}
                  >
                    Form Index
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: formUp ? "#15803d" : "#FF6B00",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      fontFamily: tk.fontFamily,
                    }}
                  >
                    {formUp ? "↑" : "●"} {p.rating + (formUp ? 2 : -1)}.{formUp ? "1" : "4"}
                  </div>
                </div>
              </div>

              {/* Stat pills */}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                {statParts.map((s, si) => (
                  <div
                    key={si}
                    style={{
                      background: "#f5f5f3",
                      border: "1px solid #ebebeb",
                      borderRadius: 7,
                      padding: "5px 10px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#555",
                      fontFamily: tk.fontFamily,
                    }}
                  >
                    {p.role === "Batter" ? "Last match" : "Bowling"}{" "}
                    <strong style={{ color: "#0a0a0a" }}>{s}</strong>
                  </div>
                ))}
                <div
                  style={{
                    background: formUp ? "#dcfce7" : "#fff0e6",
                    border: `1px solid ${formUp ? "#bbf7d0" : "#ffd6aa"}`,
                    borderRadius: 7,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: formUp ? "#15803d" : "#FF6B00",
                    fontFamily: tk.fontFamily,
                  }}
                >
                  {formUp ? "▲ Hot" : "● Steady"}
                </div>
              </div>

              {/* Strength bars */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {strengths.map((s, si) => (
                  <div key={si}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#888",
                        marginBottom: 4,
                        fontFamily: tk.fontFamily,
                      }}
                    >
                      <span>{s.label}</span>
                      <span style={{ color: s.color }}>{s.pct}%</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#f0f0f0",
                        borderRadius: 100,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${s.pct}%`,
                          height: "100%",
                          background: s.color,
                          borderRadius: 100,
                          transition: "width 0.8s ease",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI note */}
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: `${tm.color}08`,
                  border: `1px solid ${tm.color}18`,
                  fontSize: 12,
                  color: tk.page.textSecondary,
                  lineHeight: 1.5,
                  fontFamily: tk.fontFamily,
                }}
              >
                ✦ {p.note}
              </div>

              {/* Expanded: radar + wagon wheel */}
              {isExpanded && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: `1px solid ${tk.page.borderLight}`,
                    display: "flex",
                    gap: 16,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    animation: "fadeUp 0.3s ease both",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: tk.fontSize.sm,
                        fontWeight: tk.fontWeight.semibold,
                        marginBottom: tk.spacing.sm,
                        fontFamily: tk.fontFamily,
                      }}
                    >
                      Skill Breakdown
                    </div>
                    <RadarChart data={p.radar} color={tm.color} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: tk.fontSize.sm,
                        fontWeight: tk.fontWeight.semibold,
                        marginBottom: tk.spacing.sm,
                        fontFamily: tk.fontFamily,
                      }}
                    >
                      Scoring Zones
                    </div>
                    <WagonWheel zones={p.zones} color={tm.color} />
                  </div>
                </div>
              )}

              {/* Expand hint / Profile button */}
              {!isExpanded ? (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: "#FF6B00",
                    fontWeight: 600,
                    textAlign: "center",
                    fontFamily: tk.fontFamily,
                  }}
                >
                  Click for detailed analysis ↓
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(
                      `/player/${encodeURIComponent(
                        p.name.toLowerCase().replace(/\s+/g, "-")
                      )}`
                    );
                  }}
                  style={{
                    marginTop: 14,
                    width: "100%",
                    padding: "11px",
                    background: "#fff",
                    border: "1.5px solid #003DA5",
                    borderRadius: 10,
                    color: "#003DA5",
                    fontFamily: tk.fontFamily,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    letterSpacing: "-0.01em",
                  }}
                >
                  View Full Profile & AI Analysis →
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══ CHAT SECTION ═══
export function ChatSection() {
  const { tokens: tk, tournament } = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "ai", text: "Hey! I'm KrixAI. Ask me about IPL 2026 — player matchups, venue analysis, tactical breakdowns, or fantasy picks." },
  ]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (txt) => {
    const q = txt || input;
    if (!q.trim()) return;
    setMessages((p) => [...p, { from: "user", text: q }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, history: messages }),
      });
      const data = await res.json();
      setMessages((p) => [...p, { from: "ai", text: data.text || "Sorry, I couldn't analyze that. Try again!" }]);
    } catch {
      setMessages((p) => [...p, { from: "ai", text: "📊 Connection issue. In the live version, KrixAI analyzes every ball in real-time. Try again!" }]);
    }
    setTyping(false);
  };

  const prompts = ["RCB vs SRH prediction", "Bumrah death analysis", "Best fantasy XI", "Kohli at Chinnaswamy"];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp 0.3s ease both" }}>
      <Card hover={false} style={{ overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: `${tk.spacing.md + 2}px ${tk.spacing.xl}px`, borderBottom: `1px solid ${tk.page.borderLight}`, display: "flex", alignItems: "center", gap: tk.spacing.md }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: tournament.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: tk.fontSize.md, fontWeight: tk.fontWeight.bold, color: "#fff" }}>AI</div>
          <div>
            <div style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold }}>KrixAI</div>
            <div style={{ fontSize: tk.fontSize.sm, color: tk.page.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: tk.status.live, display: "inline-block" }} />
              Active · {tournament.short}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ height: 360, overflowY: "auto", padding: tk.spacing.lg, display: "flex", flexDirection: "column", gap: tk.spacing.sm, background: tk.page.inputBg }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.from === "user" ? "flex-end" : "flex-start", maxWidth: "78%", animation: "slideIn 0.2s ease both" }}>
              <div
                style={{
                  padding: `${tk.spacing.md}px ${tk.spacing.md + 2}px`,
                  borderRadius: 18,
                  background: msg.from === "user" ? tournament.accent : tk.page.surface,
                  color: msg.from === "user" ? "#fff" : tk.page.text,
                  fontSize: tk.fontSize.lg,
                  lineHeight: 1.55,
                  whiteSpace: "pre-line",
                  boxShadow: msg.from === "user" ? "none" : tk.shadow.sm,
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ alignSelf: "flex-start", animation: "slideIn 0.2s ease both" }}>
              <div style={{ padding: `${tk.spacing.md}px ${tk.spacing.md + 2}px`, borderRadius: 18, background: tk.page.surface, fontSize: tk.fontSize.lg, color: tk.page.textDim, boxShadow: tk.shadow.sm }}>
                Analyzing<span style={{ animation: "pulse .8s ease infinite" }}>...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick prompts */}
        <div style={{ padding: `${tk.spacing.sm}px ${tk.spacing.lg}px 6px`, display: "flex", flexWrap: "wrap", gap: 6, background: tk.page.surface }}>
          {prompts.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              style={{
                fontFamily: tk.fontFamily,
                fontSize: tk.fontSize.sm,
                fontWeight: tk.fontWeight.medium,
                padding: `6px ${tk.spacing.md + 2}px`,
                borderRadius: tk.radius.xl,
                border: `1px solid ${tk.page.border}`,
                background: tk.page.surface,
                color: tk.page.text,
                cursor: "pointer",
                transition: `all ${tk.motion.fast}`,
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: `${tk.spacing.md}px ${tk.spacing.lg}px ${tk.spacing.md + 2}px`, display: "flex", gap: tk.spacing.md, background: tk.page.surface, borderTop: `1px solid ${tk.page.borderLight}` }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Ask about ${tournament.short}...`}
            style={{
              flex: 1,
              fontFamily: tk.fontFamily,
              fontSize: tk.fontSize.lg,
              background: tk.page.inputBg,
              border: "none",
              borderRadius: tk.radius.xxl,
              padding: `${tk.spacing.md}px ${tk.spacing.lg}px`,
              color: tk.page.text,
            }}
          />
          <button
            onClick={() => send()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              border: "none",
              background: tournament.accent,
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ↑
          </button>
        </div>
      </Card>
    </div>
  );
}

// ═══ FOOTER ═══
export function Footer() {
  const { tokens: tk } = useTheme();

  return (
    <footer style={{ background: tk.page.surface, borderTop: `1px solid ${tk.page.border}`, padding: `18px ${tk.spacing.xl}px` }}>
      <div style={{ maxWidth: tk.layout.maxWidth, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: tk.spacing.sm }}>
          <span style={{ fontSize: tk.fontSize.xl, fontWeight: tk.fontWeight.bold }}>KrixAI</span>
          <span style={{ fontSize: tk.fontSize.sm, color: tk.page.textDim }}>© 2026</span>
        </div>
        <div style={{ display: "flex", gap: tk.spacing.xl }}>
          {["About", "Privacy", "Terms", "Data Sources"].map((l) => (
            <a key={l} href="#" style={{ fontSize: tk.fontSize.sm, color: tk.page.textDim, textDecoration: "none" }}>
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
