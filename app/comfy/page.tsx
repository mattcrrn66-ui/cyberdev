"use client";

import { useState } from "react";

export default function ComfyTester() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/comfy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">CyberDev → ComfyUI Tester</h1>

      <textarea
        className="w-full border rounded p-2 text-black"
        rows={4}
        placeholder="Enter a prompt to send to your Comfy workflow..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={run}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-500 text-white disabled:opacity-50"
      >
        {loading ? "Running..." : "Generate via Comfy"}
      </button>

      {result && (
        <pre className="bg-black text-green-300 p-3 text-xs overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
