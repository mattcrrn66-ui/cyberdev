"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateInitializer() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const refFromUrl = searchParams.get("ref");
    if (!refFromUrl) {
      console.log("[AffiliateInitializer] No ref param in URL");
      return;
    }

    console.log("[AffiliateInitializer] ref param found:", refFromUrl);

    // Store in localStorage + cookie
    try {
      const existing = window.localStorage.getItem("affiliate_code");
      if (existing !== refFromUrl) {
        window.localStorage.setItem("affiliate_code", refFromUrl);
        document.cookie = `affiliate_code=${refFromUrl};path=/;max-age=${
          60 * 60 * 24 * 30
        }`;
        console.log("[AffiliateInitializer] Stored affiliate_code in storage");
      } else {
        console.log("[AffiliateInitializer] Same affiliate_code already stored");
      }
    } catch (e) {
      console.error("[AffiliateInitializer] storage error", e);
    }

    // 🔍 DEBUG: call the API and log **exact** response
    (async () => {
      try {
        const res = await fetch("/api/affiliate/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affiliate_code: refFromUrl,
            source: "site_visit",
          }),
        });

        let data: any = {};
        try {
          data = await res.json();
        } catch {
          // ignore JSON parse errors
        }

        console.log(
          "[AffiliateInitializer] /api/affiliate/click status:",
          res.status,
          "response:",
          data
        );
      } catch (err) {
        console.error("[AffiliateInitializer] fetch failed:", err);
      }
    })();
  }, [searchParams]);

  return null;
}
