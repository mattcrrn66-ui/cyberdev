"use client";

import { useEffect, useRef } from "react";

const MEME_UNI_URL = "https://meme.university/launch"; 
const REF_CODE = "N9S5839G";

export default function MemeLaunchpadEmbedPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const injectReferral = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        // Find likely referral input box
        const input =
          doc.querySelector("input[name='ref']") ||
          doc.querySelector("input[name='referral']") ||
          doc.querySelector("input[name='code']") ||
          doc.querySelector("input[placeholder*='ref']") ||
          doc.querySelector("input");

        if (input) {
          (input as HTMLInputElement).value = REF_CODE;
          (input as HTMLInputElement).dispatchEvent(
            new Event("input", { bubbles: true })
          );
        }
      } catch {
        // If cross-origin blocks access, the fallback is the URL itself.
      }
    };

    iframe.addEventListener("load", injectReferral);

    return () => iframe.removeEventListener("load", injectReferral);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        <header className="border-b border-slate-800 pb-4">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            Cyber Dev Token • $CDT
          </p>
          <h1 className="mt-3 text-3xl font-bold">Meme University Launchpad</h1>
          <p className="mt-2 text-slate-300">
            Your referral code <b>{REF_CODE}</b> will be automatically applied.
          </p>
        </header>

        <div className="text-xs sm:text-sm text-slate-400">
          If the launchpad doesn’t load, Meme University may block
          iframe embedding. In that case,{" "}
          <a
            href={`${MEME_UNI_URL}?ref=${REF_CODE}`}
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 underline"
          >
            click here to open it in a new tab (referral included)
          </a>
          .
        </div>

        <div className="min-h-[80vh] border border-slate-800 rounded-xl overflow-hidden bg-black">
          <iframe
            ref={iframeRef}
            src={`${MEME_UNI_URL}?ref=${REF_CODE}`}
            className="w-full h-full min-h-[80vh]"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        </div>
      </div>
    </main>
  );
}
