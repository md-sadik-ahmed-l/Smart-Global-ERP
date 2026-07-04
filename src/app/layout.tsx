import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Global ERP — Enterprise Resource Planning | Smart WebStudio",
  description:
    "Smart Global ERP System — A complete 50-module enterprise resource planning platform by Smart WebStudio. Owner: Mohammad Sayem, Chittagong South Kulshi.",
  keywords: [
    "Smart Global ERP",
    "ERP System",
    "Smart WebStudio",
    "Enterprise Resource Planning",
    "Mohammad Sayem",
    "Chittagong",
  ],
  authors: [{ name: "Mohammad Sayem", url: "https://smartwebstudio.com" }],
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%236366f1'/%3E%3Ctext x='50' y='68' font-size='52' font-weight='bold' fill='white' text-anchor='middle' font-family='Arial'%3ES%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <SonnerToaster position="top-right" theme="dark" />
      </body>
    </html>
  );
}
