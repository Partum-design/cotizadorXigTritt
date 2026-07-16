import { createClient } from "@/lib/supabase/server";

// 1x1 transparent GIF
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7",
  "base64"
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  try {
    const supabase = await createClient();
    const ip = request.headers.get("x-forwarded-for");
    const ua = request.headers.get("user-agent");
    await supabase.rpc("track_open", { p_token: token, p_ip: ip, p_ua: ua });
  } catch (err) {
    console.error("[track/open] error:", err);
  }

  return new Response(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
