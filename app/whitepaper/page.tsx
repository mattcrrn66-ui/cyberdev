export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">

        {/* Header */}
        <header className="mb-10 border-b border-slate-800 pb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
            Cyber Dev Token • $CDT
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-50">
            Cyber Dev Token — Whitepaper v1.0
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            Tools for creators, devs & communities on Solana.
          </p>
        </header>

        <article className="space-y-10 text-slate-200 leading-relaxed">

          {/* 1. Overview */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-300 mb-4">1. Overview</h2>
            <p className="mb-4">
              Cyber Dev Token ($CDT) is a development-focused ecosystem built on Solana.
              The mission is simple: give creators, developers, and communities the tools
              they need to build, launch, and scale real projects — fast.
            </p>
            <p>
              The core of CDT is the Roundtable: a builder-first standard based on
              transparency, collaboration, and real utility.
            </p>
          </section>

          {/* 2. What We're Building */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-300 mb-4">
              2. What We’re Building
            </h2>

            <h3 className="text-xl font-semibold text-cyan-200 mb-2">
              2.1 Token Profiles Creator (Live)
            </h3>
            <p className="mb-4">
              Users can create token profiles instantly — name, symbol, image upload,
              website links, socials, and metadata. This is the foundation of the ecosystem.
            </p>

            <h3 className="text-xl font-semibold text-cyan-200 mb-2">
              2.2 Developer Hub (In Progress)
            </h3>
            <p className="mb-4">
              A dashboard for builders to link projects, display experience, publish tools,
              and collaborate with others.
            </p>

            <h3 className="text-xl font-semibold text-cyan-200 mb-2">
              2.3 Community Tools (Planned)
            </h3>
            <p>
              Dashboard for project updates, announcements, engagement tools, and
              community analytics.
            </p>
          </section>

          {/* 3. CDT Utility */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-300 mb-4">
              3. CDT Utility
            </h2>
            <p className="mb-3">
              $CDT will serve as the access + governance token for the Cyber Dev ecosystem.
              Utility will expand as modules roll out.
            </p>

            <ul className="list-disc list-inside space-y-2">
              <li>creator verification</li>
              <li>developer reputation / badges</li>
              <li>access to advanced tools</li>
              <li>community boosting & visibility</li>
              <li>governance via the Roundtable</li>
            </ul>
          </section>

          {/* 4. Roadmap */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-300 mb-4">
              4. Roadmap
            </h2>

            <h3 className="text-xl font-semibold text-cyan-200">Phase 1 — Foundation</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Launch Cyber Dev brand & website</li>
              <li>Token Profiles Creator MVP</li>
              <li>Whitepaper v1.0</li>
              <li>Supabase database setup</li>
              <li>Image upload working</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-200">Phase 2 — Core Platform</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Developer Hub dashboard</li>
              <li>Profile linking system</li>
              <li>Public token directory</li>
              <li>Community dashboard</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-200">Phase 3 — CDT Utility Layer</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Token deployment</li>
              <li>Tool-access utility</li>
              <li>Creator verification staking</li>
              <li>Reputation scoring</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-200">Phase 4 — Expansion</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Open-source modules</li>
              <li>Analytics dashboard</li>
              <li>Integrated Solana tooling</li>
              <li>Partnerships with builders</li>
            </ul>
          </section>

          {/* 5. Philosophy */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-300 mb-4">
              5. Philosophy — The Roundtable
            </h2>
            <p className="mb-4">
              The Roundtable Standard is simple:
            </p>
            <p className="font-semibold text-cyan-200 mb-4">
              No hype. No noise. Just building.
            </p>
            <p>
              Every creator. Every builder. Every community. Equal at the table —
              shaping the future together.
            </p>
          </section>

          {/* 6. Conclusion */}
          <section>
            <h2 className="text-2xl font-semibold text-cyan-300 mb-4">6. Conclusion</h2>
            <p className="mb-3">
              Cyber Dev Token is a new but rapidly growing builder ecosystem on Solana.
              The foundation is live, the vision is clear, and the tools are shipping fast.
            </p>
            <p className="font-semibold">
              Join the Roundtable. Build with us.  
            </p>
          </section>

        </article>
      </div>
    </main>
  );
}
