"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import Header from "@/components/sections/Header";
import PreviousMatchSection from "@/components/sections/PreviousMatchSection";
import TabBar from "@/components/sections/TabBar";
import FeedSection from "@/components/sections/FeedSection";
import {
  MatchesSection,
  InsightsSection,
  PlayersSection,
  ChatSection,
  Footer,
} from "@/components/sections/ContentSections";

export default function HomePage() {
  const { tokens: tk } = useTheme();
  const [tab, setTab] = useState("feed");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tk.page.bg,
        fontFamily: tk.fontFamily,
        color: tk.page.text,
      }}
    >
      {/* Hero: sticky nav + split live match view */}
      <Header onTabChange={setTab} />

      {/* Previous match + prediction accuracy — always visible on scroll */}
      <PreviousMatchSection />

      {/* Tab navigation */}
      <TabBar activeTab={tab} onTabChange={setTab} />

      {/* Tab content */}
      <div
        style={{
          maxWidth: tk.layout.maxWidth,
          margin: "0 auto",
          padding: `${tk.spacing.xl}px ${tk.spacing.xl}px ${tk.spacing.section}px`,
        }}
      >
        {tab === "feed"     && <FeedSection onTabChange={setTab} />}
        {tab === "matches"  && <MatchesSection />}
        {tab === "insights" && <InsightsSection />}
        {tab === "players"  && <PlayersSection />}
        {tab === "chat"     && <ChatSection />}
      </div>

      <Footer />
    </div>
  );
}
