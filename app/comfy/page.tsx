"use client";

import { useState, useCallback } from "react";

type SendResponse = {
  ok: boolean;
  status: number;
  contentType: string | null;
  json: any;
  text: string | null;
};

type ResultResponse = {
  ok: boolean;
  completed?: boolean;
  images?: { filename: string; url: string }[];
  rawHistory?: any;
  error?: string;
};

export default function ComfyTesterPage() {
  const [prompt, setPrompt] = useState("girl on couch");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastSend, setLastSend] = useState<SendResponse | null>(null);
  const [lastResult, setLastResult] = useState<ResultResponse | null>(null);
  const [images, setImages] = useState<{ filename: string; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pretty = (value: any) =>
    value ? JSON.stringify(value, null, 2) : "// No data yet";

  const pollForResult = useCallback(async (promptId: string) => {
    let tries = 0;
    const maxTries = 40; // ~80 seconds at 2s interval
    const delay = 2000;

    async function loop() {
      tries += 1;
      try {
        const res = await fetch(
          `/api/affiliate/click/comfy/result?promptId=${encodeURIComponent(
            promptId
          )}`,
          { cache: "no-store" }
        );
        const data: ResultResponse = await res.json();
        setLastResult(data);

        if (!data.ok) {
          setError(data.error ?? "Result route returned an error");
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
        console.error(err);
        setError(err?.message ?? "Error polling for result");
        setIsGenerating(false);
      }
    }

    loop();
  }, []);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setImages([]);
      setLastResult(null);

      // Use GET and pass the prompt as a query parameter
      const res = await fetch(
        `/api/affiliate/click/comfy?prompt=${encodeURIComponent(prompt)}`
      );

      const contentType = res.headers.get("content-type");
      const text = await res.text();
      let parsed: any = null;

      if (contentType && contentType.includes("application/json") && text) {
        try {
          parsed = JSON.parse(text);
        } catch (e) {
          console.warn("Failed to parse JSON from send endpoint:", e);
        }
      }

      const debugPayload: SendResponse = {
        ok: res.ok,
        status: res.status,
        contentType,
        json: parsed,
        text: text || null,
      };

      setLastSend(debugPayload);

      if (!res.ok) {
        setIsGenerating(false);
        setError(
          `Send endpoint failed with status ${res.status}${
            text ? ` – ${text}` : ""
          }`
        );
        return;
      }

      const data = parsed ?? debugPayload;

      const promptId =
        data?.json?.prompt_id || data?.prompt_id || data?.id || null;

      if (!promptId) {
        setIsGenerating(false);
        setError("No prompt_id returned from send endpoint (check Last Send).");
        return;
      }

      // Start polling for the result for this prompt
      await pollForResult(promptId);
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
            Cyber Dev → ComfyUI Tester
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold">
            ComfyUI Tester
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Send a prompt to the Comfy proxy in production and auto-poll
            for the result. When the job finishes, any generated images
            will appear below.
          </p>
        </header>

        {/* Prompt + button */}
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
                Waiting for Comfy… polling result endpoint.
              </span>
            )}
          </div>

          {error && (
            <p className="text-xs text-rose-400 mt-2">
              Error: {error}
            </p>
          )}
        </section>

        {/* JSON panels */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <h2 className="text-xs font-semibold text-slate-300 mb-2">
              Last Send →{" "}
              <span className="text-cyan-400">/api/affiliate/click/comfy</span>
            </h2>
            <pre className="flex-1 text-[11px] md:text-xs bg-slate-950 rounded-xl p-3 overflow-auto">
              {pretty(lastSend)}
            </pre>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col">
            <h2 className="text-xs font-semibold text-slate-300 mb-2">
              Last Result →{" "}
              <span className="text-cyan-400">
                /api/affiliate/click/comfy/result
              </span>
            </h2>
            <pre className="flex-1 text-[11px] md:text-xs bg-slate-950 rounded-xl p-3 overflow-auto">
              {pretty(lastResult)}
            </pre>
          </div>
        </section>

        {/* Images */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Generated Images
          </h2>
          {images.length === 0 && (
            <p className="text-xs text-slate-500">
              No images yet. Run a prompt and wait for Comfy to finish.
            </p>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => (
                <figure
                  key={img.filename}
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
