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

// ═══ MATCHES SECTION ═══
export function MatchesSection() {
  const { tokens: tk, tournament } = useTheme();
  const router = useRouter();

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
export function PlayersSection() {
  const { tokens: tk, tournament } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${tk.layout.cardMinWidth}px, 1fr))`, gap: tk.spacing.lg }}>
      {players.map((p, i) => {
        const tm = getTeam(p.team);
        const isExpanded = expanded === i;
        return (
          <Card key={i} style={{ overflow: "hidden", animation: `fadeUp 0.4s ease ${i * tk.motion.stagger}s both` }} onClick={() => setExpanded(isExpanded ? null : i)}>
            <div style={{ padding: tk.spacing.xl }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: tk.spacing.md + 2 }}>
                <div>
                  <div style={{ fontSize: tk.fontSize.h4, fontWeight: tk.fontWeight.bold }}>{p.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: tk.spacing.sm, marginTop: 5 }}>
                    <Badge color={tm.color}>{tm.short}</Badge>
                    <span style={{ fontSize: tk.fontSize.md, color: tk.page.textMuted }}>{p.role}</span>
                    <TrendBadge trend={p.trend} />
                  </div>
                </div>
                <WinGauge pct={p.rating} color={tm.color} size={58} label="RATING" />
              </div>

              <div style={{ display: "flex", gap: 4, marginBottom: tk.spacing.md + 2 }}>
                <div style={{ flex: 1, padding: `${tk.spacing.md}px ${tk.spacing.md + 2}px`, background: tk.page.cardBg, borderRadius: tk.radius.sm, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: tk.fontWeight.bold }}>{p.stat}</div>
                  <div style={{ fontSize: tk.fontSize.xs, color: tk.page.textDim, marginTop: 2 }}>LAST MATCH</div>
                </div>
                <div style={{ flex: 1, padding: `${tk.spacing.md}px ${tk.spacing.md + 2}px`, background: tk.page.cardBg, borderRadius: tk.radius.sm, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: tk.fontWeight.bold, color: tm.color }}>{p.rating}</div>
                  <div style={{ fontSize: tk.fontSize.xs, color: tk.page.textDim, marginTop: 2 }}>AI RATING</div>
                </div>
              </div>

              <div style={{ padding: `${tk.spacing.md}px ${tk.spacing.md + 2}px`, borderRadius: tk.radius.sm, background: `${tm.color}08`, border: `1px solid ${tm.color}12`, fontSize: tk.fontSize.md, color: tk.page.textSecondary, lineHeight: 1.5 }}>
                🤖 {p.note}
              </div>

              {isExpanded && (
                <div style={{ marginTop: tk.spacing.lg, paddingTop: tk.spacing.lg, borderTop: `1px solid ${tk.page.borderLight}`, display: "flex", gap: tk.spacing.lg, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.3s ease both" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.semibold, marginBottom: tk.spacing.sm }}>Skill Breakdown</div>
                    <RadarChart data={p.radar} color={tm.color} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.semibold, marginBottom: tk.spacing.sm }}>Scoring Zones</div>
                    <WagonWheel zones={p.zones} color={tm.color} />
                  </div>
                </div>
              )}
              {!isExpanded && (
                <div style={{ marginTop: tk.spacing.md, fontSize: tk.fontSize.xs + 1, color: tournament.accent, fontWeight: tk.fontWeight.medium, textAlign: "center" }}>
                  Click for detailed analysis ↓
                </div>
              )}
              {isExpanded && (
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/player/${encodeURIComponent(p.name.toLowerCase().replace(/\s+/g, "-"))}`); }}
                  style={{
                    marginTop: tk.spacing.lg,
                    width: "100%",
                    padding: `${tk.spacing.md}px`,
                    background: `${tm.color}12`,
                    border: `1px solid ${tm.color}30`,
                    borderRadius: tk.radius.md,
                    color: tm.color,
                    fontFamily: tk.fontFamily,
                    fontSize: tk.fontSize.md,
                    fontWeight: tk.fontWeight.bold,
                    cursor: "pointer",
                    transition: `all ${tk.motion.fast}`,
                  }}
                >
                  View Full Profile & AI Analysis →
                </button>
              )}
            </div>
          </Card>
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
    { from: "ai", text: "Hey! I'm CricMind AI. Ask me about IPL 2026 — player matchups, venue analysis, tactical breakdowns, or fantasy picks." },
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
      setMessages((p) => [...p, { from: "ai", text: "📊 Connection issue. In the live version, CricMind AI analyzes every ball in real-time. Try again!" }]);
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
            <div style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold }}>CricMind AI</div>
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
          <span style={{ fontSize: tk.fontSize.xl, fontWeight: tk.fontWeight.bold }}>CricMind</span>
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
