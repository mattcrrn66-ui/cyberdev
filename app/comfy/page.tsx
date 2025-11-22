"use client";

import { useState } from "react";

type ImageInfo = {
  filename: string;
  url: string; // data:image/png;base64,... or a direct URL
};

type ComfyApiResponse = {
  ok: boolean;
  image?: string; // base64 data URL from /api/comfy
  filename?: string;
  images?: ImageInfo[];
  error?: string;
  detail?: string;
};

export default function ComfyTesterPage() {
  const [prompt, setPrompt] = useState(
    "high quality cyberpunk banner for CyberDev"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setImages([]);

      const res = await fetch("/api/comfy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data: ComfyApiResponse = await res.json();

      if (!res.ok || !data.ok) {
        console.error("Comfy API error:", data);
        setError(data.error || `Generation failed (status ${res.status})`);
        return;
      }

      // Case 1: backend returns a single base64 image as `image`
      if (data.image) {
        setImages([
          {
            filename: data.filename || "generated.png",
            url: data.image,
          },
        ]);
        return;
      }

      // Case 2: backend returns an array of images
      if (data.images && data.images.length > 0) {
        setImages(data.images);
        return;
      }

      setError("No image returned from API.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error sending prompt");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
            Cyber Dev → ComfyUI Generator
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold">ComfyUI Live Generator</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Send a prompt from CyberDev to your local ComfyUI (through ngrok),
            then display the generated image directly on this page.
          </p>
        </header>

        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Prompt
          </label>
          <textarea
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-sm resize-y min-h-[64px] focus:outline-none focus:ring-2 focus:ring-cyan-500/60 focus:border-cyan-400"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Generating via Comfy..." : "Generate via Comfy"}
            </button>
            {isGenerating && (
              <span className="text-xs text-slate-400">
                Talking to Comfy through ngrok… this can take a few seconds.
              </span>
            )}
          </div>

          {error && (
            <p className="text-xs text-rose-400 mt-2">Error: {error}</p>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Generated Images
          </h2>
          {images.length === 0 && !isGenerating && !error && (
            <p className="text-xs text-slate-500">
              No images yet. Enter a prompt and hit{" "}
              <span className="text-cyan-400 font-medium">Generate via Comfy</span>.
            </p>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <figure
                  key={img.filename + img.url}
                  className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-64 object-cover"
                  />
                  <figcaption className="px-3 py-2 text-[10px] text-slate-400 truncate">
                    {img.filename}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
