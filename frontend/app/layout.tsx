import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { InterviewDraftProvider } from "@/components/providers";
import "./globals.css";
import "../styles/theme.scss";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Interview Coach",
  description: "Practice technical interviews and review your answers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable} data-scroll-behavior="smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,500,0..1,0&display=swap"
        />
      </head>
      <body className="min-h-screen bg-surface font-sans text-on-surface antialiased">
        <InterviewDraftProvider>{children}</InterviewDraftProvider>
      </body>
    </html>
  );
}
