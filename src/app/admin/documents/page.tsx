"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./documents.module.css";

type DocVersion = { id: string; version_name: string; status: string; published_at: string };
type DocPage = { id: string; title: string; slug: string; visibility: string };

interface DocRow {
  id:                string;
  title:             string | null;
  source_path:       string;
  original_filename: string | null;
  language:          string | null;
  status:            string | null;
  chunk_count:       number;
  file_size_bytes:   number | null;
  uploaded_at:       string | null;
  visibility:        string;
}

function fmtBytes(n: number | null): string {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

// ─── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "indexed";
  const map: Record<string, { label: string; color: string; bg: string }> = {
    indexed:  { label: "Indexed",   color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    indexing: { label: "Indexing…", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
    error:    { label: "Error",     color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  };
  const style = map[s] ?? map["indexed"];
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
      color: style.color, background: style.bg,
    }}>
      {style.label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DocumentsPage() {
  const [docs,       setDocs]       = useState<DocRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadMsg,  setUploadMsg]  = useState<{ ok: boolean; text: string } | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMsg, setReindexMsg] = useState<string | null>(null);
  const [uploadVisibility, setUploadVisibility] = useState("private");
  const fileRef = useRef<HTMLInputElement>(null);

  // RAG Modal State
  const [showRagModal, setShowRagModal] = useState(false);
  const [ragVersions, setRagVersions] = useState<DocVersion[]>([]);
  const [ragSelectedVersion, setRagSelectedVersion] = useState<string>("");
  const [ragIncludePublic, setRagIncludePublic] = useState(true);
  const [ragIncludePrivate, setRagIncludePrivate] = useState(false);
  const [ragPages, setRagPages] = useState<DocPage[]>([]);
  const [ragSelectedPages, setRagSelectedPages] = useState<Set<string>>(new Set());
  const [ragIndexing, setRagIndexing] = useState(false);

  useEffect(() => {
    if (showRagModal && ragVersions.length === 0) {
      fetch("/api/admin/documentation/versions")
        .then(r => r.json())
        .then(d => {
          setRagVersions(d.versions || []);
          if (d.versions?.length) setRagSelectedVersion(d.versions[0].id);
        });
    }
  }, [showRagModal]);

  useEffect(() => {
    if (ragSelectedVersion) {
      fetch(`/api/admin/documentation/pages?versionId=${ragSelectedVersion}`)
        .then(r => r.json())
        .then(d => {
          setRagPages(d.pages || []);
          setRagSelectedPages(new Set((d.pages || []).map((p: DocPage) => p.id)));
        });
    }
  }, [ragSelectedVersion]);

  const toggleRagPage = (id: string) => {
    const next = new Set(ragSelectedPages);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRagSelectedPages(next);
  };

  const handleRagIndex = async () => {
    const pageIdsToMap = ragPages
      .filter(p => ragSelectedPages.has(p.id))
      .filter(p => (p.visibility === 'public' && ragIncludePublic) || (p.visibility === 'private' && ragIncludePrivate))
      .map(p => p.id);

    if (pageIdsToMap.length === 0) {
      alert("No pages selected to index.");
      return;
    }

    setRagIndexing(true);
    try {
      const r = await fetch("/api/admin/documents/rag/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: ragSelectedVersion, pageIds: pageIdsToMap })
      });
      const d = await r.json();
      if (r.ok) {
        alert("Documentation indexed successfully.");
        setShowRagModal(false);
      } else {
        alert(d.error);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setRagIndexing(false);
    }
  };

  // ── Load document list ─────────────────────────────────────────────────────
  async function loadDocs() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/documents");
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setDocs(d.documents);
    } catch (e: any) {
      setError(e.message ?? "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDocs(); }, []);

  // ── Upload ─────────────────────────────────────────────────────────────────
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMsg(null);

    const form = new FormData();
    form.append("file", file);
    form.append("visibility", uploadVisibility);

    try {
      const r = await fetch("/api/admin/documents/upload", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error ?? `HTTP ${r.status}`);

      setUploadMsg({
        ok:   true,
        text: `✓ "${d.title}" uploaded — ${d.chunkCount} chunks indexed.`,
      });
      loadDocs();
    } catch (e: any) {
      setUploadMsg({ ok: false, text: `✗ ${e.message}` });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?\nThis will permanently remove the document and all its chunks.`)) return;

    try {
      const r = await fetch(`/api/admin/documents?id=${id}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error ?? `HTTP ${r.status}`);
      setDocs(prev => prev.filter(doc => doc.id !== id));
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  // ── Toggle Visibility ──────────────────────────────────────────────────────
  async function handleToggleVisibility(id: string, current: string) {
    const next = current === "public" ? "private" : "public";
    try {
      const r = await fetch("/api/admin/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visibility: next }),
      });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error ?? `HTTP ${r.status}`);
      setDocs(prev => prev.map(doc => doc.id === id ? { ...doc, visibility: next } : doc));
    } catch (e: any) {
      alert(`Visibility update failed: ${e.message}`);
    }
  }

  // ── Reindex ────────────────────────────────────────────────────────────────
  async function handleReindex() {
    if (!confirm("Rebuild the full index from src/content/**/docs/**/*.md?\nThis may take 30–120 seconds.")) return;

    setReindexing(true);
    setReindexMsg(null);

    try {
      const r = await fetch("/api/admin/reindex", { method: "POST" });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error ?? `HTTP ${r.status}`);
      setReindexMsg("✓ Index rebuilt successfully.");
      loadDocs();
    } catch (e: any) {
      setReindexMsg(`✗ ${e.message}`);
    } finally {
      setReindexing(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Documents</h1>
          <p className={styles.pageSubtitle}>Manage the knowledge base used for retrieval</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => setShowRagModal(true)}
          >
            Index To RAG
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleReindex}
            disabled={reindexing}
          >
            {reindexing ? "Rebuilding…" : "Rebuild Index"}
          </button>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept=".md,.txt,.pdf,.docx"
            style={{ display: "none" }}
            onChange={handleUpload}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', padding: '2px 2px 2px 12px', borderRadius: 6 }}>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Upload as:</span>
            <select
              value={uploadVisibility}
              onChange={e => setUploadVisibility(e.target.value)}
              style={{ background: 'transparent', color: '#fff', border: 'none', outline: 'none', fontSize: 13, cursor: 'pointer' }}
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ marginLeft: 4 }}
            >
              {uploading ? "Uploading…" : "+ Upload Document"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Upload / reindex feedback ── */}
      {uploadMsg && (
        <div className={`${styles.alert} ${uploadMsg.ok ? styles.alertOk : styles.alertErr}`}>
          {uploadMsg.text}
          <button className={styles.alertClose} onClick={() => setUploadMsg(null)}>×</button>
        </div>
      )}
      {reindexMsg && (
        <div className={`${styles.alert} ${reindexMsg.startsWith("✓") ? styles.alertOk : styles.alertErr}`}>
          {reindexMsg}
          <button className={styles.alertClose} onClick={() => setReindexMsg(null)}>×</button>
        </div>
      )}

      {/* ── Upload hint ── */}
      <div className={styles.uploadHint}>
        Supported formats: <strong>.md</strong>, <strong>.txt</strong>,{" "}
        <strong>.pdf</strong> (requires <code>npm install pdf-parse</code>),{" "}
        <strong>.docx</strong> (requires <code>npm install mammoth</code>)
      </div>

      {/* ── Table ── */}
      {loading && <div className={styles.loading}>Loading…</div>}
      {error   && <div className={styles.error}>⚠ {error}</div>}

      {!loading && !error && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Title</th>
                <th>Chunks</th>
                <th>Size</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    No documents indexed yet. Upload a file or run Rebuild Index.
                  </td>
                </tr>
              ) : (
                docs.map(doc => (
                  <tr key={doc.id}>
                    <td className={styles.filename}>
                      {doc.source_path.startsWith("doc_pages:") ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 'bold', whiteSpace: 'nowrap' }}>Doc Page</span>
                          <span>{doc.original_filename ?? doc.source_path.split(":").pop()}</span>
                        </div>
                      ) : (
                        doc.original_filename ?? doc.source_path.split("/").pop()
                      )}
                    </td>
                    <td className={styles.title}>{doc.title ?? "—"}</td>
                    <td className={styles.num}>{doc.chunk_count}</td>
                    <td className={styles.num}>{fmtBytes(doc.file_size_bytes)}</td>
                    <td><StatusBadge status={doc.status} /></td>
                    <td>
                      <button
                        onClick={() => handleToggleVisibility(doc.id, doc.visibility)}
                        disabled={doc.source_path.startsWith("doc_pages:")}
                        style={{
                          background: doc.visibility === 'public' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: doc.visibility === 'public' ? '#22c55e' : '#ef4444',
                          border: `1px solid ${doc.visibility === 'public' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: doc.source_path.startsWith("doc_pages:") ? 'not-allowed' : 'pointer',
                          textTransform: 'capitalize'
                        }}
                        title={doc.source_path.startsWith("doc_pages:") ? "Managed via Documentation tab" : "Click to toggle visibility"}
                      >
                        {doc.visibility}
                      </button>
                    </td>
                    <td className={styles.date}>{fmtDate(doc.uploaded_at)}</td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(doc.id, doc.title ?? doc.source_path)}
                        title="Delete document"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showRagModal && (
        <div className={styles.modalOverlay} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className={styles.modalContent} style={{ background: '#1e293b', padding: 24, borderRadius: 8, width: 500, maxWidth: '90vw', color: '#fff' }}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Index Documentation to RAG</h2>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#9ca3af', fontSize: 14 }}>Version</label>
              <select 
                value={ragSelectedVersion} 
                onChange={e => setRagSelectedVersion(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6 }}
              >
                {ragVersions.map(v => (
                  <option key={v.id} value={v.id}>{v.version_name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#9ca3af', fontSize: 14 }}>Visibility Filter</label>
              <div style={{ display: 'flex', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={ragIncludePublic} onChange={e => setRagIncludePublic(e.target.checked)} />
                  Public
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={ragIncludePrivate} onChange={e => setRagIncludePrivate(e.target.checked)} />
                  Private
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 24, maxHeight: 300, overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 6 }}>
              <label style={{ display: 'block', marginBottom: 12, color: '#9ca3af', fontSize: 14 }}>Pages</label>
              
              <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#60a5fa' }}>Public Pages</div>
              {ragPages.filter(p => p.visibility === 'public').map(p => (
                <div key={p.id} style={{ marginBottom: 4, opacity: ragIncludePublic ? 1 : 0.5 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: ragIncludePublic ? 'pointer' : 'not-allowed' }}>
                    <input type="checkbox" disabled={!ragIncludePublic} checked={ragIncludePublic && ragSelectedPages.has(p.id)} onChange={() => toggleRagPage(p.id)} />
                    {p.title}
                  </label>
                </div>
              ))}
              {ragPages.filter(p => p.visibility === 'public').length === 0 && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>None</div>}

              <div style={{ fontWeight: 'bold', marginBottom: 8, marginTop: 16, color: '#f87171' }}>Private Pages</div>
              {ragPages.filter(p => p.visibility === 'private').map(p => (
                <div key={p.id} style={{ marginBottom: 4, opacity: ragIncludePrivate ? 1 : 0.5 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: ragIncludePrivate ? 'pointer' : 'not-allowed' }}>
                    <input type="checkbox" disabled={!ragIncludePrivate} checked={ragIncludePrivate && ragSelectedPages.has(p.id)} onChange={() => toggleRagPage(p.id)} />
                    {p.title}
                  </label>
                </div>
              ))}
              {ragPages.filter(p => p.visibility === 'private').length === 0 && <div style={{ fontSize: 12, color: '#6b7280' }}>None</div>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowRagModal(false)} disabled={ragIndexing} style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleRagIndex} disabled={ragIndexing} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
                {ragIndexing ? "Indexing..." : "Index Selected Pages"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
