"use client";

import { useRef, useState } from "react";
import styles from "./ImportMarkdownModal.module.css";

type DocPage = { id: string; title: string; slug: string; visibility: string };

type DuplicateAction = "skip" | "replace" | "rename";

type ImportRow = {
  fileName: string;
  title: string;
  slug: string;
  visibility: "public" | "private";
  content: string;
  include: boolean;
  expanded: boolean;
  isDuplicate: boolean;
  duplicateAction: DuplicateAction;
};

type Props = {
  versionId: string;
  versionName: string;
  existingPages: DocPage[];
  onClose: () => void;
  onImported: () => void;
};

function titleFromFileName(fileName: string): string {
  const base = fileName.replace(/\.md$/i, "");
  return base
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ImportMarkdownModal({ versionId, versionName, existingPages, onClose, onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [step, setStep] = useState<"select" | "preview">("select");
  const [defaultVisibility, setDefaultVisibility] = useState<"public" | "private">("public");
  const [autoIndex, setAutoIndex] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [skipped, setSkipped] = useState<{ fileName: string; reason: string }[]>([]);

  const existingSlugs = new Set(existingPages.map(p => p.slug));

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith(".md"));

    const newRows: ImportRow[] = await Promise.all(
      files.map(async file => {
        const content = await file.text();
        const title = titleFromFileName(file.name);
        const slug = slugify(title);
        const isDuplicate = existingSlugs.has(slug);
        return {
          fileName: file.name,
          title,
          slug,
          visibility: defaultVisibility,
          content,
          include: true,
          expanded: false,
          isDuplicate,
          duplicateAction: "rename" as DuplicateAction,
        };
      })
    );

    setRows(newRows);
    setStep("preview");
  };

  const updateRow = (index: number, patch: Partial<ImportRow>) => {
    setRows(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const applyDefaultVisibilityToAll = () => {
    setRows(prev => prev.map(r => ({ ...r, visibility: defaultVisibility })));
  };

  const includedCount = rows.filter(r => r.include).length;

  const handleImport = async () => {
    setError("");
    setSkipped([]);
    const pages = rows
      .filter(r => r.include)
      .map(r => ({
        fileName: r.fileName,
        title: r.title,
        slug: r.slug,
        visibility: r.visibility,
        content: r.content,
        duplicateAction: r.isDuplicate ? r.duplicateAction : undefined,
      }));

    if (pages.length === 0) {
      setError("Select at least one file to import");
      return;
    }

    setImporting(true);
    try {
      const r = await fetch("/api/admin/documentation/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId, pages, autoIndex }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Import failed");
        return;
      }
      if (d.skipped && d.skipped.length > 0) {
        setSkipped(d.skipped);
      }
      onImported();
      if (!d.skipped || d.skipped.length === 0) onClose();
    } catch (e: any) {
      setError(e.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.title}>Import Markdown Files</div>
        <div className={styles.subtitle}>Selected Version: {versionName}</div>

        {step === "select" && (
          <div
            className={styles.dropZone}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
          >
            Click or drop .md files here to select
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              multiple
              style={{ display: "none" }}
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
        )}

        {step === "preview" && (
          <>
            <div className={styles.toolbar}>
              <span className={styles.toolbarLabel}>Default Visibility</span>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    checked={defaultVisibility === "public"}
                    onChange={() => setDefaultVisibility("public")}
                  />{" "}
                  Public
                </label>
                <label>
                  <input
                    type="radio"
                    checked={defaultVisibility === "private"}
                    onChange={() => setDefaultVisibility("private")}
                  />{" "}
                  Private
                </label>
              </div>
              <button className={styles.applyBtn} onClick={applyDefaultVisibilityToAll}>
                Apply to all
              </button>
            </div>

            <div className={styles.list}>
              {rows.map((row, i) => (
                <div className={styles.row} key={row.fileName}>
                  <div className={styles.rowHeader} onClick={() => updateRow(i, { expanded: !row.expanded })}>
                    <input
                      type="checkbox"
                      checked={row.include}
                      onChange={e => updateRow(i, { include: e.target.checked })}
                      onClick={e => e.stopPropagation()}
                    />
                    <span className={styles.rowFileName}>{row.fileName}</span>
                    <span className={styles.rowVisibility}>{row.visibility}</span>
                    {row.isDuplicate && <span className={styles.rowWarning}>⚠ duplicate slug</span>}
                  </div>

                  {row.expanded && (
                    <div className={styles.rowBody}>
                      <div className={styles.fieldGroup}>
                        <div>
                          <label className={styles.label}>Title</label>
                          <input
                            className={styles.input}
                            value={row.title}
                            onChange={e => updateRow(i, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className={styles.label}>Slug</label>
                          <input
                            className={styles.input}
                            value={row.slug}
                            onChange={e => updateRow(i, { slug: slugify(e.target.value), isDuplicate: existingSlugs.has(slugify(e.target.value)) })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={styles.label}>Visibility</label>
                        <select
                          className={styles.input}
                          value={row.visibility}
                          onChange={e => updateRow(i, { visibility: e.target.value as "public" | "private" })}
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </div>

                      {row.isDuplicate && (
                        <div className={styles.duplicateNotice}>
                          A page with slug &quot;{row.slug}&quot; already exists in this version.
                          <div className={styles.radioGroup}>
                            <label>
                              <input
                                type="radio"
                                checked={row.duplicateAction === "skip"}
                                onChange={() => updateRow(i, { duplicateAction: "skip" })}
                              />{" "}
                              Skip
                            </label>
                            <label>
                              <input
                                type="radio"
                                checked={row.duplicateAction === "replace"}
                                onChange={() => updateRow(i, { duplicateAction: "replace" })}
                              />{" "}
                              Replace
                            </label>
                            <label>
                              <input
                                type="radio"
                                checked={row.duplicateAction === "rename"}
                                onChange={() => updateRow(i, { duplicateAction: "rename" })}
                              />{" "}
                              Rename Automatically
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <label className={styles.indexToggle}>
                <input type="checkbox" checked={autoIndex} onChange={e => setAutoIndex(e.target.checked)} />
                Index imported pages into RAG
              </label>
              <div className={styles.actions}>
                <button className={styles.applyBtn} onClick={onClose} style={{ color: "#9ca3af" }}>
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing || includedCount === 0}
                  style={{
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "8px 16px",
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: importing ? "default" : "pointer",
                    opacity: importing || includedCount === 0 ? 0.6 : 1,
                  }}
                >
                  {importing ? "Importing…" : `Import ${includedCount} Page${includedCount === 1 ? "" : "s"}`}
                </button>
              </div>
            </div>

            {error && <div className={styles.errorText}>{error}</div>}
            {skipped.length > 0 && (
              <div className={styles.skippedList}>
                {skipped.map((s, i) => (
                  <div key={i}>{s.fileName}: {s.reason}</div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
