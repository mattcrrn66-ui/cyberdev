// app/api/affiliate/click/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { affiliate_code, source } = body as {
      affiliate_code?: string;
      source?: string;
    };

    if (!affiliate_code) {
      return NextResponse.json(
        { error: "Missing affiliate_code" },
        { status: 400 }
      );
    }

    const ipHeader =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ip = ipHeader.split(",")[0].trim();
    const ua = req.headers.get("user-agent") || "unknown";

    const { error } = await supabase.from("affiliate_clicks").insert({
      affiliate_code,
      source: source || "site_visit",
      ip_address: ip,
      user_agent: ua,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Click logging error:", err);
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
};
