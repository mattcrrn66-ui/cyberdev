// app/api/affiliate/click/comfy/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const COMFY_URL = process.env.COMFY_URL || "http://127.0.0.1:8188";

// Load the base workflow JSON you exported from ComfyUI
async function loadBaseWorkflow() {
  const filePath = path.join(
    process.cwd(),
    "app",
    "comfy",
    "workflows",
    "CyberDev.json"
  );

  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

// Inject prompt text into the correct nodes in the workflow
function injectPrompts(
  workflow: any,
  positivePrompt: string,
  negativePrompt?: string
) {
  // TODO: update these IDs to match your actual CLIPText nodes
  const POSITIVE_NODE_ID = "5"; // e.g. node id for main prompt
  const NEGATIVE_NODE_ID = "8"; // e.g. node id for negative prompt

  if (workflow[POSITIVE_NODE_ID]) {
    workflow[POSITIVE_NODE_ID].inputs.text = positivePrompt;
  }

  if (negativePrompt && workflow[NEGATIVE_NODE_ID]) {
    workflow[NEGATIVE_NODE_ID].inputs.text = negativePrompt;
  }

  return workflow;
}

export const runtime = "nodejs"; // ensure Node runtime (not edge)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      prompt = "ultra realistic portrait, cyberdev default",
      negativePrompt = "blurry, low quality, distorted, extra limbs, text",
    } = body as {
      prompt?: string;
      negativePrompt?: string;
    };

    // 1) Load workflow from disk
    let workflow = await loadBaseWorkflow();

    // 2) Inject the prompts into the nodes
    workflow = injectPrompts(workflow, prompt, negativePrompt);

    // 3) Build payload for Comfy
    const client_id = "cyberdev-ui";
    const payload = {
      client_id,
      prompt: workflow,
    };

    // 4) Send to ComfyUI via COMFY_URL env
    const res = await fetch(`${COMFY_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("ComfyUI error:", text);
      return NextResponse.json(
        { success: false, error: "ComfyUI request failed", detail: text },
        { status: 500 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      comfy: data,
      client_id,
    });
  } catch (err: any) {
    console.error("Comfy route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
