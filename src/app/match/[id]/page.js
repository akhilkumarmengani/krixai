"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Card, Badge, TeamLogo } from "@/components/ui";
import { WinGauge, MomentumLine } from "@/components/graphics";
import { matches } from "@/data/matches";
import { getTeam } from "@/data/teams";
import { tokens } from "@/lib/tokens";

// ─── Demo scorecard data (replace with real API call) ───
const DEMO_SCORECARD = {
  batting1: [
    { name: "Faf du Plessis", runs: 45, balls: 30, fours: 5, sixes: 2, sr: 150.0, out: "c Bhuvneshwar b Cummins" },
    { name: "Virat Kohli",    runs: 87, balls: 52, fours: 8, sixes: 4, sr: 167.3, out: "not out" },
    { name: "Glenn Maxwell",  runs: 34, balls: 18, fours: 3, sixes: 2, sr: 188.9, out: "b Rashid Khan" },
    { name: "Rajat Patidar",  runs: 22, balls: 16, fours: 2, sixes: 1, sr: 137.5, out: "lbw b Natarajan" },
    { name: "Dinesh Karthik", runs: 18, balls: 10, fours: 1, sixes: 1, sr: 180.0, out: "c sub b Bhuvneshwar" },
    { name: "Anuj Rawat",     runs: 4,  balls: 4,  fours: 0, sixes: 0, sr: 100.0, out: "run out" },
  ],
  bowling1: [
    { name: "Pat Cummins",      overs: 4, maidens: 0, runs: 38, wickets: 2, econ: 9.5, dots: 8 },
    { name: "Bhuvneshwar Kumar",overs: 4, maidens: 0, runs: 32, wickets: 2, econ: 8.0, dots: 10 },
    { name: "Rashid Khan",      overs: 4, maidens: 0, runs: 22, wickets: 1, econ: 5.5, dots: 14 },
    { name: "T Natarajan",      overs: 4, maidens: 0, runs: 40, wickets: 1, econ: 10.0, dots: 6 },
    { name: "Washington Sundar",overs: 4, maidens: 0, runs: 36, wickets: 0, econ: 9.0, dots: 7 },
  ],
  batting2: [
    { name: "Abhishek Sharma",  runs: 62, balls: 38, fours: 6, sixes: 3, sr: 163.2, out: "c Kohli b Siraj" },
    { name: "Travis Head",      runs: 41, balls: 27, fours: 4, sixes: 2, sr: 151.9, out: "b Hazlewood" },
    { name: "Aiden Markram",    runs: 33, balls: 22, fours: 3, sixes: 1, sr: 150.0, out: "c Maxwell b Hazlewood" },
    { name: "Heinrich Klaasen", runs: 28, balls: 16, fours: 2, sixes: 2, sr: 175.0, out: "not out" },
    { name: "Pat Cummins",      runs: 14, balls: 9,  fours: 1, sixes: 1, sr: 155.6, out: "c Karthik b Siraj" },
    { name: "Washington Sundar",runs: 8,  balls: 7,  fours: 1, sixes: 0, sr: 114.3, out: "not out" },
  ],
  bowling2: [
    { name: "Mohammed Siraj",   overs: 4, maidens: 0, runs: 44, wickets: 2, econ: 11.0, dots: 5 },
    { name: "Josh Hazlewood",   overs: 4, maidens: 0, runs: 28, wickets: 2, econ: 7.0, dots: 12 },
    { name: "Glenn Maxwell",    overs: 2, maidens: 0, runs: 22, wickets: 0, econ: 11.0, dots: 3 },
    { name: "Yuzvendras Chahal",overs: 4, maidens: 0, runs: 36, wickets: 0, econ: 9.0, dots: 8 },
    { name: "Karn Sharma",      overs: 2, maidens: 0, runs: 20, wickets: 0, econ: 10.0, dots: 4 },
  ],
  score1: "210/5 (20 ov)",
  score2: "186/5 (20 ov)",
  result: "RCB won by 24 runs",
  ballByBall: [6, 1, 4, 0, 2, 1, 4, 6, 0, 0, 1, 4, 2, 1, 6, 0, 4, 1, 2, 6, 4, 0, 1, 2, 4, 6, 1, 0, 4, 2],
};

// ─── Ball-by-ball timeline dot ───
function BallDot({ val, tk }) {
  const isWicket = val === "W";
  const isSix = val === 6;
  const isFour = val === 4;
  const bg = isWicket ? tokens.status.danger
    : isSix ? "#7c3aed"
    : isFour ? "#0284c7"
    : val === 0 ? tk.page.borderLight
    : tk.page.inputBg;
  const color = isWicket || isSix || isFour ? "#fff" : tk.page.textMuted;

  return (
    <div style={{
      width: 28, height: 28,
      borderRadius: tokens.radius.circle,
      background: bg,
      color: color,
      fontSize: tokens.fontSize.xs + 1,
      fontWeight: tokens.fontWeight.bold,
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `1px solid ${isWicket ? tokens.status.danger : isSix ? "#7c3aed30" : isFour ? "#0284c730" : tk.page.border}`,
      fontFamily: tokens.fontFamily,
    }}>
      {isWicket ? "W" : val}
    </div>
  );
}

// ─── Scorecard table ───
function BattingTable({ rows, tk, teamColor }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: tokens.fontFamily }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${tk.page.border}` }}>
            {["Batter", "Dismissal", "R", "B", "4s", "6s", "SR"].map(h => (
              <th key={h} style={{
                padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                textAlign: h === "Batter" || h === "Dismissal" ? "left" : "right",
                fontSize: tokens.fontSize.sm,
                fontWeight: tokens.fontWeight.semibold,
                color: tk.page.textMuted,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{
              borderBottom: `1px solid ${tk.page.borderLight}`,
              background: i % 2 === 0 ? "transparent" : tk.page.cardBg,
            }}>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.semibold }}>
                <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm }}>
                  <div style={{ width: 3, height: 18, borderRadius: 2, background: r.out === "not out" ? teamColor : "transparent" }} />
                  {r.name}
                  {r.out === "not out" && (
                    <span style={{ fontSize: tokens.fontSize.xs, color: tokens.status.up, fontWeight: tokens.fontWeight.bold }}>★</span>
                  )}
                </div>
              </td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, fontSize: tokens.fontSize.sm, color: tk.page.textMuted, maxWidth: 200 }}>{r.out}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.bold, color: r.runs >= 50 ? teamColor : tk.page.text }}>{r.runs}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.md }}>{r.balls}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.md, color: "#0284c7" }}>{r.fours}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.md, color: "#7c3aed" }}>{r.sixes}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.sm, color: r.sr >= 150 ? tokens.status.up : tk.page.textMuted }}>{r.sr.toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BowlingTable({ rows, tk }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: tokens.fontFamily }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${tk.page.border}` }}>
            {["Bowler", "O", "M", "R", "W", "Econ", "Dots"].map(h => (
              <th key={h} style={{
                padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
                textAlign: h === "Bowler" ? "left" : "right",
                fontSize: tokens.fontSize.sm,
                fontWeight: tokens.fontWeight.semibold,
                color: tk.page.textMuted,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{
              borderBottom: `1px solid ${tk.page.borderLight}`,
              background: i % 2 === 0 ? "transparent" : tk.page.cardBg,
            }}>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.semibold }}>{r.name}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.md }}>{r.overs}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.md }}>{r.maidens}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.md }}>{r.runs}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.bold, color: r.wickets >= 2 ? tokens.status.danger : tk.page.text }}>{r.wickets}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.sm, color: r.econ <= 7 ? tokens.status.up : r.econ >= 10 ? tokens.status.danger : tk.page.textMuted }}>{r.econ.toFixed(1)}</td>
              <td style={{ padding: `${tokens.spacing.sm + 2}px ${tokens.spacing.md}px`, textAlign: "right", fontSize: tokens.fontSize.sm, color: tk.page.textMuted }}>{r.dots}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Section header ───
function SectionLabel({ children, tk, color }) {
  return (
    <div style={{
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.extrabold,
      letterSpacing: "0.08em",
      color: color || tk.page.textMuted,
      textTransform: "uppercase",
      marginBottom: tokens.spacing.md,
      display: "flex",
      alignItems: "center",
      gap: tokens.spacing.sm,
    }}>
      {children}
    </div>
  );
}

// ─── Main Page ───
export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tokens: tk, tournament } = useTheme();

  const matchId = parseInt(params.id, 10);
  const match = matches.find(m => m.id === matchId) || matches[0];
  const teamA = getTeam(match.t1);
  const teamB = getTeam(match.t2);
  const sc = DEMO_SCORECARD;

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("scorecard");

  // Load AI analysis on mount
  useEffect(() => {
    const fetchAnalysis = async () => {
      setAiLoading(true);
      try {
        const res = await fetch("/api/match-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            team1: teamA.name,
            team2: teamB.name,
            venue: match.venue,
            date: match.date,
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
  }, [matchId]);

  const tabs = [
    { id: "scorecard", label: "Scorecard" },
    { id: "timeline",  label: "Ball by Ball" },
    { id: "ai",        label: "🤖 AI Analysis" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: tk.page.bg,
      fontFamily: tokens.fontFamily,
      color: tk.page.text,
    }}>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${teamA.color}, ${teamB.color})`,
        padding: `${tokens.spacing.xl}px ${tokens.spacing.xxl}px`,
        position: "relative",
        overflow: "hidden",
      }}>
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
            marginBottom: tokens.spacing.xl,
          }}
        >
          ← Back
        </button>

        {/* Match meta */}
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.85)", fontSize: tokens.fontSize.md, marginBottom: tokens.spacing.lg }}>
          📍 {match.venue} · {match.date} · {match.time} IST
        </div>

        {/* Teams vs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: tokens.spacing.xxxl }}>
          <div style={{ textAlign: "center" }}>
            <TeamLogo teamId={match.t1} size={72} />
            <div style={{ color: "#fff", fontWeight: tokens.fontWeight.extrabold, fontSize: tokens.fontSize.h4, marginTop: tokens.spacing.md }}>{teamA.name}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: tokens.fontSize.xl, marginTop: 4 }}>{sc.score1}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              background: "rgba(255,255,255,0.2)",
              borderRadius: tokens.radius.xl,
              padding: `${tokens.spacing.sm}px ${tokens.spacing.xl}px`,
              color: "#fff",
              fontWeight: tokens.fontWeight.extrabold,
              fontSize: tokens.fontSize.h4,
              letterSpacing: 2,
              backdropFilter: "blur(8px)",
            }}>VS</div>
            <div style={{
              marginTop: tokens.spacing.lg,
              background: "rgba(255,255,255,0.9)",
              borderRadius: tokens.radius.md,
              padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
              color: teamA.color,
              fontWeight: tokens.fontWeight.bold,
              fontSize: tokens.fontSize.sm,
            }}>{sc.result}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <TeamLogo teamId={match.t2} size={72} />
            <div style={{ color: "#fff", fontWeight: tokens.fontWeight.extrabold, fontSize: tokens.fontSize.h4, marginTop: tokens.spacing.md }}>{teamB.name}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: tokens.fontSize.xl, marginTop: 4 }}>{sc.score2}</div>
          </div>
        </div>

        {/* Win probability gauges */}
        <div style={{ display: "flex", justifyContent: "center", gap: tokens.spacing.xxxl, marginTop: tokens.spacing.xl }}>
          <div style={{ textAlign: "center" }}>
            <WinGauge pct={match.prob[0]} color="#fff" size={72} label={teamA.short} />
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: tokens.fontSize.sm, marginTop: 4 }}>Win Prob</div>
          </div>
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <MomentumLine data={match.momentum} c1={teamA.color} c2={teamB.color} w={200} h={50} />
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: tokens.fontSize.xs, marginTop: 4, letterSpacing: "0.08em" }}>MOMENTUM</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <WinGauge pct={match.prob[1]} color="#fff" size={72} label={teamB.short} />
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: tokens.fontSize.sm, marginTop: 4 }}>Win Prob</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        background: tk.page.surface,
        borderBottom: `1px solid ${tk.page.border}`,
        display: "flex",
        justifyContent: "center",
        gap: 0,
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: tokens.shadow.sm,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: tokens.fontFamily,
              fontSize: tokens.fontSize.lg,
              fontWeight: activeTab === tab.id ? tokens.fontWeight.bold : tokens.fontWeight.medium,
              color: activeTab === tab.id ? tournament.accent : tk.page.textMuted,
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? `3px solid ${tournament.accent}` : "3px solid transparent",
              padding: `${tokens.spacing.lg}px ${tokens.spacing.xxl + 4}px`,
              cursor: "pointer",
              transition: `all ${tokens.motion.fast}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: tokens.layout.maxWidth, margin: "0 auto", padding: `${tokens.spacing.xxl}px ${tokens.spacing.lg}px` }}>

        {/* SCORECARD TAB */}
        {activeTab === "scorecard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xl }}>

            {/* Innings 1 */}
            <Card hover={false} style={{ overflow: "hidden" }}>
              <div style={{ height: 4, background: teamA.color }} />
              <div style={{ padding: tokens.spacing.xl }}>
                <SectionLabel tk={tk} color={teamA.color}>
                  <TeamLogo teamId={match.t1} size={24} />
                  {teamA.name} — {sc.score1}
                </SectionLabel>
                <BattingTable rows={sc.batting1} tk={tk} teamColor={teamA.color} />
                <div style={{ margin: `${tokens.spacing.xl}px 0 ${tokens.spacing.md}px`, borderTop: `1px solid ${tk.page.border}`, paddingTop: tokens.spacing.xl }}>
                  <SectionLabel tk={tk}>Bowling — {teamB.short}</SectionLabel>
                </div>
                <BowlingTable rows={sc.bowling1} tk={tk} />
              </div>
            </Card>

            {/* Innings 2 */}
            <Card hover={false} style={{ overflow: "hidden" }}>
              <div style={{ height: 4, background: teamB.color }} />
              <div style={{ padding: tokens.spacing.xl }}>
                <SectionLabel tk={tk} color={teamB.color}>
                  <TeamLogo teamId={match.t2} size={24} />
                  {teamB.name} — {sc.score2}
                </SectionLabel>
                <BattingTable rows={sc.batting2} tk={tk} teamColor={teamB.color} />
                <div style={{ margin: `${tokens.spacing.xl}px 0 ${tokens.spacing.md}px`, borderTop: `1px solid ${tk.page.border}`, paddingTop: tokens.spacing.xl }}>
                  <SectionLabel tk={tk}>Bowling — {teamA.short}</SectionLabel>
                </div>
                <BowlingTable rows={sc.bowling2} tk={tk} />
              </div>
            </Card>
          </div>
        )}

        {/* BALL BY BALL TAB */}
        {activeTab === "timeline" && (
          <Card hover={false} style={{ padding: tokens.spacing.xxl }}>
            <SectionLabel tk={tk} color={tournament.accent}>Ball-by-Ball Timeline</SectionLabel>
            <div style={{ fontSize: tokens.fontSize.md, color: tk.page.textMuted, marginBottom: tokens.spacing.xl }}>
              First 30 balls shown. Connect CricketData.org API for full live ball-by-ball data.
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: tokens.spacing.xl, marginBottom: tokens.spacing.xxl, flexWrap: "wrap" }}>
              {[
                { color: "#7c3aed", bg: "#7c3aed", label: "Six" },
                { color: "#0284c7", bg: "#0284c7", label: "Four" },
                { color: tokens.status.danger, bg: tokens.status.danger, label: "Wicket" },
                { color: tk.page.textMuted, bg: tk.page.inputBg, label: "Other" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: tokens.spacing.sm, fontSize: tokens.fontSize.sm, color: tk.page.textMuted }}>
                  <div style={{ width: 14, height: 14, borderRadius: tokens.radius.circle, background: l.bg }} />
                  {l.label}
                </div>
              ))}
            </div>

            {/* Over rows */}
            {Array.from({ length: Math.ceil(sc.ballByBall.length / 6) }, (_, overIdx) => {
              const balls = sc.ballByBall.slice(overIdx * 6, overIdx * 6 + 6);
              const overRuns = balls.reduce((s, b) => s + (b === "W" ? 0 : b), 0);
              return (
                <div key={overIdx} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.spacing.lg,
                  marginBottom: tokens.spacing.lg,
                  padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
                  background: tk.page.cardBg,
                  borderRadius: tokens.radius.md,
                }}>
                  <div style={{ minWidth: 52, fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.bold, color: tk.page.textMuted }}>
                    Over {overIdx + 1}
                  </div>
                  <div style={{ display: "flex", gap: tokens.spacing.sm, flex: 1 }}>
                    {balls.map((b, bi) => <BallDot key={bi} val={b} tk={tk} />)}
                  </div>
                  <div style={{ fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.bold, color: tournament.accent, minWidth: 40, textAlign: "right" }}>
                    {overRuns} runs
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        {/* AI ANALYSIS TAB */}
        {activeTab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacing.xl }}>

            {/* AI branding header */}
            <Card hover={false} style={{ padding: tokens.spacing.xxl, background: `linear-gradient(135deg, rgba(0,212,255,0.06), rgba(123,45,255,0.06))`, border: `1px solid rgba(123,45,255,0.15)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md, marginBottom: tokens.spacing.lg }}>
                <div style={{ width: tokens.ai.orbSize, height: tokens.ai.orbSize, borderRadius: tokens.radius.circle, background: tokens.ai.gradient }} />
                <div>
                  <div style={{ fontWeight: tokens.fontWeight.extrabold, fontSize: tokens.fontSize.h4 }}>CricMind AI Analysis</div>
                  <div style={{ fontSize: tokens.fontSize.sm, letterSpacing: "0.08em", color: tk.page.textMuted, fontWeight: tokens.fontWeight.semibold }}>POWERED BY ARTIFICIAL INTELLIGENCE</div>
                </div>
              </div>

              {aiLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: tokens.spacing.md, color: tk.page.textMuted }}>
                  <div style={{ width: 18, height: 18, border: `2px solid ${tournament.accent}`, borderTopColor: "transparent", borderRadius: tokens.radius.circle, animation: "spin 0.8s linear infinite" }} />
                  Generating AI analysis for {teamA.short} vs {teamB.short}…
                </div>
              )}

              {!aiLoading && aiAnalysis && (
                <div style={{
                  fontSize: tokens.fontSize.lg,
                  lineHeight: 1.75,
                  color: tk.page.text,
                  whiteSpace: "pre-line",
                }}>
                  {aiAnalysis.text}
                  {aiAnalysis.isDemo && (
                    <div style={{ marginTop: tokens.spacing.lg, padding: tokens.spacing.md, background: tokens.status.steadyBg, borderRadius: tokens.radius.md, fontSize: tokens.fontSize.md, color: tokens.status.steady }}>
                      ⚙️ Demo Mode — Add your Anthropic API key to .env.local for live AI analysis
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Key stats summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: tokens.spacing.lg }}>
              {[
                { label: "Top Scorer", value: "V. Kohli", sub: "87*(52) · SR 167", color: teamA.color },
                { label: "Best Bowler", value: "J. Hazlewood", sub: "2/28 · Econ 7.0", color: teamB.color },
                { label: "Match SR", value: "148.2", sub: "Combined strike rate", color: tournament.accent },
                { label: "Boundaries", value: "38", sub: "26 fours · 12 sixes", color: "#7c3aed" },
              ].map((stat, i) => (
                <Card key={i} style={{ padding: tokens.spacing.xl }}>
                  <div style={{ fontSize: tokens.fontSize.sm, color: tk.page.textMuted, marginBottom: tokens.spacing.sm }}>{stat.label}</div>
                  <div style={{ fontSize: tokens.fontSize.h3, fontWeight: tokens.fontWeight.extrabold, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: tokens.fontSize.sm, color: tk.page.textMuted, marginTop: tokens.spacing.sm }}>{stat.sub}</div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spin animation */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
