import { getAnalytics } from "@/lib/monitoring/logger";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = Math.min(Number(searchParams.get("days") ?? 7), 90);

    const stats = await getAnalytics(days);
    return Response.json(stats);
  } catch (err) {
    console.error("[admin/analytics] GET error:", err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}
