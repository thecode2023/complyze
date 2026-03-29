import type { Metadata } from "next";
import { JetBrains_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { AuthProvider } from "@/components/providers/AuthProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Complyze — AI Regulatory Intelligence",
  description:
    "Track global AI regulations and audit agent configurations against live regulatory data. Zero hallucinated citations.",
  openGraph: {
    title: "Complyze — AI Regulatory Intelligence",
    description:
      "Track 42+ AI regulations across 24 jurisdictions. Audit your agent configs with grounded findings.",
    url: "https://complyze.dev",
    siteName: "Complyze",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complyze — AI Regulatory Intelligence",
    description:
      "Track 42+ AI regulations across 24 jurisdictions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
