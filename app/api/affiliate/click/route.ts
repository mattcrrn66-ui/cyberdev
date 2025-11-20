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
        { success: false, error: "Missing affiliate_code" },
        { status: 400 }
      );
    }

    const ipHeader =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ip = ipHeader.split(",")[0].trim();
    const ua = req.headers.get("user-agent") || "unknown";

    const { data, error } = await supabase
      .from("affiliate_clicks")
      .insert({
        affiliate_code,
        source: source || "site_visit",
        ip_address: ip,
        user_agent: ua,
      })
      .select(); // return inserted row(s) for debugging

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Database insert failed",
          supabaseError: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Click logging error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request body or server error",
        error: String(err?.message || err),
      },
      { status: 400 }
    );
  }
};
