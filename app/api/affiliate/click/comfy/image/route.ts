import { NextRequest, NextResponse } from "next/server";

const COMFY_URL = process.env.COMFY_URL || "http://127.0.0.1:8188";

export async function GET(req: NextRequest) {
  try {
    if (!COMFY_URL) {
      return NextResponse.json(
        { ok: false, error: "COMFY_URL environment variable is not set" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const filename = url.searchParams.get("filename");
    const subfolder = url.searchParams.get("subfolder") ?? "";
    const type = url.searchParams.get("type") ?? "output";

    if (!filename) {
      return NextResponse.json(
        { ok: false, error: "Missing filename" },
        { status: 400 }
      );
    }

    const viewUrl =
      `${COMFY_URL}/view` +
      `?filename=${encodeURIComponent(filename)}` +
      `&subfolder=${encodeURIComponent(subfolder)}` +
      `&type=${encodeURIComponent(type)}`;

    const res = await fetch(viewUrl);

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          ok: false,
          error: "Failed to fetch image from Comfy",
          status: res.status,
          body: text,
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("Error in comfy image route:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
