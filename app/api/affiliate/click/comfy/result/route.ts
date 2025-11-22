import { NextRequest, NextResponse } from "next/server";

const COMFY_URL = process.env.COMFY_URL;

export async function GET(req: NextRequest) {
  try {
    if (!COMFY_URL) {
      return NextResponse.json(
        { ok: false, error: "COMFY_URL environment variable missing" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const promptId = url.searchParams.get("promptId");

    if (!promptId) {
      return NextResponse.json(
        { ok: false, error: "Missing promptId" },
        { status: 400 }
      );
    }

    const historyUrl = `${COMFY_URL}/history/${encodeURIComponent(promptId)}`;
    const historyRes = await fetch(historyUrl, { cache: "no-store" });

    if (!historyRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to fetch Comfy history",
          status: historyRes.status,
        },
        { status: 500 }
      );
    }

    const history = await historyRes.json();

    if (!history || !history[promptId]) {
      return NextResponse.json(
        { ok: true, completed: false, images: [], rawHistory: null },
        { status: 200 }
      );
    }

    const item = history[promptId];

    if (!item.outputs) {
      return NextResponse.json(
        { ok: true, completed: false, images: [], rawHistory: item },
        { status: 200 }
      );
    }

    const outputObj = item.outputs;
    let images: { filename: string; url: string }[] = [];

    for (const nodeId of Object.keys(outputObj)) {
      const nodeOutput = outputObj[nodeId];

      if (!nodeOutput.images) continue;

      for (const img of nodeOutput.images) {
        const filename = img.filename;
        const subfolder = img.subfolder ?? "";
        const type = img.type ?? "output";

        const url = `/api/affiliate/click/comfy/image?filename=${encodeURIComponent(
          filename
        )}&subfolder=${encodeURIComponent(
          subfolder
        )}&type=${encodeURIComponent(type)}`;

        images.push({ filename, url });
      }
    }

    return NextResponse.json({
      ok: true,
      completed: true,
      images,
      rawHistory: item,
    });
  } catch (err: any) {
    console.error("RESULT ROUTE ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
