"use client";

import { useEffect, useState } from "react";

const REF_CODE = "N9S5839G";

// This is the REAL launch page of Meme University / OGmemecoin
const LAUNCH_URL = "https://ogmemecoin.replit.app/create";

// This is for Phantom’s in-app browser (mobile only)
const REFERRER_URL = "https://cyberdevtoken.com";
const PHANTOM_DEEPLINK = `https://phantom.app/ul/browse/${encodeURIComponent(
  LAUNCH_URL
)}?ref=${encodeURIComponent(REFERRER_URL)}`;

export default function MemeLaunchpadPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">

        {/* Header */}
        <header className="border-b border-slate-800 pb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            Cyber Dev Token • $CDT
          </p>
          <h1 className="mt-3 text-3xl font-bold">Meme University Launchpad</h1>
          <p className="mt-3 text-lg text-slate-300">
            Follow the steps below to launch your token with your referral code
            <span className="font-mono font-bold text-cyan-300"> {REF_CODE}</span>.
          </p>
        </header>

        {/* MOBILE EXPERIENCE */}
        {isMobile && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-cyan-300">
              Mobile Launch (Recommended)
            </h2>

            <p className="text-sm text-slate-300">
              On mobile, Meme University works best when opened directly inside the Phantom app.
              Tap below:
            </p>

            <a
              href={PHANTOM_DEEPLINK}
              className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-cyan-400/60 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-base font-medium"
            >
              Open Meme University in Phantom
            </a>

            <p className="text-xs text-slate-500">
              Once Meme University opens inside Phantom, enter your referral code:
              <span className="font-mono font-bold text-cyan-300"> {REF_CODE}</span>
            </p>
          </div>
        )}

        {/* DESKTOP EXPERIENCE */}
        {!isMobile && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-cyan-300">
              Desktop Launch
            </h2>

            <p className="text-sm text-slate-300">
              For the best wallet connection experience, open Meme University in a
              full browser tab:
            </p>

            <a
              href={LAUNCH_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-cyan-400/60 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-base font-medium"
            >
              Open Meme University Launchpad
            </a>

            <p className="text-xs text-slate-500">
              When the launch page loads, enter your referral code:
              <span className="font-mono font-bold text-cyan-300"> {REF_CODE}</span>
            </p>
          </div>
        )}

        {/* OPTIONAL PREVIEW IFRAME */}
        <div className="min-h-[70vh] mt-4 border border-slate-800 rounded-xl overflow-hidden bg-black">
          <iframe
            src={LAUNCH_URL}
            title="Meme University Preview"
            className="w-full h-full min-h-[70vh]"
            sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
          />
        </div>
      </div>
    </main>
  );
}
