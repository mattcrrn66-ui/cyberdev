// app/tokens/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import TokenPortal from "@/components/TokenPortal";

type Token = {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  image_url: string | null;
  telegram_url: string | null;
  x_url: string | null;
  website_url: string | null;
  created_at: string;
};

const supabase = createClient();

export default function TokenPage() {
  // ✅ Get [id] from the URL correctly in a client component
  const params = useParams();
  const rawId = params?.id;

  // Handle both string and string[] just in case
  const tokenId =
    typeof rawId === "string" ? decodeURIComponent(rawId) : Array.isArray(rawId) ? decodeURIComponent(rawId[0]) : "";

  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (!tokenId) {
        setError("Missing token id in URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("id", tokenId)
        .single();

      if (error || !data) {
        console.error("Error fetching token", error);
        setError(error?.message || "Token not found.");
        setToken(null);
      } else {
        setToken(data as Token);
      }

      setLoading(false);
    };

    fetchToken();
  }, [tokenId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">Loading token portal…</p>
      </main>
    );
  }

  if (error || !token) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3 max-w-md px-4">
          <p className="text-lg font-semibold">Token not found.</p>
          <p className="text-xs text-slate-400">
            {error
              ? `Supabase says: ${error}`
              : "The portal couldn't find a token with this id."}
          </p>
          <Link
            href="/dev-hub"
            className="text-sm text-cyan-400 hover:text-cyan-300 underline"
          >
            ← Back to Cyber Dev Hub
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back link */}
        <div className="text-sm">
          <Link
            href="/"
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            ← Back to Cyber Dev Hub
          </Link>{" "}
          <span className="text-slate-500">/</span>{" "}
          <Link
            href="/directory"
            className="text-cyan-400 hover:text-cyan-300 underline"
          >
            Directory
          </Link>
        </div>

        {/* Token header */}
        <section className="border border-slate-800 rounded-xl p-4 sm:p-6 bg-slate-900/60 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-400 mb-1">
              Cyber Dev Token • Portal
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              {token.name}{" "}
              <span className="text-cyan-300 text-lg">({token.symbol})</span>
            </h1>
            {token.description && (
              <p className="text-slate-300 text-sm sm:text-base max-w-xl">
                {token.description}
              </p>
            )}
          </div>

          {token.image_url && (
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={token.image_url}
                alt={token.name || ""}
                className="w-20 h-20 rounded-2xl border border-slate-700 object-cover"
              />
            </div>
          )}
        </section>

        {/* Links */}
        <section className="border border-slate-800 rounded-xl p-4 sm:p-6 bg-slate-900/60">
          <h2 className="text-lg font-semibold mb-3">Links</h2>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            {token.website_url && (
              <a
                href={token.website_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                Website
              </a>
            )}
            {token.x_url && (
              <a
                href={token.x_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                X (Twitter)
              </a>
            )}
            {token.telegram_url && (
              <a
                href={token.telegram_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-full border border-slate-700 hover:border-cyan-400 hover:text-cyan-300 transition"
              >
                Telegram
              </a>
            )}
            {!token.website_url && !token.x_url && !token.telegram_url && (
              <p className="text-slate-500 text-sm">
                No links have been added for this token yet.
              </p>
            )}
          </div>
        </section>

        {/* Community Portal (message board) */}
        <TokenPortal
          tokenId={token.id}
          name={token.name}
          symbol={token.symbol}
        />
      </div>
    </main>
  );
}
