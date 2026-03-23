"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { getTeam } from "@/data/teams";

// ── Accuracy Gauge (SVG circle) ──────────────────────────────────────────────
function AccuracyGauge({ pct, correct }) {
  const size    = 96;
  const stroke  = 9;
  const r       = (size - stroke) / 2;
  const circ    = 2 * Math.PI * r;
  const offset  = circ - (pct / 100) * circ;
  const color   = correct ? "#16a34a" : "#FF6B00";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#f0f0f0" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900, color, letterSpacing: "-0.03em", lineHeight: 1 }}>
          {pct}%
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {correct ? "Correct" : "Partial"}
        </div>
      </div>
    </div>
  );
}

// ── Score Bar for completed match ─────────────────────────────────────────────
function ScoreBar({ team1, team2, winner }) {
  const t1 = getTeam(team1.code);
  const t2 = getTeam(team2.code);
  const t1Won = winner === team1.name || winner === team1.code;
  const t2Won = winner === team2.name || winner === team2.code;

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {/* Team 1 */}
      <div style={{ flex: 1, textAlign: "center" }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: t1.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff",
            margin: "0 auto 5px",
            boxShadow: t1Won ? `0 0 0 3px ${t1.color}40, 0 4px 12px ${t1.color}50` : "none",
          }}
        >
          {team1.code}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: t1Won ? t1.color : "#333", marginBottom: 2 }}>
          {team1.name.split(" ").slice(-1)[0]}
        </div>
        {team1.score && (
          <div style={{ fontSize: 14, fontWeight: 700, color: t1Won ? t1.color : "#555" }}>
            {team1.score}
          </div>
        )}
        {t1Won && (
          <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 3 }}>
            ✓ Won
          </div>
        )}
      </div>

      {/* VS */}
      <div style={{ fontSize: 12, fontWeight: 700, color: "#ccc" }}>VS</div>

      {/* Team 2 */}
      <div style={{ flex: 1, textAlign: "center" }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 12,
            background: t2.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff",
            margin: "0 auto 5px",
            boxShadow: t2Won ? `0 0 0 3px ${t2.color}40, 0 4px 12px ${t2.color}50` : "none",
          }}
        >
          {team2.code}
        </div>
        <div style={{ fontSize: 12, fontWeight: 800, color: t2Won ? t2.color : "#333", marginBottom: 2 }}>
          {team2.name.split(" ").slice(-1)[0]}
        </div>
        {team2.score && (
          <div style={{ fontSize: 14, fontWeight: 700, color: t2Won ? t2.color : "#555" }}>
            {team2.score}
          </div>
        )}
        {t2Won && (
          <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 3 }}>
            ✓ Won
          </div>
        )}
      </div>
    </div>
  );
}

// ── Prediction vs Actual Row ─────────────────────────────────────────────────
function PredictionRow({ prediction, winner, team1, team2 }) {
  if (!prediction) return null;

  const { predictedTeam, confidence, correct } = prediction;
  const predictedCode = predictedTeam === team1.name ? team1.code
                      : predictedTeam === team2.name ? team2.code
                      : predictedTeam;
  const actualCode    = winner === team1.name ? team1.code
                      : winner === team2.name ? team2.code
                      : winner;
  const pTeam = getTeam(predictedCode);
  const aTeam = getTeam(actualCode);

  return (
    <div
      style={{
        display: "flex", gap: 0, borderRadius: 12,
        overflow: "hidden", border: "1px solid #ebebeb",
        marginTop: 14,
      }}
    >
      {/* KrixAI predicted */}
      <div style={{ flex: 1, padding: "12px 14px", background: "#f7f8ff" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#003DA5", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          ✦ KrixAI Predicted
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: pTeam.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: "#fff",
            }}
          >
            {predictedCode}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a" }}>
              {predictedTeam.split(" ").slice(-1)[0]} Win
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>{confidence}% confident</div>
          </div>
        </div>
      </div>

      {/* Divider with result icon */}
      <div
        style={{
          width: 40, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: correct ? "#f0fdf4" : "#fff7ed",
          fontSize: 18,
        }}
      >
        {correct ? "✅" : "⚠️"}
      </div>

      {/* Actual result */}
      <div style={{ flex: 1, padding: "12px 14px", background: "#fafafa" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Actual Result
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: aTeam.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: "#fff",
            }}
          >
            {actualCode}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: correct ? "#16a34a" : "#0a0a0a" }}>
              {(winner || "").split(" ").slice(-1)[0]} Won
              {correct && " ✓"}
            </div>
            <div style={{ fontSize: 11, color: "#888" }}>{correct ? "Called it!" : "Wrong call"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton({ h = 16, w = "100%", radius = 6, mb = 0 }) {
  return (
    <div
      style={{
        height: h, width: w, borderRadius: radius,
        background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease infinite",
        marginBottom: mb,
      }}
    />
  );
}

// ── Main Section ─────────────────────────────────────────────────────────────
export default function PreviousMatchSection() {
  const { tokens: tk } = useTheme();
  const [prevMatch, setPrevMatch] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/ipl", { cache: "no-store" })
      .then(r => r.json())
      .then(json => {
        setPrevMatch(json.previous || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Don't render at all if no data and not loading
  if (!loading && !prevMatch) return null;

  const prediction = prevMatch?.prediction;
  const correct    = prediction?.correct;
  const accuracyPct = prediction
    ? (correct ? prediction.confidence : Math.max(100 - prediction.confidence, 20))
    : 0;

  return (
    <section
      style={{
        background: "#fff",
        borderTop: "1px solid #ebebeb",
        borderBottom: "1px solid #ebebeb",
      }}
    >
      <div
        style={{
          maxWidth: tk.layout.maxWidth + 80,
          margin: "0 auto",
          padding: "48px 32px",
        }}
      >
        {/* Section heading */}
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#f7f8ff", border: "1px solid #e0e8ff",
              borderRadius: 100, padding: "4px 12px 4px 8px",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 18, height: 18, background: "#003DA5",
                borderRadius: "50%", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 8, color: "#fff", fontWeight: 800,
              }}
            >
              ✦
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#003DA5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Last Match · Prediction Accuracy
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900,
              letterSpacing: "-0.03em", color: "#0a0a0a",
              margin: 0, fontFamily: tk.fontFamily,
            }}
          >
            How KrixAI Called{" "}
            <span style={{ color: "#FF6B00" }}>Yesterday&apos;s Match</span>
          </h2>
        </div>

        {loading ? (
          /* Loading state */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div style={{ background: "#fafafa", borderRadius: 16, padding: 24 }}>
              <Skeleton h={12} w="60%" mb={16} />
              <Skeleton h={44} mb={12} />
              <Skeleton h={32} mb={8} />
              <Skeleton h={24} />
            </div>
            <div style={{ background: "#fafafa", borderRadius: 16, padding: 24 }}>
              <Skeleton h={12} w="60%" mb={16} />
              <Skeleton h={96} w={96} radius={96} mb={12} />
              <Skeleton h={20} w="80%" mb={8} />
              <Skeleton h={16} w="60%" />
            </div>
          </div>
        ) : prevMatch ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

            {/* Left: Match result card */}
            <div
              style={{
                background: "#fafafa",
                border: "1px solid #ebebeb",
                borderRadius: 16,
                padding: 24,
              }}
            >
              {/* Match name + date */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 500, marginBottom: 4 }}>
                  {prevMatch.date
                    ? new Date(prevMatch.date).toLocaleDateString("en-IN", {
                        weekday: "long", day: "numeric", month: "long",
                      })
                    : ""}
                  {prevMatch.venue ? ` · ${prevMatch.venue.split(",")[0]}` : ""}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0a0a0a", lineHeight: 1.3 }}>
                  {prevMatch.name}
                </div>
              </div>

              {/* Score bars */}
              <ScoreBar
                team1={prevMatch.team1}
                team2={prevMatch.team2}
                winner={prevMatch.winner}
              />

              {/* Result string */}
              {prevMatch.status && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "8px 12px",
                    background: "#f0fdf4",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#15803d",
                    borderLeft: "3px solid #16a34a",
                  }}
                >
                  {prevMatch.status}
                </div>
              )}

              {/* Predicted vs Actual */}
              <PredictionRow
                prediction={prediction}
                winner={prevMatch.winner}
                team1={prevMatch.team1}
                team2={prevMatch.team2}
              />
            </div>

            {/* Right: Accuracy card */}
            <div
              style={{
                background: correct ? "#f0fdf4" : "#fff7ed",
                border: `1px solid ${correct ? "#bbf7d0" : "#fed7aa"}`,
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Header */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: correct ? "#15803d" : "#9a3412", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  KrixAI Accuracy Score
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0a0a0a", lineHeight: 1.4 }}>
                  {correct
                    ? "KrixAI called the right winner with high confidence."
                    : "KrixAI had the wrong favourite this time."}
                </div>
              </div>

              {/* Gauge */}
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <AccuracyGauge pct={accuracyPct} correct={correct} />
                <div>
                  {prediction && (
                    <>
                      <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 8 }}>
                        <strong>Predicted:</strong>{" "}
                        {prediction.predictedTeam.split(" ").slice(-1)[0]} win at{" "}
                        {prediction.confidence}% confidence
                      </div>
                      <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>
                        <strong>Actual:</strong>{" "}
                        {prevMatch.status || "Match completed"}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div
                style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 12, marginTop: 4,
                }}
              >
                {[
                  {
                    label: "Winner Predicted",
                    value: correct ? "✓ Yes" : "✗ No",
                    color: correct ? "#16a34a" : "#dc2626",
                  },
                  {
                    label: "Model Confidence",
                    value: `${prediction?.confidence || 0}%`,
                    color: "#003DA5",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: 10, padding: "10px 14px",
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 900, color: stat.color, letterSpacing: "-0.02em" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginTop: 2 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div
                style={{
                  fontSize: 12, color: "#555", fontStyle: "italic",
                  paddingTop: 8, borderTop: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                Predictions improve as the season progresses — KrixAI learns from every match.
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
