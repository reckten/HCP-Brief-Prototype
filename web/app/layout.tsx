import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-josefin",
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
    <html lang="en" className={josefin.variable}>
      <body style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
