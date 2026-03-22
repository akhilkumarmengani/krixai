"use client";

import { createContext, useContext, useState } from "react";
import { tokens } from "@/lib/tokens";
import { tournaments, defaultTournamentId } from "@/data/tournaments";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [tournamentId, setTournamentId] = useState(defaultTournamentId);

  const value = {
    tokens,
    tournament: tournaments[tournamentId],
    tournamentId,
    setTournament: setTournamentId,
    allTournaments: tournaments,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
