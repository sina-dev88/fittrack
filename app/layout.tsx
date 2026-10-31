import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";

import "./globals.css";

import ThemeProvider from "@/components/theme/ThemeProvider";
import LanguageProvider from "@/components/language/LanguageProvider";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FitTrack",
    template: "%s | FitTrack",
  },
  description:
    "Smart workout tracking, progress analytics and AI-powered fitness coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={vazirmatn.variable}>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}