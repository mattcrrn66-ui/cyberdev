// app/dashboard/affiliate/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useEnsureAffiliateRow } from "@/lib/useEnsureAffiliate";

const supabase = createClient();

type UserAffiliate = {
  affiliate_code: string;
};

export default function AffiliateDashboardPage() {
  useEnsureAffiliateRow(); // backup: ensures row exists

  const [data, setData] = useState<UserAffiliate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAffiliate = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No user or error getting user:", userError?.message);
        setLoading(false);
        return;
      }

      const { data: row, error } = await supabase
        .from("user_affiliates")
        .select("affiliate_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error loading affiliate data:", error.message);
        setLoading(false);
        return;
      }

      if (row) {
        setData(row as UserAffiliate);
      }
      setLoading(false);
    };

    loadAffiliate();
  }, []);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://cyberdevtoken.com";

  const refLink =
    data?.affiliate_code
      ? `${origin}/?ref=${data.affiliate_code}`
      : "Generating your affiliate link...";

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-4">Affiliate Dashboard</h1>

      <div className="rounded-xl border border-slate-800 p-4 bg-slate-900/60">
        <p className="text-sm text-slate-400 mb-2">Your referral link</p>
        <div className="flex items-center gap-2">
          <code className="text-xs sm:text-sm break-all bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800">
            {loading ? "Loading..." : refLink}
          </code>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Share this link. Anyone who visits and uses CyberDev through it can
          earn you rewards once we plug in the payout system.
        </p>
      </div>
    </main>
  );
}
