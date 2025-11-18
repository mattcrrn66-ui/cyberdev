// app/api/live-tokens/route.ts
import { NextResponse } from "next/server";

type LiveToken = {
  id: string;
  name: string;
  symbol: string;
  priceUsd: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  url: string | null;
  imageUrl: string | null;
  website: string | null;
  socials: { platform: string; handle: string }[];
};

async function fetchFeed(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { pairs: [] };
    const data = await res.json();
    return data;
  } catch {
    return { pairs: [] };
  }
}

export async function GET() {
  try {
    // Fetch 3 different Solana feeds
    const urls = [
      "https://api.dexscreener.io/latest/dex/tokens?chain=solana",
      "https://api.dexscreener.io/latest/dex/pairs/solana",
      "https://api.dexscreener.io/latest/dex/pairs/solana?type=new",
    ];

    const responses = await Promise.all(urls.map((u) => fetchFeed(u)));

    // Flatten + extract pairs
    const allPairs = [
      ...(responses[0]?.pairs || []),
      ...(responses[1]?.pairs || []),
      ...(responses[2]?.pairs || []),
    ];

    // Deduplicate by pairAddress
    const map = new Map<string, any>();
    for (const p of allPairs) {
      if (p?.pairAddress) map.set(p.pairAddress, p);
    }

    const unique = Array.from(map.values());

    // Convert to LiveToken format
    const mapped: LiveToken[] = unique.map((p: any) => ({
      id: p.pairAddress,
      name: p.baseToken?.name ?? "Unknown",
      symbol: p.baseToken?.symbol ?? "",
      priceUsd: p.priceUsd ? Number(p.priceUsd) : null,
      volume24h: p.volume?.h24 ?? null,
      liquidityUsd: p.liquidity?.usd ?? null,
      url: p.url ?? null,
      imageUrl: p.baseToken?.logoURI ?? p.info?.imageUrl ?? null,
      website: p.info?.websites?.[0]?.url ?? null,
      socials: p.info?.socials ?? [],
    }));

    // Sort by liquidity desc
    mapped.sort(
      (a, b) => (b.liquidityUsd ?? 0) - (a.liquidityUsd ?? 0)
    );

    // Top 100
    const top100 = mapped.slice(0, 100);

    return NextResponse.json(top100, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("live-tokens API ERROR:", err);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
