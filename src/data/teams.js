/**
 * TEAMS DATA
 * ══════════
 * All team info. In production, this comes from the cricket API.
 * For now, static data with correct franchise colors.
 */

export const teams = {
  RCB: { name: "Royal Challengers Bengaluru", short: "RCB", color: "#ec1c24", colorBg: "#fde8e8" },
  SRH: { name: "Sunrisers Hyderabad", short: "SRH", color: "#e8702a", colorBg: "#fdf0e5" },
  MI:  { name: "Mumbai Indians", short: "MI", color: "#004ba0", colorBg: "#e0ecf8" },
  CSK: { name: "Chennai Super Kings", short: "CSK", color: "#f9cd16", colorBg: "#fdf8dd" },
  KKR: { name: "Kolkata Knight Riders", short: "KKR", color: "#3a225d", colorBg: "#ede5f5" },
  RR:  { name: "Rajasthan Royals", short: "RR", color: "#254aa5", colorBg: "#e3eaf8" },
  DC:  { name: "Delhi Capitals", short: "DC", color: "#0078bc", colorBg: "#dff0fb" },
  PBKS:{ name: "Punjab Kings", short: "PBKS", color: "#dd1f2d", colorBg: "#fde6e8" },
  GT:  { name: "Gujarat Titans", short: "GT", color: "#1c1c2b", colorBg: "#e4e4e7" },
  LSG: { name: "Lucknow Super Giants", short: "LSG", color: "#a72056", colorBg: "#f5dfe8" },
};

export function getTeam(id) {
  return teams[id] || { name: id, short: id, color: "#666", colorBg: "#eee" };
}
