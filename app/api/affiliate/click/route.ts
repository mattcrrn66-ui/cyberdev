// app/api/affiliate/click/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

const supabase = createClient();

export const POST = async (req: NextRequest) => {
  try {
    // ---- STEP 1: Parse JSON body safely ----
    let body: unknown;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        {
          ok: false,
          step: "parse-body",
          error: "Failed to parse JSON body",
          rawError: String(e),
        },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          ok: false,
          step: "validate-body",
          error: "Body is not a valid JSON object",
        },
        { status: 400 }
      );
    }

    const { affiliate_code, source } = body as {
      affiliate_code?: string;
      source?: string;
    };

    if (!affiliate_code) {
      return NextResponse.json(
        {
          ok: false,
          step: "validate-fields",
          error: "Missing affiliate_code",
        },
        { status: 400 }
      );
    }

    // ---- STEP 2: Collect request metadata ----
    const ipHeader =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ip = ipHeader.split(",")[0].trim();
    const ua = req.headers.get("user-agent") || "unknown";

    // ---- STEP 3: Try Supabase insert with full error debug ----
    const { data, error } = await supabase
      .from("affiliate_clicks")
      .insert({
        affiliate_code,
        source: source || "site_visit",
        ip_address: ip,
        user_agent: ua,
      })
      .select("*")
      .single();

    if (error) {
      // 🔥 DEBUG: return full Supabase error to the client
      return NextResponse.json(
        {
          ok: false,
          step: "supabase-insert",
          supabaseError: {
            message: error.message,
            code: (error as any).code ?? null,
            details: (error as any).details ?? null,
            hint: (error as any).hint ?? null,
          },
        },
        { status: 500 }
      );
    }

    // ✅ Success path with full data
    return NextResponse.json(
      {
        ok: true,
        step: "done",
        insertedRow: data,
      },
      { status: 200 }
    );
  } catch (err) {
    // 🔥 Catch-all debug
    return NextResponse.json(
      {
        ok: false,
        step: "catch-block",
        error: String(err),
      },
      { status: 500 }
    );
  }
};
