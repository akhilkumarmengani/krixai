"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import Header from "@/components/sections/Header";
import TabBar from "@/components/sections/TabBar";
import FeedSection from "@/components/sections/FeedSection";
import { MatchesSection, InsightsSection, PlayersSection, ChatSection, Footer } from "@/components/sections/ContentSections";

export default function HomePage() {
  const { tokens: tk } = useTheme();
  const [tab, setTab] = useState("feed");

  return (
    <div style={{ minHeight: "100vh", background: tk.page.bg, fontFamily: tk.fontFamily, color: tk.page.text }}>
      <Header onTabChange={setTab} />
      <TabBar activeTab={tab} onTabChange={setTab} />

      <div
        style={{
          maxWidth: tk.layout.maxWidth,
          margin: "0 auto",
          padding: `${tk.spacing.xl}px ${tk.spacing.xl}px ${tk.spacing.section}px`,
        }}
      >
        {tab === "feed" && <FeedSection onTabChange={setTab} />}
        {tab === "matches" && <MatchesSection />}
        {tab === "insights" && <InsightsSection />}
        {tab === "players" && <PlayersSection />}
        {tab === "chat" && <ChatSection />}
      </div>

      <Footer />
    </div>
  );
}
