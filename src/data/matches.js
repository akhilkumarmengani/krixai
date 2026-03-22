/**
 * MATCHES DATA
 * ═════════════
 * Static demo data. Replace with CricketData.org API calls.
 *
 * TODO: Create src/lib/api.js with:
 *   - fetchLiveMatches()
 *   - fetchMatchDetails(matchId)
 *   - fetchMatchScorecard(matchId)
 */

export const matches = [
  { id: 1, t1: "RCB", t2: "SRH", date: "Mar 28", time: "7:30 PM", venue: "Chinnaswamy, Bengaluru", badge: "OPENER", prob: [52, 48], momentum: [40, 45, 55, 60, 52, 48, 55, 52] },
  { id: 2, t1: "KKR", t2: "MI",  date: "Mar 29", time: "7:30 PM", venue: "Eden Gardens, Kolkata", badge: "", prob: [45, 55], momentum: [50, 48, 42, 38, 45, 50, 48, 45] },
  { id: 3, t1: "CSK", t2: "RR",  date: "Mar 30", time: "3:30 PM", venue: "Chepauk, Chennai", badge: "", prob: [58, 42], momentum: [52, 55, 60, 62, 58, 55, 60, 58] },
  { id: 4, t1: "DC",  t2: "LSG", date: "Mar 30", time: "7:30 PM", venue: "Arun Jaitley, Delhi", badge: "DOUBLE HEADER", prob: [47, 53], momentum: [50, 48, 45, 42, 47, 50, 48, 47] },
  { id: 5, t1: "GT",  t2: "PBKS",date: "Mar 31", time: "7:30 PM", venue: "Motera, Ahmedabad", badge: "", prob: [60, 40], momentum: [55, 58, 62, 65, 60, 58, 62, 60] },
  { id: 6, t1: "MI",  t2: "RCB", date: "Apr 1",  time: "7:30 PM", venue: "Wankhede, Mumbai", badge: "BLOCKBUSTER", prob: [51, 49], momentum: [48, 50, 52, 54, 51, 50, 52, 51] },
];
