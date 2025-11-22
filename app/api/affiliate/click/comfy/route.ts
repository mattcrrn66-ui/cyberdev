import { NextRequest, NextResponse } from "next/server";
import { buildCyberDevWorkflow } from "./workflow";

const COMFY_URL = process.env.COMFY_URL;

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

    const workflow = buildCyberDevWorkflow(prompt);

    const sendRes = await fetch(`${COMFY_URL}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: workflow }),
    });

    const sendText = await sendRes.text();
    let parsed: any = null;

    try {
      parsed = JSON.parse(sendText);
    } catch {
      parsed = sendText;
    }

    if (!sendRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "ComfyUI /prompt responded with an error",
          status: sendRes.status,
          body: parsed,
        },
        { status: 500 }
      );
    }

    const promptId =
      parsed?.prompt_id ||
      parsed?.id ||
      parsed?.json?.prompt_id ||
      null;

    if (!promptId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Comfy returned no prompt_id",
          body: parsed,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      prompt_id: promptId,
      raw: parsed,
    });
  } catch (err: any) {
    console.error("SEND ROUTE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
