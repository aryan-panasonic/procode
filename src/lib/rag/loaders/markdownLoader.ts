import fg from "fast-glob";
import fs from "fs/promises";
import matter from "gray-matter";

import { Document } from "../types/Document";

export async function loadDocuments(): Promise<Document[]> {
  const files = await fg("src/content/**/docs/**/*.md");
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