"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0 z-0 bg-starry-background"></div>

      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col gap-12 relative z-10">
        {/* Header Section */}
        <section className="flex flex-col gap-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-50 glow-text">
            Cyber Dev Token • $CDT
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto glow-text">
            The Roundtable for Builders on Solana.
            Create tokens, build communities, and launch your ideas into reality.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-6 space-x-4 flex justify-center items-center gap-8">
            {/* CyberDev Mascot Image on the Left */}
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <Image
                src="/1000028629.png" // Path to the uploaded character image in the public folder
                alt="CyberDev Character"
                layout="fill"
                objectFit="contain"
                className="drop-shadow-[0_0_20px_rgba(0,200,255,0.35)]"
              />
            </div>

            {/* Launch and AI Generate Buttons */}
            <div className="flex flex-col gap-4">
              <Link
                href="/meme-launchpad"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cyan-500 text-slate-900 font-semibold text-lg hover:bg-cyan-400 transition glow-button"
              >
                🚀 Launch a Token Now
              </Link>
              <Link
                href="/comfy"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cyan-500 text-slate-900 font-semibold text-lg hover:bg-cyan-400 transition glow-button"
              >
                🎨 Generate AI Images for Free
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid sm:grid-cols-2 gap-10 mt-10">
          <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/40">
            <h2 className="text-xl font-bold text-cyan-300">Token Directory</h2>
            <p className="mt-2 text-slate-400">
              Explore tokens created through the Cyber Dev Hub and track active projects.
            </p>
            <Link
              href="/directory"
              className="inline-block mt-4 text-cyan-400 hover:underline"
            >
              View Directory →
            </Link>
          </div>

          <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/40">
            <h2 className="text-xl font-bold text-cyan-300">Dev Hub</h2>
            <p className="mt-2 text-slate-400">
              Tools, uploads, utilities, and resources for builders launching on Solana.
            </p>
            <Link
              href="/dev-hub"
              className="inline-block mt-4 text-cyan-400 hover:underline"
            >
              Enter Dev Hub →
            </Link>
          </div>
        </section>

        {/* New AI Image Generation Section */}
        <section className="bg-slate-900/50 p-10 mt-16 rounded-xl">
          <h2 className="text-3xl font-semibold text-center text-cyan-300 glow-text">
            Generate AI-Driven Images in Seconds
          </h2>
          <p className="text-lg text-center text-slate-400 mt-4 max-w-2xl mx-auto glow-text">
            Unlock the power of AI-generated images — absolutely free. Whether you need visuals for your token,
            marketing, or any project, CyberDev provides the tools to create stunning, custom AI images instantly.
          </p>
          <div className="text-center mt-6">
            <Link
              href="/comfy"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cyan-500 text-slate-900 font-semibold text-lg hover:bg-cyan-400 transition glow-button"
            >
              Start Generating AI Images
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
