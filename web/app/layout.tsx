import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HCP Brief Workflow · Relevate Health Demo",
  description:
    "A 6-stage agentic pipeline that converts an HCP engagement brief into a compliance-reviewed delivery package.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.variable} ${inter.variable}`}>
      <body
        style={{
          fontFamily: "var(--font-inter), Helvetica, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
