# KrixAI — API Integration Feature Plan
**cricketdata.org (CricAPI) · Free + Paid Tier**

---

## API Endpoints Available

All calls go to `https://api.cricapi.com/v1/` with `?apikey=YOUR_KEY`.

| Endpoint | Tier | Returns |
|----------|------|---------|
| `GET /currentMatches?offset=0` | Free | Live/upcoming matches: id, name, status, matchType, venue, date, teams, score[], fantasyEnabled |
| `GET /matches?offset=0` | Free | All matches (same schema as above + tossWinner, tossChoice, matchWinner) |
| `GET /match_info?id=...` | Free | Full match detail: teams, score (r/w/o per inning), toss, winner, series_id |
| `GET /series?offset=0` | Free | Tournament list: id, name, startDate, endDate, odi/t20/test counts, squads, matches |
| `GET /series_info?id=...` | Free | Series detail + full matchList |
| `GET /players?offset=0` | Free | Player list: id, name, country |
| `GET /players?search=Kohli` | Free | Player search by name |
| `GET /players_info?id=...` | Free | Player profile: role, battingStyle, bowlingStyle, dateOfBirth, placeOfBirth, country |
| `GET /fantasy/scorecard?id=...` | **Paid** | Player fantasy points breakdown (batting / bowling / fielding) |
| `GET /fantasy/squad?id=...` | **Paid** | Full squad for a match with player IDs |
| `GET /fantasy/bbb?id=...` | **Paid** | Ball-by-ball data |
| `GET /fantasy/points?id=...` | **Paid** | Total player fantasy points per match |

> `score[]` schema per inning: `{ r: 207, w: 10, o: 46.3, inning: "Team Name Inning 1" }`
> `fantasyEnabled: boolean` — paid scorecard/BBB available when true

---

## The Page Experience (Top to Bottom)

### ABOVE THE FOLD — Current Match Intelligence

The moment someone lands on KrixAI, they see a live match. This is the most valuable real-time signal we have.

---

### SECTION 1 — Live Match Card (Hero Right Panel)

**API:** `GET /currentMatches` → pick the most recently started active match.

**What we show:**
- Team names + scores: "IND 142/4 (16.2 ov)" vs "AUS Yet to bat"
- Match status string (e.g. "India won the toss and elected to bat")
- Venue + date
- Live CRR and Required Run Rate
- **Win Probability Bar** — computed client-side from the score data:
  - If 1st inning: model from current run rate vs average T20 par
  - If 2nd inning: `target - current runs` vs `overs remaining`
  - Simple linear formula using `r`, `w`, `o` fields → expressed as a % for each team

**What makes it KrixAI:**
- The win probability meter with India Blue → Saffron gradient fill
- A small animated "live" dot pulse when status doesn't contain "won by"
- "Last 6 balls" — seeded from match ID (until we get paid BBB access)

---

### SECTION 2 — KrixAI Live Insight (AI Panel below Match Card)

**API:** Match Info fields (tossWinner, tossChoice, score data, venue)

**What we generate:**
Using the structured match data, we feed a prompt to an AI model (or use deterministic template logic for the free tier) to generate a 2-3 sentence insight:

> *"India's powerplay score of 52/1 is 12% above the venue average at Wankhede. Kohli at the crease historically converts 70%+ of these starts into 50+ scores. KrixAI gives India a 68% win probability at this stage."*

**Fields consumed:** `score.r`, `score.w`, `score.o`, `venue`, `tossChoice`, match `name`, `dateTimeGMT`

---

### SECTION 3 — Best Potential Performers (Player Cards)

**APIs:**
1. `GET /fantasy/squad?id=<match_id>` (Paid) → get playing XI for each team
2. `GET /players_info?id=<player_id>` (Free) → role, battingStyle, bowlingStyle per player
3. If paid not available: use `GET /series_info?id=<series_id>` → squad list as a fallback

**KrixAI Rating logic (AI-computed):**
Each player gets a composite score from:
- **Role weight vs match conditions** — pace-friendly venue → pace bowlers rated higher
- **Historical role importance** — T20 openers vs lower-order based on match format
- **Toss/conditions bonus** — bat-first toss → top-order batters get form boost
- **Form Index** — rolling average over last N matches (requires match history from `/matches` filtered by player)

**Card design (already built in v3):**
- Circular avatar + team color gradient bar
- KrixAI Rating (large blue number)
- Form Index (green/orange)
- Strength bars per role (Batter: Powerplay / Death / vs Pace; Pacer: Economy / Wicket Rate / Death)
- AI note: "Strong pick — pace conditions suit his aggressive powerplay style"
- Top 3 players highlighted above the cards grid: "KrixAI's Top Pick Today"

---

## SCROLL DOWN — Previous Match + Prediction Accuracy

This is what builds trust. Show users how well KrixAI called it.

---

### SECTION 4 — How We Called the Last Match

**API:** `GET /matches?offset=0` → find most recently `status: "Team X won by N runs/wickets"` match.

**What we show:**
- Match result banner: "CSK beat RCB by 22 runs · Yesterday"
- Score cards for both innings: "CSK 187/5 · RCB 165/8"
- **KrixAI Predicted:** winner + margin range (stored/seeded from before match)
- **Accuracy Score:** Large circular gauge — e.g. "91% Accurate"
  - Winner correct? +50 pts
  - Margin within 20 runs/2 wickets? +25 pts
  - Top performer prediction matched? +25 pts

**Visual treatment:**
- Green success badge if we called it right, orange if partial
- Side-by-side: "KrixAI Predicted" column vs "Actual Result" column
- Confidence score we gave pre-match vs final outcome

---

### SECTION 5 — Predicted Top Performers vs Actuals

**API:** `GET /fantasy/points?id=<prev_match_id>` (Paid) → get actual fantasy points per player

**Free tier fallback:** Use match winner + score data to infer standout performers (top scorer from winning team's r/o ratio).

**What we show:**
- 3 player cards side by side
- Left half: "KrixAI Predicted" card with our pre-match rating
- Right half: "Actual Performance" with real fantasy points
- Delta badge: "↑ Outperformed our prediction by 18pts"

This section makes KrixAI feel like a serious analytics tool, not just a dashboard.

---

## ADDITIONAL FEATURES (Future Phases)

### Tournament Intelligence (Series View)

**API:** `GET /series_info?id=<ipl_series_id>`

- Full IPL 2026 schedule with match-by-match predictions
- "Upcoming 5 matches" list with KrixAI confidence %
- Team form tracker: last 5 results as dots (W/L/W/W/L)
- Points table derived from matchList results

### Player Encyclopedia

**API:** `GET /players?search=...` + `GET /players_info?id=...`

- Search any player → instant player card with KrixAI profile
- Role, batting/bowling style, country flag
- "Featured in X upcoming matches" cross-reference with currentMatches

### Venue Intelligence

**API:** `GET /match_info?id=...` across matches at same `venue`

- Historical average 1st inning score at venue
- Pace vs spin win record
- Toss impact at this ground (% of toss-winning teams batting vs bowling)
- Powers the AI insight generation in Section 2

---

## Free vs Paid Feature Matrix

| Feature | Free Plan | Paid Plan |
|---------|-----------|-----------|
| Live match list (teams, score, venue) | ✅ | ✅ |
| Match winner + toss data | ✅ | ✅ |
| Player profile (role, style, country) | ✅ | ✅ |
| Series schedule | ✅ | ✅ |
| Win probability (computed) | ✅ | ✅ |
| AI insights (template-based) | ✅ | ✅ |
| Full playing XI per match | ❌ | ✅ (Fantasy Squad) |
| Ball-by-ball data | ❌ | ✅ |
| Real fantasy points per player | ❌ | ✅ |
| Actual player performance scorecard | ❌ | ✅ |

---

## Implementation Priority

**Phase 1 — Free tier, maximum visual impact:**
1. `/currentMatches` → live match card + win probability + AI insight (Sections 1–2)
2. `/matches` → last completed match for prediction accuracy display (Section 4)
3. `/players_info` → player cards with role-based KrixAI Ratings (Section 3)
4. `/series_info` → schedule + tournament context (Section 5)

**Phase 2 — Upgrade to Paid for depth:**
5. `/fantasy/squad` → real playing XI for accurate performer predictions
6. `/fantasy/points` → actual vs predicted performer accuracy (Section 5)
7. `/fantasy/bbb` → real last-6-balls in the live match card

**Phase 3 — Full intelligence layer:**
8. Venue history model from aggregated match data
9. Player form tracker across recent `/matches` history
10. Pre-match prediction storage so "vs Actual" comparison is real (not seeded)

---

## What the User Sees (Experience Summary)

```
[STICKY NAV]  KrixAI  |  IPL 2026 · T20 WC  |  Ask AI  Get Started →

[HERO — SPLIT]
LEFT:                              RIGHT:
"Cricket Intelligence             [LIVE MATCH CARD]
 Decoded by AI"                   IND 142/4 (16.2)  vs  AUS
                                  ██████████░░ 68% IND
→ Watch Live Predictions          [Last 6 balls: ·4·6·W·1·2]
→ Explore Player Stats            CRR 8.7 · RRR 11.2
                                  [KrixAI Insight: "Kohli at the
                                  crease — 70% conversion rate..."]

[SECTION 3 — SCROLL]
KrixAI's Top Picks Today
[Rohit Card]  [Bumrah Card]  [Jadeja Card]  [+7 more]

[SECTION 4 — SCROLL]
How We Called Yesterday's Match
KrixAI Said: CSK Win (82% confident)  →  ✅ CSK Won by 22 runs

[SECTION 5 — SCROLL]
Predicted vs Actual Performers
```

---

*Total API calls per page load (free tier): ~5–8 hits. Free plan gives 500 hits/day.*
*At 60 pageloads/day that's ~360–480 hits — comfortably within free limits.*
