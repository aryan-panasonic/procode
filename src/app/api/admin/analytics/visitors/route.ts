import { getSessionInsights } from "@/lib/monitoring/logger";

export async function GET(req: Request) {
  try {
    const url  = new URL(req.url);
    const days  = parseInt(url.searchParams.get("days")  ?? "30",  10);
    const limit = parseInt(url.searchParams.get("limit") ?? "50",  10);

    const rows = await getSessionInsights(
      Math.min(limit, 200),
      Math.min(days,  90)
    );

    return Response.json({ sessions: rows });
  } catch (err: any) {
    console.error("[visitors] GET failed:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
