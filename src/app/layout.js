import "@/styles/globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata = {
  title: "CricMind AI — Cricket Intelligence Powered by AI",
  description:
    "AI-powered cricket analytics, live match predictions, player analysis, and tactical breakdowns. Every ball, decoded.",
  keywords: [
    "cricket",
    "IPL 2026",
    "AI cricket",
    "cricket predictions",
    "cricket analytics",
    "live scores",
    "fantasy cricket",
    "CricMind",
  ],
  openGraph: {
    title: "CricMind AI — Cricket Intelligence Powered by AI",
    description:
      "Real-time AI match intelligence, player analytics, and tactical breakdowns.",
    type: "website",
    siteName: "CricMind",
  },
  twitter: {
    card: "summary_large_image",
    title: "CricMind AI — Cricket Intelligence Powered by AI",
    description:
      "Real-time AI match intelligence, player analytics, and tactical breakdowns.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
