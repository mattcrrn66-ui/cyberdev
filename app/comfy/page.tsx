"use client";

import { useState, useCallback } from "react";

type ImageInfo = {
  filename: string;
  url: string; // proxied URL from /api/affiliate/click/comfy/image
};

type ComfySendResponse = {
  ok: boolean;
  prompt_id?: string;
  raw?: any;
  error?: string;
};

type ResultResponse = {
  ok: boolean;
  completed?: boolean;
  images?: ImageInfo[];
  rawHistory?: any;
  error?: string;
};

export default function ComfyTesterPage() {
  const [prompt, setPrompt] = useState(
    "high quality cyberpunk banner for CyberDev"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Poll /api/affiliate/click/comfy/result until images are ready
  const pollForResult = useCallback((promptId: string) => {
    let tries = 0;
    const maxTries = 40; // ~80 seconds total if delay=2000
    const delay = 2000;

    const loop = async () => {
      tries += 1;
      try {
        const res = await fetch(
          `/api/affiliate/click/comfy/result?promptId=${encodeURIComponent(
            promptId
          )}`,
          { cache: "no-store" }
        );

        const text = await res.text();
        let data: ResultResponse | null = null;

        try {
          data = text ? (JSON.parse(text) as ResultResponse) : null;
        } catch (e) {
          console.error("Non-JSON result response:", text);
          setError("Invalid result response from server.");
          setIsGenerating(false);
          return;
        }

        if (!data) {
          setError("Empty result response from server.");
          setIsGenerating(false);
          return;
        }

        if (!data.ok) {
          setError(data.error || "Result route returned an error.");
          setIsGenerating(false);
          return;
        }

        if (data.completed && data.images && data.images.length > 0) {
          setImages(data.images);
          setIsGenerating(false);
          return;
        }

        if (tries >= maxTries) {
          setError("Timed out waiting for Comfy to finish.");
          setIsGenerating(false);
          return;
        }

        // Not done yet → poll again
        setTimeout(loop, delay);
      } catch (err: any) {
        console.error("Error polling result:", err);
        setError(err?.message ?? "Error polling for result");
        setIsGenerating(false);
      }
    };

    loop();
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setImages([]);

      const res = await fetch("/api/affiliate/click/comfy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const text = await res.text();
      let data: ComfySendResponse | null = null;

      try {
        data = text ? (JSON.parse(text) as ComfySendResponse) : null;
      } catch (e) {
        console.error("Non-JSON send response:", text);
        setError("Server returned an invalid response. Check logs.");
        setIsGenerating(false);
        return;
      }

      if (!data) {
        setError("Empty response from server.");
        setIsGenerating(false);
        return;
      }

      if (!res.ok || !data.ok) {
        console.error("Comfy send API error:", data);
        setError(data.error || `Generation failed (status ${res.status})`);
        setIsGenerating(false);
        return;
      }

      const promptId = data.prompt_id;
      if (!promptId) {
        setError("No prompt_id returned from Comfy send endpoint.");
        setIsGenerating(false);
        return;
      }

      // 🔁 Start polling result endpoint
      pollForResult(promptId);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Error sending prompt");
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
          <h1 className="text-3xl md:text-4xl font-semibold">
            ComfyUI Live Generator
          </h1>
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
                Talking to Comfy through ngrok… polling for result.
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
              <span className="text-cyan-400 font-medium">
                Generate via Comfy
              </span>
              .
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
