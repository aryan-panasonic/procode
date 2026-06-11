"use client";
import { useEffect, useState } from "react";
import styles from "./tickets.module.css";

interface Ticket {
  id: string;
  title: string;
  summary: string | null;
  category: string | null;
  priority: string;
  status: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  session_id: string | null;
  conversation_summary: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_TABS = ["all", "open", "in_progress", "resolved"] as const;
type Tab = (typeof STATUS_TABS)[number];

const PRIORITY_COLORS: Record<string, { color: string; bg: string }> = {
  high:   { color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  low:    { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
};

const STATUS_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  open:        { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Open" },
  in_progress: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "In Progress" },
  resolved:    { color: "#22c55e", bg: "rgba(34,197,94,0.12)",  label: "Resolved" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" });
}

function Badge({ value, map }: { value: string; map: Record<string, { color: string; bg: string; label?: string }> }) {
  const s = map[value] ?? { color: "#9ca3af", bg: "rgba(156,163,175,0.12)" };
  return (
    <span className={styles.badge} style={{ color: s.color, background: s.bg }}>
      {(s as any).label ?? value}
    </span>
  );
}

export default function TicketsPage() {
  const [tickets,      setTickets]      = useState<Ticket[]>([]);
  const [total,        setTotal]        = useState(0);
  const [tab,          setTab]          = useState<Tab>("all");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [selected,     setSelected]     = useState<Ticket | null>(null);
  const [updating,     setUpdating]     = useState(false);
  const [statusEdit,   setStatusEdit]   = useState("");
  const [priorityEdit, setPriorityEdit] = useState("");

  async function load(t: Tab) {
    setLoading(true); setError(null);
    try {
      const qs  = t !== "all" ? `?status=${t}` : "";
      const res = await fetch(`/api/tickets${qs}`);
      const d   = await res.json();
      if (d.error) throw new Error(d.error);
      setTickets(d.tickets);
      setTotal(d.total);
    } catch (e: any) {
      setError(e.message ?? "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(tab); }, [tab]);

  function openTicket(t: Ticket) {
    setSelected(t);
    setStatusEdit(t.status);
    setPriorityEdit(t.priority);
  }

  async function saveChanges() {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${selected.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: statusEdit, priority: priorityEdit }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setTickets(prev => prev.map(t => t.id === d.ticket.id ? d.ticket : t));
      setSelected(d.ticket);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  }

  async function deleteTicket() {
    if (!selected || !confirm("Delete this ticket?")) return;
    try {
      await fetch(`/api/tickets/${selected.id}`, { method: "DELETE" });
      setTickets(prev => prev.filter(t => t.id !== selected.id));
      setSelected(null);
    } catch (e: any) {
      alert(e.message);
    }
  }

  const tabLabel = (t: Tab) => ({
    all: "All", open: "Open", in_progress: "In Progress", resolved: "Resolved",
  }[t]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.title}>
          Support Tickets
          <span className={styles.count}>{total} total</span>
        </span>
      </div>

      <div className={styles.tabs}>
        {STATUS_TABS.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ""}`}
            onClick={() => setTab(t)}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.empty}>Loading…</div>
      ) : tickets.length === 0 ? (
        <div className={styles.empty}>No tickets found.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Title</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Priority</th>
              <th className={styles.th}>Category</th>
              <th className={styles.th}>Customer</th>
              <th className={styles.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} className={styles.tr} onClick={() => openTicket(t)}>
                <td className={styles.td} style={{ maxWidth: 280 }}>
                  <div style={{ fontWeight: 500, color: "#f3f4f6", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.title}
                  </div>
                  {t.summary && (
                    <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.summary}
                    </div>
                  )}
                </td>
                <td className={styles.td}><Badge value={t.status}   map={STATUS_COLORS}   /></td>
                <td className={styles.td}><Badge value={t.priority} map={PRIORITY_COLORS} /></td>
                <td className={styles.td} style={{ color: "#9ca3af", fontSize: 12 }}>{t.category ?? "—"}</td>
                <td className={styles.td} style={{ fontSize: 12 }}>
                  {t.customer_name ?? "—"}
                  {t.customer_email && <div style={{ color: "#6b7280" }}>{t.customer_email}</div>}
                </td>
                <td className={styles.td} style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                  {fmtDate(t.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className={styles.modal} onClick={() => setSelected(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>{selected.title}</div>

            <div className={styles.field}>
              <div className={styles.label}>Status</div>
              <select className={styles.select} value={statusEdit} onChange={e => setStatusEdit(e.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className={styles.field}>
              <div className={styles.label}>Priority</div>
              <select className={styles.select} value={priorityEdit} onChange={e => setPriorityEdit(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {selected.category && (
              <div className={styles.field}>
                <div className={styles.label}>Category</div>
                <div className={styles.value}>{selected.category}</div>
              </div>
            )}

            {selected.summary && (
              <div className={styles.field}>
                <div className={styles.label}>Summary</div>
                <div className={styles.value}>{selected.summary}</div>
              </div>
            )}

            {selected.conversation_summary && (
              <div className={styles.field}>
                <div className={styles.label}>Conversation Summary</div>
                <div className={styles.value}>{selected.conversation_summary}</div>
              </div>
            )}

            {(selected.customer_name || selected.customer_email || selected.customer_phone) && (
              <div className={styles.field}>
                <div className={styles.label}>Customer</div>
                <div className={styles.value}>
                  {selected.customer_name && <div>{selected.customer_name}</div>}
                  {selected.customer_email && <div>{selected.customer_email}</div>}
                  {selected.customer_phone && <div>{selected.customer_phone}</div>}
                </div>
              </div>
            )}

            <div className={styles.field}>
              <div className={styles.label}>Created</div>
              <div className={styles.value}>{fmtDate(selected.created_at)}</div>
            </div>

            {selected.session_id && (
              <div className={styles.field}>
                <div className={styles.label}>Session ID</div>
                <div className={styles.value} style={{ fontSize: 12, color: "#6b7280", fontFamily: "monospace" }}>
                  {selected.session_id}
                </div>
              </div>
            )}

            <div className={styles.btnRow}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveChanges} disabled={updating}>
                {updating ? "Saving…" : "Save Changes"}
              </button>
              <button className={`${styles.btn} ${styles.btnDanger}`} onClick={deleteTicket}>
                Delete
              </button>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
