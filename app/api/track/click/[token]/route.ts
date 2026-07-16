import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const url = new URL(request.url);
  const to = url.searchParams.get("to") ?? `/cotizacion/${token}`;

  try {
    const supabase = await createClient();
    const ip = request.headers.get("x-forwarded-for");
    const ua = request.headers.get("user-agent");
    await supabase.rpc("track_click", { p_token: token, p_ip: ip, p_ua: ua });
  } catch (err) {
    console.error("[track/click] error:", err);
  }

  return NextResponse.redirect(new URL(to, request.url));
}
