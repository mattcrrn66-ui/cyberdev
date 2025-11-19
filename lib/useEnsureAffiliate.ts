// lib/useEnsureAffiliate.ts
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export function useEnsureAffiliateRow() {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // 1. Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user || cancelled) {
        if (userError) {
          console.error("Error getting user:", userError.message);
        }
        return;
      }

      // 2. Check if they already have a row in user_affiliates
      const { data: existing, error: selectError } = await supabase
        .from("user_affiliates")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      // PGRST116 = "no rows" – normal if it's their first time
      if (selectError && selectError.code !== "PGRST116") {
        console.error("Error checking affiliate row:", selectError.message);
        return;
      }

      // 3. If no row, insert one (trigger will auto-fill affiliate_code)
      if (!existing) {
        const { error: insertError } = await supabase
          .from("user_affiliates")
          .insert({ user_id: user.id });

        if (insertError) {
          console.error("Error inserting affiliate row:", insertError.message);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);
}
