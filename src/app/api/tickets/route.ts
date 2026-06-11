import { createTicket, listTickets } from "@/lib/tickets/ticketService";
import { runMigration } from "@/lib/tickets/ticketService";

export async function GET(req: Request) {
  try {
    await runMigration();
    const url    = new URL(req.url);
    const status = url.searchParams.get("status") as any ?? undefined;
    const limit  = parseInt(url.searchParams.get("limit")  ?? "50",  10);
    const offset = parseInt(url.searchParams.get("offset") ?? "0",   10);
    const result = await listTickets({ status, limit, offset });
    return Response.json(result);
  } catch (err) {
    console.error("[tickets] GET error:", err);
    return Response.json({ error: "Failed to list tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await runMigration();
    const body = await req.json();
    if (!body.title?.trim()) {
      return Response.json({ error: "title is required" }, { status: 400 });
    }
    const ticket = await createTicket(body);
    return Response.json({ ticket }, { status: 201 });
  } catch (err) {
    console.error("[tickets] POST error:", err);
    return Response.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
