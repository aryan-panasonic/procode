"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./documentation.module.css";
import ImportMarkdownModal from "@/components/admin/documentation/ImportMarkdownModal";

type DocVersion = { id: string; version_name: string; status: string; published_at: string };
type DocPage = { id: string; title: string; slug: string; visibility: string; content_md: string; sort_order: number };
type Revision = { id: string; content_md: string; change_note: string; created_at: string };

export default function DocumentationAdmin() {
  const [versions, setVersions] = useState<DocVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>("");
  const [pages, setPages] = useState<DocPage[]>([]);
  const [activePage, setActivePage] = useState<DocPage | null>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);

  // RAG State
  const [indexedPageIds, setIndexedPageIds] = useState<Set<string>>(new Set());
  const [ragActionLoading, setRagActionLoading] = useState(false);

  // Modals state
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [copyFromId, setCopyFromId] = useState("");
  const [pageForm, setPageForm] = useState({ title: "", slug: "", visibility: "public" });
  
  // DND state
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

  useEffect(() => { loadVersions(); loadRagStatus(); }, []);
  useEffect(() => { if (activeVersionId) loadPages(activeVersionId); else setPages([]); }, [activeVersionId]);
  useEffect(() => { if (activePage && showRevisions) loadRevisions(activePage.id); }, [activePage, showRevisions]);

  const loadRagStatus = async () => {
    const r = await fetch("/api/admin/documents/rag/status");
    if (r.ok) {
      const d = await r.json();
      setIndexedPageIds(new Set(d.indexedPageIds || []));
    }
  };

  const loadVersions = async () => {
    const r = await fetch("/api/admin/documentation/versions");
    const d = await r.json();
    setVersions(d.versions || []);
    if (d.versions?.length && !activeVersionId) setActiveVersionId(d.versions[0].id);
  };

  const loadPages = async (vId: string) => {
    const r = await fetch(`/api/admin/documentation/pages?versionId=${vId}`);
    const d = await r.json();
    setPages(d.pages || []);
    setActivePage(null);
    setIsEditMode(false);
    setShowRevisions(false);
  };

  const loadRevisions = async (pId: string) => {
    const r = await fetch(`/api/admin/documentation/pages/${pId}/revisions`);
    const d = await r.json();
    setRevisions(d.revisions || []);
  };

  const createVersion = async () => {
    const r = await fetch("/api/admin/documentation/versions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionName: newVersionName, copyFromId })
    });
    if (r.ok) {
      setShowVersionModal(false);
      setNewVersionName("");
      setCopyFromId("");
      await loadVersions();
      const d = await r.json();
      setActiveVersionId(d.version.id);
    } else {
      alert((await r.json()).error);
    }
  };

  const deleteVersion = async () => {
    if (!activeVersionId) return;
    if (!confirm("Are you sure you want to delete this version?")) return;
    const r = await fetch(`/api/admin/documentation/versions/${activeVersionId}`, { method: "DELETE" });
    if (r.ok) {
      setActiveVersionId("");
      loadVersions();
    } else {
      let msg = "Failed to delete";
      try { msg = (await r.json()).error || msg; } catch {}
      alert(msg);
    }
  };

  const publishVersion = async () => {
    if (!activeVersionId) return;
    if (!confirm("Publish this version? Currently published version will be archived.")) return;
    const r = await fetch(`/api/admin/documentation/versions/${activeVersionId}/publish`, { method: "POST" });
    if (r.ok) {
      loadVersions();
    } else {
      let msg = "Failed to publish";
      try { msg = (await r.json()).error || msg; } catch {}
      alert(msg);
    }
  };

  const createPage = async () => {
    const r = await fetch("/api/admin/documentation/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionId: activeVersionId, ...pageForm })
    });
    if (r.ok) {
      setShowPageModal(false);
      setPageForm({ title: "", slug: "", visibility: "public" });
      loadPages(activeVersionId);
    } else {
      alert((await r.json()).error);
    }
  };

  const deletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/admin/documentation/pages/${id}`, { method: "DELETE" });
    if (activePage?.id === id) setActivePage(null);
    loadPages(activeVersionId);
  };

  const saveContent = async () => {
    if (!activePage) return;
    const r = await fetch(`/api/admin/documentation/pages/${activePage.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content_md: editContent })
    });
    if (r.ok) {
      const d = await r.json();
      setActivePage(d.page);
      setIsEditMode(false);
      loadPages(activeVersionId);
      if (showRevisions) loadRevisions(activePage.id);
    }
  };

  const restoreRevision = async (revId: string) => {
    if (!activePage) return;
    const r = await fetch(`/api/admin/documentation/pages/${activePage.id}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revisionId: revId })
    });
    if (r.ok) {
      const d = await r.json();
      setActivePage(d.page);
      loadPages(activeVersionId);
      loadRevisions(activePage.id);
    }
  };

  const removeFromRag = async () => {
    if (!activePage || !confirm("Remove this page from the RAG knowledge base?")) return;
    setRagActionLoading(true);
    try {
      const r = await fetch(`/api/admin/documents/rag/page/${activePage.id}`, { method: "DELETE" });
      if (r.ok) await loadRagStatus();
      else alert((await r.json()).error);
    } finally {
      setRagActionLoading(false);
    }
  };

  const reindexRag = async () => {
    if (!activePage) return;
    setRagActionLoading(true);
    try {
      const r = await fetch(`/api/admin/documents/rag/page/${activePage.id}/reindex`, { method: "POST" });
      if (r.ok) await loadRagStatus();
      else alert((await r.json()).error);
    } finally {
      setRagActionLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedPageId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPageId || draggedPageId === targetId) return;

    const sourceIdx = pages.findIndex(p => p.id === draggedPageId);
    const targetIdx = pages.findIndex(p => p.id === targetId);
    
    if (pages[sourceIdx].visibility !== pages[targetIdx].visibility) {
      setDraggedPageId(null);
      return; // Dont mix public/private currently
    }

    const newPages = [...pages];
    const [moved] = newPages.splice(sourceIdx, 1);
    newPages.splice(targetIdx, 0, moved);
    setPages(newPages);
    setDraggedPageId(null);

    const orderedIds = newPages.map(p => p.id);
    await fetch("/api/admin/documentation/pages/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds })
    });
  };

  const activeVer = versions.find(v => v.id === activeVersionId);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <select 
          className={styles.select}
          value={activeVersionId}
          onChange={e => setActiveVersionId(e.target.value)}
        >
          {versions.map(v => (
            <option key={v.id} value={v.id}>
              {v.version_name} ({v.status})
            </option>
          ))}
        </select>
        
        <button className={styles.btn} onClick={() => setShowVersionModal(true)}>Create Version</button>
        {activeVersionId && (
          <button className={styles.btn} onClick={() => setShowImportModal(true)}>Import Markdown Files</button>
        )}
        {activeVer?.status !== 'published' && activeVer?.status !== 'archived' && (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={publishVersion}>Publish Version</button>
        )}
        {activeVer?.status !== 'published' && (
          <button className={`${styles.btn} ${styles.btnDanger}`} onClick={deleteVersion}>Delete Version</button>
        )}
      </div>

      <div className={styles.contentArea}>
        <div className={styles.sidebar}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              Public Pages
              <button className={styles.iconBtn} onClick={() => { setPageForm(p => ({...p, visibility: 'public'})); setShowPageModal(true); }}>+</button>
            </div>
            <div className={styles.pageList}>
              {pages.filter(p => p.visibility === 'public').map(p => (
                <div 
                  key={p.id} 
                  className={`${styles.pageItem} ${activePage?.id === p.id ? styles.pageItemActive : ''}`}
                  onClick={() => { setActivePage(p); setIsEditMode(false); }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, p.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, p.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.title}
                    <span style={{ fontSize: 10 }} title={indexedPageIds.has(p.id) ? "Indexed in RAG" : "Not Indexed"}>
                      {indexedPageIds.has(p.id) ? "🟢" : "⚫"}
                    </span>
                  </div>
                  <div className={styles.pageActions}>
                    <button className={styles.iconBtn} onClick={(e) => deletePage(p.id, e)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              Private Pages
              <button className={styles.iconBtn} onClick={() => { setPageForm(p => ({...p, visibility: 'private'})); setShowPageModal(true); }}>+</button>
            </div>
            <div className={styles.pageList}>
              {pages.filter(p => p.visibility === 'private').map(p => (
                <div 
                  key={p.id} 
                  className={`${styles.pageItem} ${activePage?.id === p.id ? styles.pageItemActive : ''}`}
                  onClick={() => { setActivePage(p); setIsEditMode(false); }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, p.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, p.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {p.title}
                    <span style={{ fontSize: 10 }} title={indexedPageIds.has(p.id) ? "Indexed in RAG" : "Not Indexed"}>
                      {indexedPageIds.has(p.id) ? "🟢" : "⚫"}
                    </span>
                  </div>
                  <div className={styles.pageActions}>
                    <button className={styles.iconBtn} onClick={(e) => deletePage(p.id, e)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {activePage ? (
          <div className={styles.editorArea}>
            <div className={styles.editorHeader}>
              <div className={styles.editorTitle}>{activePage.title}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {indexedPageIds.has(activePage.id) ? (
                  <>
                    <button className={styles.btn} onClick={reindexRag} disabled={ragActionLoading}>Reindex</button>
                    <button className={`${styles.btn} ${styles.btnDanger}`} onClick={removeFromRag} disabled={ragActionLoading}>Remove From RAG</button>
                  </>
                ) : null}
                <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                <button className={styles.btn} onClick={() => setShowRevisions(!showRevisions)}>
                  {showRevisions ? 'Hide Revisions' : 'Revision History'}
                </button>
                {isEditMode ? (
                  <>
                    <button className={styles.btn} onClick={() => setIsEditMode(false)}>Cancel</button>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveContent}>Save</button>
                  </>
                ) : (
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => { setEditContent(activePage.content_md); setIsEditMode(true); }}>Edit</button>
                )}
              </div>
            </div>
            <div className={styles.editorBody}>
              {isEditMode ? (
                <textarea 
                  className={styles.markdownInput}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder="Write markdown here..."
                />
              ) : (
                <div className={styles.previewArea}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {activePage.content_md || "*Empty page*"}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Select a page to view or edit
          </div>
        )}

        {showRevisions && activePage && (
          <div className={styles.revisionsPanel}>
            <div className={styles.revHeader}>Revision History</div>
            <div className={styles.revList}>
              {revisions.map(rev => (
                <div key={rev.id} className={styles.revItem}>
                  <div className={styles.revDate}>{new Date(rev.created_at).toLocaleString()}</div>
                  <div className={styles.revNote}>{rev.change_note || 'Update'}</div>
                  <button className={styles.revRestore} onClick={() => restoreRevision(rev.id)}>Restore this version</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showVersionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalTitle}>Create Version</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Version Name</label>
              <input className={styles.input} value={newVersionName} onChange={e => setNewVersionName(e.target.value)} placeholder="e.g. v2.1" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Copy From (Optional)</label>
              <select className={styles.input} value={copyFromId} onChange={e => setCopyFromId(e.target.value)}>
                <option value="">-- Blank Version --</option>
                {versions.map(v => <option key={v.id} value={v.id}>{v.version_name}</option>)}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setShowVersionModal(false)}>Cancel</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={createVersion}>Create</button>
            </div>
          </div>
        </div>
      )}

      {showPageModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalTitle}>Create Page</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title</label>
              <input className={styles.input} value={pageForm.title} onChange={e => setPageForm({...pageForm, title: e.target.value})} placeholder="Page Title" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Slug</label>
              <input className={styles.input} value={pageForm.slug} onChange={e => setPageForm({...pageForm, slug: e.target.value})} placeholder="url-slug" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Visibility</label>
              <select className={styles.input} value={pageForm.visibility} onChange={e => setPageForm({...pageForm, visibility: e.target.value})}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btn} onClick={() => setShowPageModal(false)}>Cancel</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={createPage}>Create</button>
            </div>
          </div>
        </div>
      )}
      {showImportModal && activeVer && (
        <ImportMarkdownModal
          versionId={activeVersionId}
          versionName={activeVer.version_name}
          existingPages={pages}
          onClose={() => setShowImportModal(false)}
          onImported={() => { loadPages(activeVersionId); loadRagStatus(); }}
        />
      )}
    </div>
  );
}
