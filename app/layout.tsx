import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "Kenneth Stock Tracker",
  description: "Personal stock portfolio management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>

          <footer className="bg-[#F7ECE7] border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
            <div className="font-medium">
              Stock Tracker v3.0
            </div>
            <div>
              Designed & Developed by Kenneth Ho
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}