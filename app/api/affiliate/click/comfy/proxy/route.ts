import { NextResponse } from "next/server";

// ============================================================
// CONFIG
// ============================================================

const COMFY_BASE_URL =
  process.env.COMFY_BASE_URL || "http://127.0.0.1:8188";
const MAX_POLL_SECONDS = 60;
const POLL_INTERVAL_MS = 1000;

// ============================================================
// ABSOLUTE ZERO-TOLERANCE SAFETY FILTER
// Blocks ALL child/minor/youth + sexual content attempts
// Also aggressively blocks NSFW human content in general.
// ============================================================

function isUnsafePrompt(prompt: string): boolean {
  const text = prompt.toLowerCase();

  // 🚫 HARD BAN: any child / minor / youth related terms
  const child = [
    "child",
    "children",
    "kid",
    "kids",
    "toddler",
    "infant",
    "baby",
    "minor",
    "underage",
    "under age",
    "u18",
    "under 18",
    "younger",
    "youth",
    "preteens",
    "pre-teen",
    "preteen",
    "middle school",
    "high school",
    "elementary",
    "schoolgirl",
    "school girl",
    "school boy",
    "loli",
    "lolita",
    "shota",
  ];

  // 🚫 HARD BAN: sexual / explicit terms
  const sexual = [
    "sex",
    "sexual",
    "nsfw",
    "porn",
    "pornographic",
    "nude",
    "naked",
    "erotic",
    "fetish",
    "lewd",
    "provocative",
    "sensual",
    "explicit",
    "orgasm",
    "boobs",
    "tits",
    "penis",
    "vagina",
    "butt plug",
    "dildo",
  ];

  // 🚫 TERMLIST: "soft phrasing" used to sneak around filters
  const childSoft = [
    "young girl",
    "young boy",
    "young woman",
    "tiny girl",
    "tiny body",
    "small girl",
    "baby face",
    "childlike",
    "youthful body",
    "petite girl",
    "petite body",
    "little girl",
  ];

  // 🚫 NSFW disguised as "art"
  const nsfwDisguised = [
    "artistic nude",
    "artistic model",
    "nude pose",
    "boudoir",
    "tasteful nude",
    "mature content",
    "suggestive pose",
  ];

  // 🚨 RULE 1: If ANY child term appears at ALL → BLOCK
  if (child.some((w) => text.includes(w))) return true;
  if (childSoft.some((w) => text.includes(w))) return true;

  // 🚨 RULE 2: If ANY sexual term appears → BLOCK (no NSFW humans allowed)
  if (sexual.some((w) => text.includes(w))) return true;
  if (nsfwDisguised.some((w) => text.includes(w))) return true;

  // 🚨 RULE 3: If prompt contains "girl" or "boy" AND any "sexy" descriptor → BLOCK
  if (text.includes("girl") || text.includes("boy")) {
    const sexyDescriptors = [
      "cute",
      "beautiful",
      "hot",
      "sexy",
      "sensual",
      "provocative",
      "seductive",
      "tight",
      "revealing",
      "lingerie",
    ];
    if (sexyDescriptors.some((w) => text.includes(w))) return true;
  }

  // 🚨 RULE 4: If "young", "petite", "small", or "tiny" with any body term → BLOCK
  const sizeTerms = ["young", "petite", "small", "tiny"];
  const bodyTerms = ["girl", "woman", "body", "figure", "lady"];
  if (
    sizeTerms.some((a) => text.includes(a)) &&
    bodyTerms.some((b) => text.includes(b))
  ) {
    return true;
  }

  // 🚨 RULE 5: If anything that resembles CP slang / coded terms → BLOCK
  const coded = ["cp", "jailbait", "jb", "hd-cp", "teen model"];
  if (coded.some((w) => text.includes(w))) return true;

  // 🚨 RULE 6: If user tries to specify an age less than 18 → BLOCK
  const ageRegex = /\b(1[0-7]|0?[0-9])\b\s?(yo|years? old|year old|yrs?)/;
  if (ageRegex.test(text)) return true;

  return false;
}

// ============================================================
// Extract ALL text recursively from payload for moderation
// (so it catches text inside workflow nodes, prompts, etc.)
// ============================================================

function extractTextForModeration(payload: any): string {
  const strings: string[] = [];

  function walk(value: any) {
    if (typeof value === "string") {
      strings.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  }

  walk(payload);
  return strings.join(" ");
}

// Small helper
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================
// POST /api/comfy/proxy
// - Applies safety filter
// - Forwards body to Comfy /prompt
// - Polls /history/{prompt_id}
// - Returns imageUrls[]
// ============================================================

export async function POST(req: Request) {
  try {
    if (!COMFY_BASE_URL) {
      return NextResponse.json(
        { error: "COMFY_BASE_URL is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Extract ALL text content from the payload for safety scanning
    const moderationText = extractTextForModeration(body);

    if (isUnsafePrompt(moderationText)) {
      console.warn("🚫 Blocked unsafe prompt payload:", moderationText);
      return NextResponse.json(
        {
          error:
            "❌ This prompt violates safety rules and cannot be generated.",
        },
        { status: 400 }
      );
    }

    // Forward the payload to Comfy exactly as-is,
    // but make sure we have a client_id
    const clientId = body.client_id || crypto.randomUUID();
    const payload = { ...body, client_id: clientId };

    const promptRes = await fetch(`${COMFY_BASE_URL}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!promptRes.ok) {
      const text = await promptRes.text();
      console.error("Comfy /prompt error:", text);
      return NextResponse.json(
        {
          error: "Failed to send prompt to Comfy.",
          details: text,
        },
        { status: 502 }
      );
    }

    const promptJson = await promptRes.json();
    const promptId =
      promptJson.prompt_id || promptJson.id || promptJson.number || null;

    if (!promptId) {
      console.error("Unexpected /prompt response:", promptJson);
      return NextResponse.json(
        { error: "Comfy did not return a prompt_id." },
        { status: 502 }
      );
    }

    // Poll history for completion
    let historyEntry: any = null;

    const maxTries = Math.floor(MAX_POLL_SECONDS * 1000 / POLL_INTERVAL_MS);

    for (let i = 0; i < maxTries; i++) {
      const histRes = await fetch(`${COMFY_BASE_URL}/history/${promptId}`, {
        method: "GET",
      });

      if (histRes.ok) {
        const histJson = await histRes.json();

        // Comfy history shape: { [promptId]: { outputs: { nodeId: { images: [...] } } } }
        const entry =
          histJson[promptId] || Object.values(histJson)[0] || null;

        if (entry && entry.outputs) {
          historyEntry = entry;
          break;
        }
      }

      await sleep(POLL_INTERVAL_MS);
    }

    if (!historyEntry || !historyEntry.outputs) {
      console.error("No outputs found in history for prompt:", promptId);
      return NextResponse.json(
        { error: "No images returned from Comfy history." },
        { status: 500 }
      );
    }

    // Collect all images from all nodes
    const imageUrls: string[] = [];

    for (const nodeId of Object.keys(historyEntry.outputs)) {
      const nodeOutput = historyEntry.outputs[nodeId];
      if (!nodeOutput || !Array.isArray(nodeOutput.images)) continue;

      for (const img of nodeOutput.images) {
        if (!img?.filename) continue;

        const filename = encodeURIComponent(img.filename);
        const subfolder = encodeURIComponent(img.subfolder || "");
        const type = encodeURIComponent(img.type || "output");

        const url = `${COMFY_BASE_URL}/view?filename=${filename}&subfolder=${subfolder}&type=${type}`;
        imageUrls.push(url);
      }
    }

    if (imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Images array ended up empty." },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrls });
  } catch (err: any) {
    console.error("Comfy proxy error:", err);
    return NextResponse.json(
      {
        error: "Comfy proxy failed.",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
