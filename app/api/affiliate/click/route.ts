// components/AffiliateInitializer.tsx
"use client";

import { useEffect } from "react";
import { useEnsureAffiliateRow } from "@/lib/useEnsureAffiliate";

export default function AffiliateInitializer() {
  useEnsureAffiliateRow();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");

    if (!ref) return;

    // Avoid logging the same ref multiple times in this browser session
    const alreadyLogged = sessionStorage.getItem("loggedRefCode");
    if (alreadyLogged === ref) return;

    sessionStorage.setItem("loggedRefCode", ref);

    try {
      // Store for future conversion events
      localStorage.setItem("affiliate_ref_code", ref);
      document.cookie = `affiliate_ref_code=${ref}; path=/; max-age=${
        60 * 60 * 24 * 30
      }`;
    } catch (e) {
      console.warn("Could not persist affiliate ref code:", e);
    }

    // Fire-and-forget logging of the click
    fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliate_code: ref,
        source: "site_visit",
      }),
    }).catch((err) => console.error("Error logging affiliate click:", err));
  }, []);

  return null;
}
