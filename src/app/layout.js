import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "KrixAI — Cricket Intelligence Powered by AI",
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
    "KrixAI",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "KrixAI — Cricket Intelligence Powered by AI",
    description:
      "Real-time AI match intelligence, player analytics, and tactical breakdowns.",
    type: "website",
    siteName: "KrixAI",
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KrixAI — Cricket Intelligence Powered by AI",
    description:
      "Real-time AI match intelligence, player analytics, and tactical breakdowns.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body style={{ margin: 0 }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
