// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import AffiliateInitializer from "@/components/AffiliateInitializer";

export const metadata: Metadata = {
  title: "Cyber Dev Token • $CDT",
  description: "Building tools for creators, devs & communities on Solana.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        {/* 🔥 Automatically ensures every logged-in user gets an affiliate_code */}
        <AffiliateInitializer />

        <div className="min-h-screen flex flex-col">
          {/* Header / Nav */}
          <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              {/* Brand */}
              <a href="/" className="flex items-baseline gap-2">
                <span className="text-xs uppercase tracking-[0.25em] text-cyan-400">
                  Cyber Dev
                </span>
                <span className="text-xs font-medium text-slate-400">
                  Token • $CDT
                </span>
              </a>

              {/* Nav */}
              <nav className="flex items-center gap-4 text-sm text-slate-300">
                <a href="/" className="hover:text-cyan-300">
                  Home
                </a>
                <a href="/directory" className="hover:text-cyan-300">
                  Directory
                </a>
                <a href="/dev-hub" className="hover:text-cyan-300">
                  Dev Hub
                </a>
                <a href="/community" className="hover:text-cyan-300">
                  Community
                </a>
                <a href="/whitepaper" className="hover:text-cyan-300">
                  Whitepaper
                </a>
                <a href="/roadmap" className="hover:text-cyan-300">
                  Roadmap
                </a>
                <a href="/meme-launchpad" className="hover:text-cyan-300">
                  Launch Token
                </a>
                <a href="/dashboard/affiliate" className="hover:text-cyan-300">
                  Affiliate
                </a>
                {/* 🧠 New: Image Lab / Comfy entry */}
                <a href="/comfy" className="hover:text-cyan-300">
                  Image Lab
                </a>
              </nav>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="border-t border-slate-800 bg-slate-950/90">
            <div className="max-w-5xl mx-auto px-4 py-3 text-xs text-slate-500 flex flex-wrap gap-2 justify-between">
              <span>© 2024 Cyber Dev Token</span>
              <span>Roundtable for builders on Solana.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
