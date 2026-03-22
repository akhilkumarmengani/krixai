"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Card, Badge, TrendBadge, TeamLogo } from "@/components/ui";
import { WinGauge, RadarChart, WagonWheel, Sparkline } from "@/components/graphics";
import { players } from "@/data/players";
import { getTeam } from "@/data/teams";
import { tokens } from "@/lib/tokens";

// ─── Demo career stats (replace with real API data) ───
const CAREER_STATS = {
  "Virat Kohli": {
    t20: { matches: 125, runs: 4188, avg: 50.5, sr: 139.2, fifties: 38, hundreds: 1, hs: 122 },
    ipl: { matches: 252, runs: 8156, avg: 39.0, sr: 131.2, fifties: 61, hundreds: 7, hs: 113 },
    recentScores: [87, 52, 23, 71, 45, 88, 34, 67, 12, 56],
  },
  "Jasprit Bumrah": {
    t20: { matches: 72, wickets: 89, avg: 19.8, econ: 6.8, sr: 17.4, bbi: "3/7", fwi: 0 },
    ipl: { matches: 140, wickets: 178, avg: 21.2, econ: 7.4, sr: 17.2, bbi: "5/10", fwi: 2 },
    recentScores: [3, 1, 2, 3, 2, 4, 1, 2, 3, 2],
  },
  "default": {
    t20: { matches: 80, runs: 2100, avg: 32.5, sr: 142.0, fifties: 15, hundreds: 0, hs: 89 },
    ipl: { matches: 95, runs: 2400, avg: 30.0, sr: 138.5, fifties: 18, hundreds: 0, hs: 95 },
    recentScores: [34, 45, 12, 67, 28, 55, 41, 33, 19, 48],
  },
};

// ─── Stat pill ───
function StatPill({ label, value, color, tk }) {
  return (
    <div style={{
      background: tk.page.cardBg,
      borderRadius: tokens.radius.md,
      padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
      textAlign: "center",
      border: `1px solid ${tk.page.borderLight}`,
    }}>
      <div style={{ fontSize: tokens.fontSize.stat, fontWeight: tokens.fontWeight.extrabold, color: color || tk.page.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: tokens.fontSize.xs + 1, color: tk.page.textMuted, marginTop: tokens.spacing.xs, fontWeight: tokens.fontWeight.medium }}>{label}</div>
    </div>
  );
}

// ─── Career stats table ───
function CareerTable({ label, data, isBowler, tk, color }) {
  const batterCols = ["Matches", "Runs", "Avg", "SR", "50s", "100s", "HS"];
  const bowlerCols = ["Matches", "Wickets", "Avg", "Econ", "SR", "BBI", "5WI"];
  const cols = isBowler ? bowlerCols : batterCols;
  const vals = isBowler
    ? [data.matches, data.wickets, data.avg, data.econ, data.sr, data.bbi, data.fwi]
    : [data.matches, data.runs, data.avg, data.sr, data.fifties, data.hundreds, data.hs];

  return (
    <div>
      <div style={{ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.bold, color: color, marginBottom: tokens.spacing.md, letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: tokens.fontFamily }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${tk.page.border}` }}>
              {cols.map(c => (
                <th key={c} style={{ padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`, fontSize: tokens.fontSize.xs + 1, fontWeight: tokens.fontWeight.semibold, color: tk.page.textMuted, textAlign: "right" }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {vals.map((v, i) => (
                <td key={i} style={{ padding: `${tokens.spacing.md}px ${tokens.spacing.md}px`, fontSize: tokens.fontSize.md, fontWeight: i === 0 ? tokens.fontWeight.normal : tokens.fontWeight.semibold, color: tk.page.text, textAlign: "right" }}>{v}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { tokens: tk, tournament } = useTheme();

  // Decode URL param and find player
  const nameParam = decodeURIComponent(params.name || "");
  const player = players.find(p => p.name.toLowerCase().replace(/\s+/g, "-") === nameParam.toLowerCase())
    || players.find(p => p.name.toLowerCase().includes(nameParam.toLowerCase()))
    || players[0];

  const team = getTeam(player.team);
  const isBowler = player.role === "Pacer" || player.role === "Spinner";
  const career = CAREER_STATS[player.name] || CAREER_STATS["default"];

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load AI analysis on mount
  useEffect(() => {
    const fetchAnalysis = async () => {
      setAiLoading(true);
      try {
        const res = await fetch("/api/player-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerName: player.name,
            recentStats: {
              team: player.team,
              role: player.role,
              rating: player.rating,
              recentPerformance: player.stat,
              note: player.note,
            },
          }),
        });
        const data = await res.json();
        setAiAnalysis(data);
      } catch {
        setAiAnalysis({ success: false, text: "AI analysis unavailable." });
      } finally {
        setAiLoading(false);
      }
    };
    fetchAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.name]);

  return (
    <div style={{
      minHeight: "100vh",
      background: tk.page.bg,
      fontFamily: tokens.fontFamily,
      color: tk.page.text,
    }}>

      {/* ── Hero Header ── */}
      <div style={{
        background: `linear-gradient(160deg, ${team.color}e0, ${team.color}90)`,
        padding: `${tokens.spacing.xl}px ${tokens.spacing.xxl}px ${tokens.spacing.xxxl + 8}px`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Stadium texture overlay */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at bottom, rgba(0,0,0,0.25) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: tokens.radius.md,
            color: "#fff",
            padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
            cursor: "pointer",
            fontSize: tokens.fontSize.md,
            fontFamily: tokens.fontFamily,
            fontWeight: tokens.fontWeight.medium,
            display: "flex",
            alignItems: "center",
            gap: tokens.spacing.sm,
            marginBottom: tokens.spacing.xxl,
            position: "relative",
          }}
        >
          ← Back
        </button>

        {/* Player identity */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: tokens.spacing.xxl, position: "relative" }}>
          {/* Avatar */}
          <div style={{
            width: 96,
            height: 96,
            borderRadius: tokens.radius.circle,
            background: "rgba(255,255,255,0.25)",
            border: "3px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            flexShrink: 0,
          }}>
            🏏
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md, marginBottom: tokens.spacing.sm, flexWrap: "wrap" }}>
              <h1 style={{ color: "#fff", fontWeight: tokens.fontWeight.black, fontSize: tokens.fontSize.h1 * 0.7, margin: 0, lineHeight: 1 }}>
                {player.name}
              </h1>
              <TeamLogo teamId={player.team} size={32} />
            </div>
            <div style={{ display: "flex", gap: tokens.spacing.md, flexWrap: "wrap", marginBottom: tokens.spacing.lg }}>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: tokens.radius.sm, padding: `3px ${tokens.spacing.md}px`, fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.semibold }}>{player.role}</span>
              <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: tokens.radius.sm, padding: `3px ${tokens.spacing.md}px`, fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.semibold }}>{team.name}</span>
              <TrendBadge trend={player.trend} />
            </div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: tokens.fontSize.xl }}>"{player.note}"</div>
          </div>

          {/* AI Rating */}
          <div style={{ textAlign: "center", flexShrink: 0 }}>
            <WinGauge pct={player.rating} color="#fff" size={84} label="AI Rating" />
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: tokens.layout.maxWidth, margin: "0 auto", padding: `${tokens.spacing.xxl}px ${tokens.spacing.lg}px` }}>
        <div style={{ display: "grid", gridTemplateColumns: `1fr ${tokens.layout.sidebarWidth}px`, gap: tokens.spacing.xl, alignItems: "start" }}>

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xl }}>

            {/* AI Analysis */}
            <Card hover={false} style={{ padding: tokens.spacing.xxl, background: `linear-gradient(135deg, rgba(0,212,255,0.05), rgba(123,45,255,0.05))`, border: `1px solid rgba(123,45,255,0.12)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md, marginBottom: tokens.spacing.lg }}>
                <div style={{ width: tokens.ai.orbSize, height: tokens.ai.orbSize, borderRadius: tokens.radius.circle, background: tokens.ai.gradient, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: tokens.fontWeight.extrabold, fontSize: tokens.fontSize.xl }}>KrixAI Player Intelligence</div>
                  <div style={{ fontSize: tokens.fontSize.xs + 1, letterSpacing: "0.08em", color: tk.page.textMuted, fontWeight: tokens.fontWeight.semibold }}>POWERED BY ARTIFICIAL INTELLIGENCE</div>
                </div>
              </div>

              {aiLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md, color: tk.page.textMuted }}>
                  <div style={{ width: 18, height: 18, border: `2px solid ${tournament.accent}`, borderTopColor: "transparent", borderRadius: tokens.radius.circle, animation: "spin 0.8s linear infinite" }} />
                  Analyzing {player.name}…
                </div>
              )}

              {!aiLoading && aiAnalysis && (
                <div>
                  <div style={{ fontSize: tokens.fontSize.lg, lineHeight: 1.75, color: tk.page.text, whiteSpace: "pre-line" }}>
                    {aiAnalysis.text}
                  </div>
                  {aiAnalysis.isDemo && (
                    <div style={{ marginTop: tokens.spacing.lg, padding: tokens.spacing.md, background: tokens.status.steadyBg, borderRadius: tokens.radius.md, fontSize: tokens.fontSize.md, color: tokens.status.steady }}>
                      ⚙️ Demo Mode — Add Anthropic API key to .env.local for live AI analysis
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Recent form */}
            <Card hover={false} style={{ padding: tokens.spacing.xxl }}>
              <div style={{ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.extrabold, color: tk.page.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: tokens.spacing.lg }}>Recent Form</div>
              <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.lg }}>
                <div style={{ flex: 1 }}>
                  <Sparkline data={career.recentScores} color={team.color} w={300} h={60} />
                </div>
                <div>
                  <div style={{ fontSize: tokens.fontSize.stat, fontWeight: tokens.fontWeight.extrabold, color: team.color }}>{player.stat}</div>
                  <div style={{ fontSize: tokens.fontSize.sm, color: tk.page.textMuted }}>Last match</div>
                </div>
              </div>
              {/* Recent scores row */}
              <div style={{ display: "flex", gap: tokens.spacing.sm, marginTop: tokens.spacing.lg, flexWrap: "wrap" }}>
                {career.recentScores.map((s, i) => (
                  <div key={i} style={{
                    width: 36, height: 36,
                    borderRadius: tokens.radius.sm,
                    background: s >= 50 ? team.color : s >= 30 ? team.color + "60" : tk.page.cardBg,
                    color: s >= 50 ? "#fff" : s >= 30 ? "#fff" : tk.page.textMuted,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: tokens.fontSize.sm,
                    fontWeight: tokens.fontWeight.bold,
                    border: `1px solid ${tk.page.borderLight}`,
                  }}>{s}</div>
                ))}
              </div>
            </Card>

            {/* Career stats */}
            <Card hover={false} style={{ padding: tokens.spacing.xxl }}>
              <div style={{ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.extrabold, color: tk.page.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: tokens.spacing.xl }}>Career Statistics</div>
              <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xxl }}>
                <CareerTable label="International T20" data={career.t20} isBowler={isBowler} tk={tk} color={tournament.accent} />
                <div style={{ borderTop: `1px solid ${tk.page.borderLight}`, paddingTop: tokens.spacing.xl }}>
                  <CareerTable label="IPL" data={career.ipl} isBowler={isBowler} tk={tk} color={team.color} />
                </div>
              </div>
            </Card>
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xl }}>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: tokens.spacing.md }}>
              {isBowler ? [
                { label: "Wickets (IPL)", value: career.ipl.wickets },
                { label: "Economy", value: career.ipl.econ },
                { label: "Average", value: career.ipl.avg },
                { label: "Strike Rate", value: career.ipl.sr },
              ] : [
                { label: "Runs (IPL)", value: career.ipl.runs },
                { label: "Average", value: career.ipl.avg },
                { label: "Strike Rate", value: career.ipl.sr },
                { label: "Fifties", value: career.ipl.fifties },
              ].map((s, i) => (
                <StatPill key={i} label={s.label} value={s.value} color={i === 0 ? team.color : undefined} tk={tk} />
              ))}
            </div>

            {/* Radar chart */}
            <Card hover={false} style={{ padding: tokens.spacing.xl, textAlign: "center" }}>
              <div style={{ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.extrabold, color: tk.page.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: tokens.spacing.md }}>Skill Breakdown</div>
              <RadarChart data={player.radar} color={team.color} size={200} />
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: tokens.spacing.sm, marginTop: tokens.spacing.md }}>
                {["Power", "Bowling", "Form", "Speed", "Field", "Tactical"].map((label, i) => (
                  <div key={label} style={{ fontSize: tokens.fontSize.xs + 1, color: tk.page.textMuted }}>
                    {label}: <span style={{ fontWeight: tokens.fontWeight.bold, color: team.color }}>{player.radar[i]}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Wagon wheel */}
            <Card hover={false} style={{ padding: tokens.spacing.xl, textAlign: "center" }}>
              <div style={{ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.extrabold, color: tk.page.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: tokens.spacing.md }}>Scoring Zones</div>
              <WagonWheel zones={player.zones} color={team.color} size={200} />
            </Card>

            {/* Player bio card */}
            <Card hover={false} style={{ padding: tokens.spacing.xl }}>
              <div style={{ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.extrabold, color: tk.page.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: tokens.spacing.lg }}>Profile</div>
              {[
                { label: "Team", value: team.name },
                { label: "Role", value: player.role },
                { label: "Tournament", value: "IPL 2026" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: `${tokens.spacing.sm}px 0`, borderBottom: `1px solid ${tk.page.borderLight}`, fontSize: tokens.fontSize.md }}>
                  <span style={{ color: tk.page.textMuted }}>{row.label}</span>
                  <span style={{ fontWeight: tokens.fontWeight.semibold }}>{row.value}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
