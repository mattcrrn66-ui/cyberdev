// app/page.tsx
import React from "react";

type DSResult = {
  pairAddress: string;
  baseToken: { name: string; symbol: string; logoURI?: string };
  priceUsd?: string;
  volume: { h24?: number };
  liquidity?: { usd?: number };
};

async function getSolanaTokens() {
  const urls = [
    "https://api.dexscreener.io/latest/dex/tokens?chain=solana",
    "https://api.dexscreener.io/latest/dex/pairs/solana",
    "https://api.dexscreener.io/latest/dex/pairs/solana?type=new",
  ];

  const responses = await Promise.all(
    urls.map((u) => fetch(u, { cache: "no-store" }).then((r) => r.json()))
  );

  // Flatten all results
  const all: DSResult[] = [
    ...(responses[0]?.pairs || []),
    ...(responses[1]?.pairs || []),
    ...(responses[2]?.pairs || []),
  ];

  // Dedupe by pairAddress
  const map = new Map<string, DSResult>();
  for (const t of all) {
    if (t?.pairAddress) {
      map.set(t.pairAddress, t);
    }
  }

  // Convert to list
  let tokens = Array.from(map.values());

  // Sort by liquidity USD (DESC)
  tokens = tokens.sort((a, b) => {
    const la = a?.liquidity?.usd || 0;
    const lb = b?.liquidity?.usd || 0;
    return lb - la;
  });

  // Return top 100
  return tokens.slice(0, 100);
}

export default async function HomePage() {
  const tokens = await getSolanaTokens();

  const featured = tokens.slice(0, 10);
  const rest = tokens.slice(10);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6 text-cyan-400">
          Solana Live Tokens (Top 100)
        </h1>

        {/* FEATURED TOP 10 */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-slate-300">
            🔥 Top 10 Featured
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((t) => (
              <div
                key={t.pairAddress}
                className="p-4 bg-slate-900 rounded-xl shadow-md border border-slate-800 hover:border-cyan-500 transition"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={t.baseToken.logoURI || "/placeholder.png"}
                    alt={t.baseToken.symbol}
                    className="w-14 h-14 rounded-full border border-slate-700"
                  />
                  <div>
                    <div className="text-lg font-semibold">
                      {t.baseToken.name}
                    </div>
                    <div className="text-cyan-400 text-sm">
                      {t.baseToken.symbol}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="text-slate-400">Price:</span>{" "}
                    ${t.priceUsd ? Number(t.priceUsd).toFixed(6) : "—"}
                  </p>
                  <p>
                    <span className="text-slate-400">Liquidity:</span>{" "}
                    ${t.liquidity?.usd?.toLocaleString() || "—"}
                  </p>
                  <p>
                    <span className="text-slate-400">24h Volume:</span>{" "}
                    ${t.volume?.h24?.toLocaleString() || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* REST LIST */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-3 text-slate-300">
            📊 Tokens #11–100
          </h2>

          <div className="space-y-3">
            {rest.map((t, i) => (
              <div
                key={t.pairAddress}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={t.baseToken.logoURI || "/placeholder.png"}
                    alt={t.baseToken.symbol}
                    className="w-10 h-10 rounded-full border border-slate-700"
                  />

                  <div>
                    <p className="font-medium">{t.baseToken.name}</p>
                    <p className="text-cyan-400 text-sm">
                      {t.baseToken.symbol}
                    </p>
                  </div>
                </div>

                <div className="text-right text-sm">
                  <p>
                    ${t.priceUsd ? Number(t.priceUsd).toFixed(6) : "—"}
                  </p>
                  <p className="text-slate-400">
                    LQ: ${t.liquidity?.usd?.toLocaleString() || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
