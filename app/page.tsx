// app/page.tsx
"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        {/* Hero */}
        <header className="mb-10 border-b border-slate-800 pb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
            Cyber Dev Token • $CDT
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-50">
            Cyber Dev Token Hub
          </h1>
          <p className="mt-3 text-lg text-slate-300 max-w-2xl">
            A roundtable for builders on Solana. Create token profiles, connect
            your devs and holders, and grow your community from day zero.
          </p>
        </header>

        {/* Main cards */}
        <section className="grid gap-6 sm:grid-cols-2">
          <Link
            href="/dev-hub"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-400/70 hover:bg-slate-900 transition-colors"
          >
            <h2 className="text-xl font-semibold text-slate-50 group-hover:text-cyan-300">
              Dev Hub
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Create and manage token profiles, upload images, and define your
              project&apos;s story before launch.
            </p>
          </Link>

          <Link
            href="/directory"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-400/70 hover:bg-slate-900 transition-colors"
          >
            <h2 className="text-xl font-semibold text-slate-50 group-hover:text-cyan-300">
              Token Directory
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Browse listed projects, discover new builders, and follow what
              other communities are shipping.
            </p>
          </Link>

          <Link
            href="/community"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-400/70 hover:bg-slate-900 transition-colors"
          >
            <h2 className="text-xl font-semibold text-slate-50 group-hover:text-cyan-300">
              Community
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Entry point for your Telegram, X, and holder tools. A single place
              to route people from your socials.
            </p>
          </Link>

          <Link
            href="/whitepaper"
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-400/70 hover:bg-slate-900 transition-colors"
          >
            <h2 className="text-xl font-semibold text-slate-50 group-hover:text-cyan-300">
              Whitepaper &amp; Roadmap
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Read the vision for Cyber Dev Token, how the hub works, and where
              we&apos;re taking the Roundtable.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
