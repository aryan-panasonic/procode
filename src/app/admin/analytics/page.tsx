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

// ─── Latency sparkline ────────────────────────────────────────────────────────
function LatencyChart({ rows }: { rows: { hour: string; avg_ms: number; count: number }[] }) {
  if (rows.length === 0) return <div className={styles.empty}>No data yet</div>;

  const maxMs = Math.max(...rows.map(r => r.avg_ms), 1);
  const H = 80;

  return (
    <div className={styles.latencyChart}>
      <svg
        width="100%"
        viewBox={`0 0 ${rows.length * 24} ${H + 20}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {rows.map((r, i) => {
          const barH = Math.max(4, (r.avg_ms / maxMs) * H);
          return (
            <g key={i}>
              <rect
                x={i * 24 + 2}
                y={H - barH}
                width={20}
                height={barH}
                fill="#3b82f6"
                opacity={0.8}
                rx={2}
              />
              <text
                x={i * 24 + 12}
                y={H + 14}
                textAnchor="middle"
                fontSize={8}
                fill="#6b7280"
              >
                {r.hour}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [days,    setDays]    = useState(7);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

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

      {loading && <div className={styles.loading}>Loading…</div>}
      {error   && <div className={styles.error}>⚠ {error}</div>}

      {stats && !loading && (
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

          {/* ── Latency by hour ── */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Latency (last 24 h)</h2>
            <LatencyChart rows={stats.latencyByHour} />
          </div>

          {/* ── Two-col charts ── */}
          <div className={styles.twoCol}>
            {/* Retrieval confidence */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Retrieval Confidence</h2>
              {stats.confidenceDist.length > 0 ? (
                <BarChart
                  rows={stats.confidenceDist}
                  labelKey="conf"
                  valueKey="count"
                  color="#3b82f6"
                />
              ) : (
                <div className={styles.empty}>No data yet</div>
              )}
            </div>

            {/* Top queries */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Top Queries</h2>
              {stats.topQueries.length > 0 ? (
                <BarChart
                  rows={stats.topQueries}
                  labelKey="query"
                  valueKey="count"
                  color="#8b5cf6"
                />
              ) : (
                <div className={styles.empty}>No data yet</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
