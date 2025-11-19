// components/AffiliateInitializer.tsx
"use client";

import { useEnsureAffiliateRow } from "@/lib/useEnsureAffiliate";

export default function AffiliateInitializer() {
  useEnsureAffiliateRow();
  return null; // no UI, just runs the hook once
}
