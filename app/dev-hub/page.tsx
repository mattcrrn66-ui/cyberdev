// app/dev-hub/page.tsx

type DevFeature = {
  title: string;
  status: "live" | "planned" | "soon";
  description: string;
};

const features: DevFeature[] = [
  {
    title: "Developer Profiles",
    status: "soon",
    description:
      "Create a public profile as a builder: show your projects, skills, links, and contributions to the Cyber Dev ecosystem.",
  },
  {
    title: "Verified Builder Badge",
    status: "planned",
    description:
      "Optional verification layer for devs who ship real work. Helps projects find legitimate builders and filter noise.",
  },
  {
    title: "Project Linking",
    status: "soon",
    description:
      "Connect your profile directly to the tokens and apps you have worked on. Make it easy for communities to see who built what.",
  },
  {
    title: "Dev Reputation Signals",
    status: "planned",
    description:
      "Lightweight reputation metrics powered by usage, contributions, and optional CDT-based unlocks. No fake clout, only real work.",
  },
  {
    title: "Roundtable Collabs",
    status: "planned",
    description:
      "Spaces for builders to connect around specific ideas, tools, or tokens. Find people to ship with, not just talk with.",
  },
];

function statusLabel(status: DevFeature["status"]) {
  if (status === "live") return "Live";
  if (status === "soon") return "Coming Soon";
  return "Planned";
}

export default function DevHubPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <header className="mb-10 border-b border-slate-800 pb-6">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-400">
            Cyber Dev Token • $CDT
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-slate-50">
            Developer Hub
          </h1>
          <p className="mt-3 text-lg text-slate-300">
            A focused space for builders behind the tokens. This hub will become the
            home base for Cyber Dev–aligned devs, contributors, and collaborators.
          </p>
        </header>

        {/* Intro */}
        <section className="mb-8 text-sm text-slate-200 space-y-3">
          <p>
            Right now, the Cyber Dev platform is in early build mode. The Developer
            Hub is the part of the ecosystem dedicated to the people shipping the
            tools, contracts, and experiences — not just trading the tickers.
          </p>
          <p>
            Over time, this page will evolve into a full-featured home for dev
            profiles, project linking, collaboration, and reputation signals tied to
            real work.
          </p>
        </section>

        {/* Feature Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-cyan-300 mb-2">
            Planned Dev Features
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, idx) => (
              <article
                key={idx}
                className="border border-slate-800 rounded-2xl p-4 bg-slate-900/40 hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="text-base font-semibold text-slate-50">
                    {feature.title}
                  </h3>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                      feature.status === "live"
                        ? "border-cyan-400 text-cyan-300"
                        : feature.status === "soon"
                        ? "border-amber-400 text-amber-300"
                        : "border-slate-600 text-slate-400"
                    }`}
                  >
                    {statusLabel(feature.status)}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom Note */}
        <section className="mt-10 border-t border-slate-800 pt-5 text-xs text-slate-500 space-y-2">
          <p>
            As the platform grows, this hub can be wired into Supabase for dev
            accounts, profile storage, and relationships between developers and the
            tokens they ship.
          </p>
          <p>
            For now, treat this as the placeholder for the builder side of the Cyber
            Dev ecosystem — the part that belongs to the people shipping real work.
          </p>
        </section>
      </div>
    </main>
  );
}
