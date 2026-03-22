"use client";

import { useTheme } from "@/context/ThemeContext";
import { Card, TeamLogo, TrendBadge } from "@/components/ui";
import { WinGauge, Sparkline, MomentumLine } from "@/components/graphics";
import { matches } from "@/data/matches";
import { insights } from "@/data/insights";
import { players } from "@/data/players";
import { getTeam } from "@/data/teams";

export default function FeedSection({ onTabChange }) {
  const { tokens: tk, tournament } = useTheme();
  const featuredMatch = matches[0];
  const t1 = getTeam(featuredMatch.t1);
  const t2 = getTeam(featuredMatch.t2);

  return (
    <div style={{ display: "grid", gridTemplateColumns: `1fr ${tk.layout.sidebarWidth}px`, gap: tk.spacing.xl, alignItems: "start" }}>
      {/* Main Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: tk.spacing.lg }}>
        {/* Featured Match */}
        <Card style={{ overflow: "hidden" }}>
          <div
            style={{
              background: tournament.gradient,
              padding: `${tk.spacing.md + 2}px ${tk.spacing.xl}px`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.semibold, color: "rgba(255,255,255,0.8)", position: "relative", zIndex: 1 }}>
              🏏 SEASON OPENER
            </span>
            <span style={{ fontSize: tk.fontSize.sm, color: "rgba(255,255,255,0.6)", position: "relative", zIndex: 1 }}>
              {featuredMatch.date} · {featuredMatch.time} IST
            </span>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg,${t1.color}20,transparent 30%,transparent 70%,${t2.color}20)`, pointerEvents: "none" }} />
          </div>
          <div style={{ padding: tk.spacing.xxl }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <TeamLogo teamId={featuredMatch.t1} size={64} />
                <div style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold, marginTop: tk.spacing.sm }}>{t1.name}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: `0 ${tk.spacing.lg}px` }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <WinGauge pct={featuredMatch.prob[0]} color={t1.color} size={76} label={t1.short} />
                  <WinGauge pct={featuredMatch.prob[1]} color={t2.color} size={76} label={t2.short} />
                </div>
                <MomentumLine data={featuredMatch.momentum} c1={t1.color} c2={t2.color} w={180} h={36} />
                <div style={{ fontSize: 9, color: tk.page.textDim }}>AI Momentum Forecast</div>
              </div>
              <div style={{ textAlign: "center", flex: 1 }}>
                <TeamLogo teamId={featuredMatch.t2} size={64} />
                <div style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold, marginTop: tk.spacing.sm }}>{t2.name}</div>
              </div>
            </div>
            <div
              style={{
                marginTop: tk.spacing.xl - 2,
                padding: `${tk.spacing.md}px ${tk.spacing.lg}px`,
                background: tk.page.cardBg,
                borderRadius: tk.radius.md,
                fontSize: tk.fontSize.md,
                color: tk.page.textSecondary,
                lineHeight: 1.6,
              }}
            >
              <span style={{ fontWeight: tk.fontWeight.semibold, color: tk.page.text }}>🤖 CricMind AI:</span>{" "}
              Chinnaswamy under lights is batting paradise — 73% of T20s see 55+ powerplay scores. RCB&apos;s spin in the middle overs will be crucial against SRH&apos;s aggressive middle order.
            </div>
            <div style={{ marginTop: tk.spacing.md, fontSize: tk.fontSize.sm, color: tk.page.textDim }}>📍 {featuredMatch.venue}</div>
          </div>
        </Card>

        {/* Insight Feed Cards */}
        {insights.slice(0, 4).map((ins, i) => (
          <Card key={i} style={{ padding: tk.spacing.xl, animation: `fadeUp 0.4s ease ${i * tk.motion.stagger}s both` }}>
            <div style={{ display: "flex", alignItems: "center", gap: tk.spacing.md, marginBottom: tk.spacing.md + 2 }}>
              <div
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  background: tournament.gradient,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: tk.fontSize.md, fontWeight: tk.fontWeight.bold, color: "#fff",
                }}
              >AI</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold }}>CricMind Intelligence</div>
                <div style={{ fontSize: tk.fontSize.sm, color: tk.page.textDim }}>{ins.cat} · Just now</div>
              </div>
              <Sparkline data={ins.trend} color={tournament.accent} w={100} h={32} />
            </div>
            <div style={{ display: "flex", gap: tk.spacing.lg, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: tk.fontSize.xl, fontWeight: tk.fontWeight.semibold, marginBottom: 6 }}>{ins.title}</div>
                <div style={{ fontSize: tk.fontSize.lg, color: tk.page.textSecondary, lineHeight: 1.6 }}>{ins.body}</div>
              </div>
              <div style={{ textAlign: "center", minWidth: 56 }}>
                <div style={{ fontSize: tk.fontSize.stat, fontWeight: tk.fontWeight.extrabold, color: tournament.accent, lineHeight: 1 }}>{ins.stat}</div>
                <div style={{ fontSize: 9, color: tk.page.textDim, marginTop: 2 }}>KEY STAT</div>
              </div>
            </div>
            <div style={{ marginTop: tk.spacing.md + 2, paddingTop: tk.spacing.md, borderTop: `1px solid ${tk.page.borderLight}`, display: "flex", gap: tk.spacing.md }}>
              {["👍 Useful", "💬 Discuss", "↗️ Share"].map((x) => (
                <button key={x} style={{ fontFamily: tk.fontFamily, fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.medium, color: tk.page.textMuted, background: "transparent", border: "none", cursor: "pointer", padding: `6px ${tk.spacing.md}px`, borderRadius: tk.radius.sm }}>
                  {x}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: tk.spacing.lg, position: "sticky", top: tk.spacing.section }}>
        {/* Quick Ask */}
        <Card hover={false} style={{ padding: tk.spacing.lg }}>
          <div style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold, marginBottom: tk.spacing.md }}>✨ Quick Ask</div>
          <div
            onClick={() => onTabChange("chat")}
            style={{ display: "flex", gap: tk.spacing.sm, padding: tk.spacing.md, background: tk.page.inputBg, borderRadius: tk.radius.xxl, cursor: "pointer", alignItems: "center" }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 15, background: tournament.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: tk.fontWeight.bold }}>AI</div>
            <span style={{ fontSize: tk.fontSize.md, color: tk.page.textDim }}>Ask CricMind anything...</span>
          </div>
        </Card>

        {/* Form Ratings */}
        <Card hover={false} style={{ padding: tk.spacing.lg }}>
          <div style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold, marginBottom: tk.spacing.md + 2 }}>🔥 Form Ratings</div>
          {players.slice(0, 4).map((p, i) => {
            const tm = getTeam(p.team);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: tk.spacing.md, padding: `${tk.spacing.md}px 0`, borderTop: i ? `1px solid ${tk.page.borderLight}` : "none" }}>
                <WinGauge pct={p.rating} color={tm.color} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: tk.fontSize.md, fontWeight: tk.fontWeight.semibold }}>{p.name}</div>
                  <div style={{ fontSize: tk.fontSize.xs + 1, color: tk.page.textDim }}>{tm.short} · {p.stat}</div>
                </div>
                <TrendBadge trend={p.trend} />
              </div>
            );
          })}
        </Card>

        {/* This Week */}
        <Card hover={false} style={{ padding: tk.spacing.lg }}>
          <div style={{ fontSize: tk.fontSize.lg, fontWeight: tk.fontWeight.semibold, marginBottom: tk.spacing.md + 2 }}>📅 This Week</div>
          {matches.slice(1, 5).map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderTop: i ? `1px solid ${tk.page.borderLight}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: tk.spacing.sm }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[m.t1, m.t2].map((tid) => {
                    const tm = getTeam(tid);
                    return (
                      <div key={tid} style={{ width: 22, height: 22, borderRadius: 5, background: tm.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, color: "#fff" }}>
                        {tm.short}
                      </div>
                    );
                  })}
                </div>
                <div>
                  <div style={{ fontSize: tk.fontSize.sm, fontWeight: tk.fontWeight.medium }}>{getTeam(m.t1).short} v {getTeam(m.t2).short}</div>
                  <div style={{ fontSize: tk.fontSize.xs, color: tk.page.textDim }}>{m.date}</div>
                </div>
              </div>
              <Sparkline data={m.momentum} color={tournament.accent} w={50} h={20} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
