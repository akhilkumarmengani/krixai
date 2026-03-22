# KrixAI Project — Instructions for Claude Cowork

## Project Overview
KrixAI is an AI-powered cricket analytics platform targeting IPL 2026 (starts March 28, 2026).
Tech: Next.js 14, CricketData.org API, Anthropic Claude API (Haiku for chat, Sonnet for deep analysis).
Monetization: Ad revenue → B2B broadcasting → fantasy tools → subscriptions.

## Architecture Rules
- **Design tokens** live in `src/lib/tokens.js` — ALL visual values must come from here
- **Tournament configs** in `src/data/tournaments.js` — add new tournaments here only
- **Team data** in `src/data/teams.js` — all team colors and info
- **Components** use React Context via `useTheme()` from `src/context/ThemeContext.js`
- **API calls** go through `src/lib/api.js` (cricket data) and `src/lib/ai.js` (Claude AI)
- **API routes** live in `src/app/api/` — server-side only, keeps API keys secure
- **Static data** in `src/data/` — replace with real API calls incrementally

## Design System
- Font: Meta system font stack (SF Pro / Segoe UI / Roboto)
- Style: Light theme (#f0f2f5 background), white cards, soft shadows
- Header: Tournament-gradient with stadium SVG, floating team badges, AI branding
- Components: Card, Badge, TrendBadge, TeamLogo in `src/components/ui/`
- Graphics: WinGauge, Sparkline, MomentumLine, RadarChart, WagonWheel in `src/components/graphics/`
- AI branding must be bold and prominent — "POWERED BY ARTIFICIAL INTELLIGENCE" always visible

## Code Standards
- Use "use client" directive for all components with state/effects
- All styles use inline React style objects (no CSS modules)
- Every hardcoded value should reference tokens.js
- Keep AI API responses capped at 512 tokens (cost control)
- Chat uses Haiku 4.5 (cheap), deep analysis uses Sonnet 4.6 (quality)

## Current State
- MVP homepage is built with Feed, Matches, Insights, Players, Ask AI tabs
- Demo data is in place — real API integration pending
- Deployment ready for Vercel (vercel.json included)
- AdSense component created but not yet configured

## Priority Tasks (in order)
1. Connect CricketData.org API to replace demo match data with real IPL fixtures
2. Wire up Claude API for live AI chat responses
3. Create individual match detail pages (/match/[id]) with live scorecard
4. Create player profile pages (/player/[name]) with AI analysis
5. Add Google AdSense ad placements between feed cards and in sidebar
6. Add Open Graph images for social sharing
7. Create blog/articles section for SEO content
8. Build email signup for newsletter/waitlist
9. Add fantasy cricket AI team builder feature
10. Create API documentation for B2B broadcasting clients

## When Making Changes
- Always preserve the tournament theming system — UI must adapt per tournament
- Test that tournament switcher (IPL/T20 WC/Ashes) still works after changes
- Keep the component library reusable — don't inline styles that should be components
- Add new data files in `src/data/`, new components in appropriate `src/components/` subfolder
- Update README.md if you add new features or change architecture
