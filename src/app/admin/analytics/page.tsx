"use client";
import { useEffect, useState } from "react";
import styles from "./analytics.module.css";

// ─── Types (mirrors AnalyticsStats from logger.ts) ────────────────────────────
interface Stats {
  queriesTotal:       number;
  queriesToday:       number;
  avgLatencyMs:       number;
  failedRetrievals:   number;
  thumbsUp:           number;
  thumbsDown:         number;
  totalInputTokens:   number;
  totalOutputTokens:  number;
  topQueries:         { query: string; count: number }[];
  latencyByHour:      { hour: string; avg_ms: number; count: number }[];
  avgLatencyPeriods:  { "1d": number; "7d": number; "14d": number; "30d": number };
  confidenceDist:     { conf: string; count: number }[];
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent,
}: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={{ color: accent ?? "var(--c-text)" }}>
        {value}
      </div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function BarChart({
  rows, labelKey, valueKey, color = "#3b82f6",
}: {
  rows:     Record<string, any>[];
  labelKey: string;
  valueKey: string;
  color?:   string;
}) {
  const max = Math.max(...rows.map(r => Number(r[valueKey])), 1);
  return (
    <div className={styles.barChart}>
      {rows.map((r, i) => (
        <div key={i} className={styles.barRow}>
          <div className={styles.barLabel} title={String(r[labelKey])}>
            {String(r[labelKey]).slice(0, 38)}
          </div>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ width: `${(Number(r[valueKey]) / max) * 100}%`, background: color }}
            />
          </div>
          <div className={styles.barCount}>{r[valueKey]}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Intent badge colors ──────────────────────────────────────────────────────
const INTENT_COLORS: Record<string, string> = {
  buying_signal:   "#22c55e",
  roi_question:    "#3b82f6",
  demo_request:    "#8b5cf6",
  competitor:      "#f59e0b",
  deployment_pref: "#06b6d4",
  fact:            "#6b7280",
  pain_point:      "#ef4444",
  goal:            "#10b981",
};

interface VisitorSession {
  sessionId:    string;
  intentScore:  number;
  lastActivity: string;
  insights:     { type: string; text: string; source: string }[];
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"performance" | "visitors">("performance");
  const [stats,     setStats]     = useState<Stats | null>(null);
  const [days,      setDays]      = useState(7);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const [visitors,        setVisitors]        = useState<VisitorSession[]>([]);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [summaries,       setSummaries]       = useState<Record<string, string>>({});
  const [summaryLoading,  setSummaryLoading]  = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/analytics?days=${days}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setStats(d);
      })
      .catch(e => setError(e.message ?? "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    if (activeTab !== "visitors") return;
    setVisitorsLoading(true);
    fetch(`/api/admin/analytics/visitors?days=${days}&limit=50`)
      .then(r => r.json())
      .then(d => setVisitors(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setVisitorsLoading(false));
  }, [activeTab, days]);

  async function generateSummary(sessionId: string) {
    setSummaryLoading(prev => ({ ...prev, [sessionId]: true }));
    try {
      const r = await fetch("/api/admin/analytics/opportunity-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const d = await r.json();
      if (d.summary) setSummaries(prev => ({ ...prev, [sessionId]: d.summary }));
    } catch {}
    setSummaryLoading(prev => ({ ...prev, [sessionId]: false }));
  }

  const satisfactionRate = stats && (stats.thumbsUp + stats.thumbsDown > 0)
    ? Math.round((stats.thumbsUp / (stats.thumbsUp + stats.thumbsDown)) * 100)
    : null;

  const noMatchRate = stats && stats.queriesTotal > 0
    ? Math.round((stats.failedRetrievals / stats.queriesTotal) * 100)
    : null;

  return (
    <div>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Analytics</h1>
          <p className={styles.pageSubtitle}>Chat performance &amp; retrieval quality</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 4 }}>
            {(['performance', 'visitors'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: activeTab === tab ? '#3b82f6' : 'transparent',
                  color: activeTab === tab ? '#fff' : '#9ca3af',
                }}
              >
                {tab === 'performance' ? '📊 Performance' : '👥 Visitors'}
              </button>
            ))}
          </div>
          <div className={styles.controls}>
            {[1, 7, 14, 30].map(d => (
              <button
                key={d}
                className={`${styles.dayBtn} ${d === days ? styles.dayBtnActive : ""}`}
                onClick={() => setDays(d)}
              >
                {d === 1 ? "24h" : `${d}d`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className={styles.loading}>Loading…</div>}
      {error   && <div className={styles.error}>⚠ {error}</div>}

      {loading && <div className={styles.loading}>Loading…</div>}
      {error   && <div className={styles.error}>⚠ {error}</div>}

      {/* ── Performance Tab ── */}
      {activeTab === "performance" && stats && !loading && (
        <>
          {/* ── KPI cards ── */}
          <div className={styles.statsGrid}>
            <StatCard label="Total Queries"     value={stats.queriesTotal.toLocaleString()} />
            <StatCard label="Queries Today"     value={stats.queriesToday.toLocaleString()} accent="#3b82f6" />
            <StatCard label="Avg Latency"       value={`${stats.avgLatencyMs.toLocaleString()} ms`} />
            <StatCard
              label="Failed Retrievals"
              value={stats.failedRetrievals.toLocaleString()}
              sub={noMatchRate !== null ? `${noMatchRate}% no-match rate` : undefined}
              accent={noMatchRate !== null && noMatchRate > 20 ? "#ef4444" : undefined}
            />
            <StatCard label="👍 Helpful"        value={stats.thumbsUp.toLocaleString()}    accent="#22c55e" />
            <StatCard
              label="👎 Not Helpful"
              value={stats.thumbsDown.toLocaleString()}
              sub={satisfactionRate !== null ? `${satisfactionRate}% satisfaction` : undefined}
              accent={satisfactionRate !== null && satisfactionRate < 60 ? "#ef4444" : undefined}
            />
            <StatCard label="Input Tokens ~"   value={stats.totalInputTokens.toLocaleString()} sub="approximate" />
            <StatCard label="Output Tokens ~"  value={stats.totalOutputTokens.toLocaleString()} sub="approximate" />
          </div>

          {/* ── Average Latency Periods ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Average Latency</h2>
            <div className={styles.statsGrid} style={{ marginBottom: 0 }}>
              <StatCard label="24 Hours"  value={`${stats.avgLatencyPeriods["1d"]} ms`} />
              <StatCard label="7 Days"    value={`${stats.avgLatencyPeriods["7d"]} ms`} />
              <StatCard label="14 Days"   value={`${stats.avgLatencyPeriods["14d"]} ms`} />
              <StatCard label="30 Days"   value={`${stats.avgLatencyPeriods["30d"]} ms`} />
            </div>
          </div>

          {/* ── Two-col charts ── */}
          <div className={styles.twoCol}>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Retrieval Confidence</h2>
              {stats.confidenceDist.length > 0 ? (
                <BarChart rows={stats.confidenceDist} labelKey="conf" valueKey="count" color="#3b82f6" />
              ) : (
                <div className={styles.empty}>No data yet</div>
              )}
            </div>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Top Queries</h2>
              {stats.topQueries.length > 0 ? (
                <BarChart rows={stats.topQueries} labelKey="query" valueKey="count" color="#8b5cf6" />
              ) : (
                <div className={styles.empty}>No data yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Visitors Tab ── */}
      {activeTab === "visitors" && (
        <div>
          {visitorsLoading && <div className={styles.loading}>Loading visitor data…</div>}
          {!visitorsLoading && visitors.length === 0 && (
            <div className={styles.empty} style={{ marginTop: 32, textAlign: 'center' }}>
              No visitor signals collected yet. Signals appear after users interact with the chatbot.
            </div>
          )}
          {visitors.map(v => (
            <div key={v.sessionId} className={styles.section} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
                    {v.sessionId.slice(0, 24)}…
                  </span>
                  <span style={{
                    marginLeft: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                    background: v.intentScore >= 50 ? 'rgba(34,197,94,0.15)' : v.intentScore >= 25 ? 'rgba(59,130,246,0.15)' : 'rgba(107,114,128,0.15)',
                    color:      v.intentScore >= 50 ? '#22c55e'               : v.intentScore >= 25 ? '#60a5fa'               : '#9ca3af',
                  }}>
                    Intent Score: {v.intentScore}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 11, color: '#6b7280' }}>
                    {new Date(v.lastActivity).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => generateSummary(v.sessionId)}
                  disabled={summaryLoading[v.sessionId]}
                  style={{
                    fontSize: 11, padding: '5px 12px', borderRadius: 6, border: 'none',
                    background: '#4f46e5', color: '#fff', cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  {summaryLoading[v.sessionId] ? 'Generating…' : summaries[v.sessionId] ? '↻ Refresh Summary' : '✨ Generate Summary'}
                </button>
              </div>

              {/* Insight chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {v.insights.map((ins, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: '3px 9px', borderRadius: 20,
                    background: `${INTENT_COLORS[ins.type] ?? '#6b7280'}18`,
                    border:     `1px solid ${INTENT_COLORS[ins.type] ?? '#6b7280'}40`,
                    color:       INTENT_COLORS[ins.type] ?? '#9ca3af',
                  }} title={`Source: ${ins.source}`}>
                    <strong>{ins.type.replace(/_/g, ' ')}</strong>: {ins.text.slice(0, 60)}
                  </span>
                ))}
              </div>

              {/* Opportunity summary (on-demand LLM, one call, cached) */}
              {summaries[v.sessionId] && (
                <div style={{
                  padding: '10px 14px', borderRadius: 6,
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                  fontSize: 13, color: '#c7d2fe', lineHeight: 1.6,
                }}>
                  <strong style={{ color: '#818cf8', fontSize: 11 }}>OPPORTUNITY SUMMARY</strong>
                  <br />
                  {summaries[v.sessionId]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
