import { getTicket, updateTicket, deleteTicket } from "@/lib/tickets/ticketService";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ticket = await getTicket(id);
    if (!ticket) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ticket });
  } catch (err) {
    console.error("[tickets/id] GET error:", err);
    return Response.json({ error: "Failed to get ticket" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body    = await req.json();
    const allowed = ["status", "category", "priority", "title", "summary"] as const;
    const fields: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) fields[key] = body[key];
    }
    const ticket = await updateTicket(id, fields as any);
    if (!ticket) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ticket });
  } catch (err) {
    console.error("[tickets/id] PATCH error:", err);
    return Response.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ok      = await deleteTicket(id);
    if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[tickets/id] DELETE error:", err);
    return Response.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}