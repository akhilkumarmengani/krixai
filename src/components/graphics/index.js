"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

// ─── Animated Win Gauge ───
export function WinGauge({ pct, color, size = 80, label }) {
  const { tokens: tk } = useTheme();
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const [animVal, setAnimVal] = useState(0);

  useEffect(() => {
    let frame;
    const start = Date.now();
    const animate = () => {
      const progress = Math.min(1, (Date.now() - start) / tk.motion.gauge);
      setAnimVal(progress * pct);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pct, tk.motion.gauge]);

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={tk.page.border} strokeWidth={5}/>
        <circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ}
          strokeDashoffset={circ - (animVal / 100) * circ}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        <text x={size/2} y={size/2 - 4} textAnchor="middle"
          style={{ fontSize: size > 70 ? 20 : 14, fontWeight: tk.fontWeight.extrabold, fill: color, fontFamily: tk.fontFamily }}
        >{Math.round(animVal)}%</text>
        {label && (
          <text x={size/2} y={size/2 + 12} textAnchor="middle"
            style={{ fontSize: 9, fill: tk.page.textDim, fontFamily: tk.fontFamily, fontWeight: tk.fontWeight.medium }}
          >{label}</text>
        )}
      </svg>
    </div>
  );
}

// ─── Sparkline ───
export function Sparkline({ data, color, w = 120, h = 36 }) {
  if (!data?.length) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 8) - 4}`
  ).join(" ");
  const uid = `sp_${color.replace('#', '')}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${uid})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={w} cy={parseFloat(pts.split(" ").pop().split(",")[1])} r="3" fill={color}/>
    </svg>
  );
}

// ─── Momentum Line ───
export function MomentumLine({ data, c1, c2, w = 200, h = 50 }) {
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - mn) / rng) * (h - 12) - 6,
  ]);
  const line = pts.map(p => p.join(",")).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id="momGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={c1} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect x={0} y={h/2 - 0.5} width={w} height={1} fill="#e0e0e0"/>
      <polygon points={`0,${h/2} ${line} ${w},${h/2}`} fill="url(#momGrad)"/>
      <polyline points={line} fill="none" stroke={c1} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill={c1} stroke="#fff" strokeWidth="2"/>
    </svg>
  );
}

// ─── Radar Chart ───
export function RadarChart({ data, color, size = 170 }) {
  const labels = ["Power", "Bowling", "Form", "Speed", "Field", "Tactical"];
  const cx = size/2, cy = size/2, r = size/2 - 24, n = data.length;
  const step = (2 * Math.PI) / n;

  const xy = (i, v) => {
    const angle = step * i - Math.PI / 2;
    return [cx + Math.cos(angle) * r * v / 100, cy + Math.sin(angle) * r * v / 100];
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[25, 50, 75, 100].map(level => (
        <polygon key={level}
          points={Array.from({ length: n }, (_, i) => xy(i, level).join(",")).join(" ")}
          fill="none" stroke="#e0e0e0" strokeWidth="0.7"
        />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = xy(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e8e8e8" strokeWidth="0.7"/>;
      })}
      <polygon
        points={data.map((v, i) => xy(i, v).join(",")).join(" ")}
        fill={color + "20"} stroke={color} strokeWidth="2"
      />
      {data.map((v, i) => {
        const [x, y] = xy(i, v);
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5"/>;
      })}
      {labels.map((label, i) => {
        const [x, y] = xy(i, 118);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            style={{ fontSize: 9, fill: "#8a8d91", fontWeight: 500 }}
          >{label}</text>
        );
      })}
    </svg>
  );
}

// ─── Wagon Wheel ───
export function WagonWheel({ zones, color, size = 170 }) {
  const cx = size/2, cy = size/2 + 8, r = size/2 - 22;
  const angles = [-60, -120, 180, 0, 30, 150];
  const maxZone = Math.max(...zones);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.85} fill="#d4edda" stroke="#8bc49f" strokeWidth="1.5"/>
      <rect x={cx - 4} y={cy - 22} width={8} height={44} rx={2} fill="#c9b97a" stroke="#a89a5f" strokeWidth="0.5"/>
      {zones.map((z, i) => {
        const a = angles[i] * Math.PI / 180;
        const len = (z / maxZone) * r * 0.85;
        const x2 = cx + Math.cos(a) * len;
        const y2 = cy + Math.sin(a) * len;
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.7}/>
            <circle cx={x2} cy={y2} r={3} fill={color}/>
            <text x={x2 + Math.cos(a) * 12} y={y2 + Math.sin(a) * 12}
              textAnchor="middle" dominantBaseline="middle"
              style={{ fontSize: 9, fontWeight: 700, fill: color }}
            >{z}%</text>
          </g>
        );
      })}
      <text x={cx} y={size - 4} textAnchor="middle" style={{ fontSize: 9, fill: "#8a8d91" }}>Scoring Zones</text>
    </svg>
  );
}

// ─── Stadium Background ───
export function StadiumBg({ colors }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1200 320" preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
      <ellipse cx="600" cy="280" rx="500" ry="180" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
      <ellipse cx="600" cy="280" rx="420" ry="150" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <ellipse cx="600" cy="280" rx="340" ry="120" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      <rect x="585" y="210" width="30" height="90" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <line x1="578" y1="225" x2="622" y2="225" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <line x1="578" y1="285" x2="622" y2="285" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <ellipse cx="600" cy="260" rx="160" ry="90" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="6,4"/>
      {[[480,200],[720,200],[500,310],[700,310],[400,260],[800,260],[550,170],[650,170],[600,150],[600,340],[520,240],[680,240]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={colors[i % colors.length]} opacity="0.4">
          <animate attributeName="opacity" values="0.2;0.6;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}
