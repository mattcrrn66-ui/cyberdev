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

    const alreadyLogged = sessionStorage.getItem("loggedRefCode");
    if (alreadyLogged === ref) return;

    sessionStorage.setItem("loggedRefCode", ref);

    try {
      localStorage.setItem("affiliate_ref_code", ref);
      document.cookie = `affiliate_ref_code=${ref}; path=/; max-age=${
        60 * 60 * 24 * 30
      }`;
    } catch (e) {
      console.warn("Could not persist affiliate ref code:", e);
    }

    // DEBUG: show what the API sends back
    fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        affiliate_code: ref,
        source: "site_visit",
      }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("Affiliate click failed:", res.status, json);
        } else {
          console.log("Affiliate click logged:", json);
        }
      })
      .catch((err) => console.error("Error logging affiliate click:", err));
  }, []);

  return null;
}
