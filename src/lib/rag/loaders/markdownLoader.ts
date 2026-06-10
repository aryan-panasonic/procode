import fg from "fast-glob";
import fs from "fs/promises";
import matter from "gray-matter";

import { Document } from "../types/Document";
import path from "path/win32";

export async function loadDocuments(): Promise<Document[]> {
  const pattern = path.join(process.cwd(), "src/content/**/docs/**/*.md");
  const files = await fg(pattern);
  console.log("FILES FOUND:", files);

  const documents: Document[] = [];

  for (const file of files) {
    const raw = await fs.readFile(file, "utf-8");

    const parsed = matter(raw);

    documents.push({
      title: parsed.data.title || "Untitled",
      source: file,
      content: parsed.content
    });
  }

  return documents;
}