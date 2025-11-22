import { NextRequest, NextResponse } from "next/server";

const COMFY_URL = process.env.COMFY_URL || "http://127.0.0.1:8188";

export async function POST(req: NextRequest) {
  try {
    if (!COMFY_URL) {
      return NextResponse.json(
        { ok: false, error: "COMFY_URL environment variable missing" },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { ok: false, error: "Prompt must be a string" },
        { status: 400 }
      );
    }

    // BASIC WORKFLOW – You can replace with your full JSON workflow later
    // For now, this generates a SINGLE image from a simple prompt.
    const workflow = {
      "3": {
        "inputs": {
          "text": prompt
        },
        "class_type": "CLIPTextEncode"
      },
      "5": {
        "inputs": {
          "seed": 123456789,
          "steps": 25,
          "cfg": 7,
          "sampler_name": "euler",
          "scheduler": "normal",
          "denoise": 1,
          "model": 0,
          "positive": 3,
          "negative": 4,
          "latent_image": 2
        },
        "class_type": "KSampler"
      },
      "6": {
        "inputs": {
          "samples": 5,
          "vae": 1
        },
        "class_type": "VAEDecode"
      },
      "7": {
        "inputs": {
          "images": 6
        },
        "class_type": "SaveImage"
      }
    };

    // 🚀 Send workflow to ComfyUI
    const sendRes = await fetch(`${COMFY_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow }),
    });

    const sendText = await sendRes.text();
    let parsed = null;

    try {
      parsed = JSON.parse(sendText);
    } catch {
      parsed = sendText;
    }

    if (!sendRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Comfy /prompt returned an error",
          status: sendRes.status,
          body: parsed,
        },
        { status: 500 }
      );
    }

    const promptId =
      parsed?.prompt_id || parsed?.id || parsed?.json?.prompt_id;

    if (!promptId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Comfy did not return a prompt_id",
          body: parsed,
        },
        { status: 500 }
      );
    }

    // SUCCESS
    return NextResponse.json({
      ok: true,
      prompt_id: promptId,
      raw: parsed,
    });
  } catch (err: any) {
    console.error("SEND route error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}
