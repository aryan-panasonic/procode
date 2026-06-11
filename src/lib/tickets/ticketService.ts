import { pool } from "@/lib/db/postgres";

export type TicketStatus   = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high";
export type TicketCategory = "technical" | "billing" | "general" | "feature_request" | "other";

export interface Ticket {
  id:                   string;
  title:                string;
  summary:              string | null;
  category:             string | null;
  priority:             TicketPriority;
  status:               TicketStatus;
  customer_name:        string | null;
  customer_email:       string | null;
  customer_phone:       string | null;
  session_id:           string | null;
  conversation_summary: string | null;
  created_at:           string;
  updated_at:           string;
}

export interface CreateTicketInput {
  title:                string;
  summary?:             string;
  category?:            string;
  priority?:            TicketPriority;
  customer_name?:       string;
  customer_email?:      string;
  customer_phone?:      string;
  session_id?:          string;
  conversation_summary?: string;
}

export interface ListTicketsOptions {
  status?:   TicketStatus;
  limit?:    number;
  offset?:   number;
}

export async function runMigration(): Promise<void> {
  const fs = await import("fs");
  const path = await import("path");
  const sql = fs.readFileSync(
    path.join(process.cwd(), "src/lib/db/migrations/001_tickets.sql"),
    "utf8"
  );
  await pool.query(sql);
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const { rows } = await pool.query<Ticket>(
    `INSERT INTO tickets
      (title, summary, category, priority, customer_name, customer_email,
       customer_phone, session_id, conversation_summary)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      input.title,
      input.summary ?? null,
      input.category ?? null,
      input.priority ?? "medium",
      input.customer_name ?? null,
      input.customer_email ?? null,
      input.customer_phone ?? null,
      input.session_id ?? null,
      input.conversation_summary ?? null,
    ]
  );
  return rows[0];
}

export async function listTickets(opts: ListTicketsOptions = {}): Promise<{ tickets: Ticket[]; total: number }> {
  const { status, limit = 50, offset = 0 } = opts;
  const where = status ? "WHERE status = $1" : "";
  const params: unknown[] = status ? [status, limit, offset] : [limit, offset];
  const limitIdx = status ? 2 : 1;

  const [dataRes, countRes] = await Promise.all([
    pool.query<Ticket>(
      `SELECT * FROM tickets ${where} ORDER BY created_at DESC LIMIT $${limitIdx} OFFSET $${limitIdx + 1}`,
      params
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM tickets ${where}`,
      status ? [status] : []
    ),
  ]);

  return { tickets: dataRes.rows, total: parseInt(countRes.rows[0].count, 10) };
}

export async function getTicket(id: string): Promise<Ticket | null> {
  const { rows } = await pool.query<Ticket>("SELECT * FROM tickets WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function updateTicket(
  id: string,
  fields: Partial<Pick<Ticket, "status" | "category" | "priority" | "title" | "summary">>
): Promise<Ticket | null> {
  const keys = Object.keys(fields) as (keyof typeof fields)[];
  if (keys.length === 0) return getTicket(id);
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  const vals = keys.map(k => fields[k]);
  const { rows } = await pool.query<Ticket>(
    `UPDATE tickets SET ${sets} WHERE id = $1 RETURNING *`,
    [id, ...vals]
  );
  return rows[0] ?? null;
}

export async function deleteTicket(id: string): Promise<boolean> {
  const { rowCount } = await pool.query("DELETE FROM tickets WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
