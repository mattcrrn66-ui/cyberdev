"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col gap-12">

        {/* Header Section */}
        <section className="flex flex-col gap-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-50">
            Cyber Dev Token • $CDT
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            The Roundtable for Builders on Solana.
            Create tokens, build communities, and launch your ideas into reality.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-6 space-x-4">
            <Link
              href="/meme-launchpad"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cyan-500 text-slate-900 font-semibold text-lg hover:bg-cyan-400 transition"
            >
              🚀 Launch a Token Now
            </Link>
            <Link
              href="/comfy"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cyan-500 text-slate-900 font-semibold text-lg hover:bg-cyan-400 transition"
            >
              🎨 Generate AI Images for Free
            </Link>
          </div>
        </section>

        {/* Image Section: Left Image (1000028629.png) and Right Image (1000028693.jpg) */}
        <section className="flex flex-col md:flex-row gap-12 items-center mt-10">
          {/* Left Image (Character Typing Effect) */}
          <div className="relative animate-typing">
            <Image
              src="/1000028629.png" // Left image path in /public
              alt="Left Image"
              width={500}
              height={500}
              className="rounded-lg shadow-lg drop-shadow-[0_0_20px_rgba(0,200,255,0.6)]"
            />
            <div className="absolute bottom-5 left-5 text-2xl text-slate-50 glow-text animate-typing-text">Typing...</div>
          </div>

          {/* Right Image (Smooth Floating Effect) */}
          <div className="relative animate-move-image">
            <Image
              src="/1000028693.jpg" // Right image path in /public
              alt="Right Image"
              width={500}
              height={500}
              className="rounded-lg shadow-lg drop-shadow-[0_0_20px_rgba(0,200,255,0.6)]"
            />
          </div>
        </section>

        {/* New AI Image Generation Section */}
        <section className="bg-slate-900/50 p-10 mt-16 rounded-xl">
          <h2 className="text-3xl font-semibold text-center text-cyan-300">
            Generate AI-Driven Images in Seconds
          </h2>
          <p className="text-lg text-center text-slate-400 mt-4 max-w-2xl mx-auto">
            Unlock the power of AI-generated images — absolutely free. Whether you need visuals for your token,
            marketing, or any project, CyberDev provides the tools to create stunning, custom AI images instantly.
          </p>
          <div className="text-center mt-6">
            <Link
              href="/comfy"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-cyan-500 text-slate-900 font-semibold text-lg hover:bg-cyan-400 transition"
            >
              Start Generating AI Images
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
