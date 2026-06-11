import { NextRequest } from "next/server";
import { extractText } from "@/lib/uploads/extractText";
import { addSessionFiles } from "@/lib/uploads/sessionFileStore";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILES     = 5;
const ALLOWED_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);
const ALLOWED_EXTS = new Set(["txt", "md", "pdf", "docx", "png", "jpg", "jpeg"]);

function isAllowed(filename: string, mimeType: string): boolean {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_TYPES.has(mimeType) || ALLOWED_EXTS.has(ext);
}

export async function POST(req: NextRequest) {
  try {
    const formData  = await req.formData();
    const sessionId = formData.get("sessionId");

    if (typeof sessionId !== "string" || !sessionId) {
      return Response.json({ error: "sessionId required" }, { status: 400 });
    }

    const fileEntries = formData.getAll("files");
    if (!fileEntries.length) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    const files = fileEntries.filter((e): e is File => e instanceof File);
    if (files.length === 0) {
      return Response.json({ error: "No valid file objects" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return Response.json({ error: `Max ${MAX_FILES} files per upload` }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        results.push({ filename: file.name, error: "File exceeds 5 MB limit" });
        continue;
      }
      if (!isAllowed(file.name, file.type)) {
        results.push({ filename: file.name, error: "File type not supported" });
        continue;
      }

      try {
        const buffer    = Buffer.from(await file.arrayBuffer());
        const extracted = await extractText(buffer, file.name, file.type);

        addSessionFiles(sessionId, [{
          filename:       extracted.filename,
          text:           extracted.text,
          truncated:      extracted.truncated,
          addedAt:        Date.now(),
          imageBase64:    extracted.imageBase64,
          imageMimeType:  extracted.imageBase64 ? extracted.mimeType : undefined,
        }]);

        results.push({
          filename:  extracted.filename,
          truncated: extracted.truncated,
          chars:     extracted.text.length,
        });
      } catch (err: any) {
        results.push({ filename: file.name, error: err.message ?? "Extraction failed" });
      }
    }

    return Response.json({ results });
  } catch (err) {
    console.error("[upload/route]", err);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}