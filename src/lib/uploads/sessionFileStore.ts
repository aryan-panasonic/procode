export interface SessionFile {
  filename: string;
  text: string;
  truncated: boolean;
  addedAt: number;
  imageBase64?: string;
  imageMimeType?: string;
}

const store = new Map<string, SessionFile[]>();
const TTL_MS = 60 * 60 * 1000;

function cleanup() {
  const cutoff = Date.now() - TTL_MS;
  for (const [id, files] of store.entries()) {
    const fresh = files.filter(f => f.addedAt > cutoff);
    if (fresh.length === 0) store.delete(id);
    else store.set(id, fresh);
  }
}

export function addSessionFiles(sessionId: string, files: SessionFile[]) {
  cleanup();
  const existing = store.get(sessionId) ?? [];
  store.set(sessionId, [...existing, ...files].slice(-10));
}

export function getSessionFiles(sessionId: string): SessionFile[] {
  cleanup();
  return store.get(sessionId) ?? [];
}

export function clearSessionFiles(sessionId: string) {
  store.delete(sessionId);
}

export function buildFileContextBlock(files: SessionFile[]): string {
  const textFiles = files.filter(f => !f.imageBase64 && f.text && f.text !== `[Image: ${f.filename}]`);
  if (textFiles.length === 0) return "";
  const parts = textFiles.map((f, i) =>
    [`[UPLOADED FILE ${i + 1}: ${f.filename}${f.truncated ? " (truncated)" : ""}]`, f.text].join("\n")
  );
  return "CUSTOMER-UPLOADED FILE CONTEXT:\n" + parts.join("\n\n---\n\n");
}

export function getSessionImages(sessionId: string): SessionFile[] {
  return getSessionFiles(sessionId).filter(f => !!f.imageBase64);
}