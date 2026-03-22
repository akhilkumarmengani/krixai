# KrixAI AI — Cricket Intelligence Powered by AI

AI-powered cricket analytics platform for IPL 2026 and beyond.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.js           # Root layout + ThemeProvider
│   ├── page.js             # Home page (assembles sections)
│   └── api/
│       ├── chat/route.js   # AI chat endpoint (Claude API)
│       └── matches/route.js # Match data endpoint
│
├── components/
│   ├── ui/                 # Reusable UI: Card, Badge, TeamLogo, etc
│   ├── graphics/           # SVG: WinGauge, Sparkline, Radar, WagonWheel
│   └── sections/           # Page sections: Header, Feed, Matches, etc
│
├── context/
│   └── ThemeContext.js      # Global theme provider (tokens + tournament)
│
├── data/                   # Static data (replace with API calls)
│   ├── tournaments.js      # Tournament configs + theming
│   ├── teams.js            # Team colors + info
│   ├── matches.js          # Demo match data
│   ├── players.js          # Demo player data
│   └── insights.js         # Demo AI insights
│
├── hooks/
│   └── useCountdown.js     # Countdown timer hook
│
├── lib/
│   ├── tokens.js           # ★ DESIGN TOKENS — change to reskin
│   ├── api.js              # CricketData.org API client
│   └── ai.js               # Claude AI service
│
└── styles/
    └── globals.css          # Animations + global resets
```

## How to Customize

### Change the entire visual design
Edit `src/lib/tokens.js` — every color, font size, spacing, shadow, and radius is defined here.

### Add a new tournament
Add a new entry in `src/data/tournaments.js` with gradient, accent color, and team colors. The entire UI adapts automatically.

### Switch to dark mode
In `src/lib/tokens.js`, replace `tokens.page` with the `darkPageTokens` export. Everything cascades.

### Connect real cricket data
1. Sign up at https://cricketdata.org
2. Add your API key to `.env.local`
3. The API client in `src/lib/api.js` is already configured

### Enable AI analysis
1. Get a Claude API key from https://console.anthropic.com
2. Add to `.env.local`
3. The chat and analysis functions in `src/lib/ai.js` will activate automatically

## Tech Stack

- **Next.js 14** — React framework with App Router, SSR, API routes
- **React 18** — UI components with hooks
- **CricketData.org API** — Live scores and match data (MVP)
- **Claude API** — AI-powered analysis and chat
- **Pure CSS/SVG** — No UI library dependencies, fully custom

## Roadmap

- [ ] Connect CricketData.org API for live scores
- [ ] Enable Claude AI chat with real responses
- [ ] Add individual match detail pages (/match/[id])
- [ ] Add player profile pages (/player/[name])
- [ ] Implement Google AdSense for revenue
- [ ] Add user accounts + premium tier
- [ ] Switch to Roanuz API for better real-time data
- [ ] Build fantasy cricket AI assistant
- [ ] Create B2B broadcasting API/dashboard
