const MAX_CHARS = 20_000;

export interface ExtractionResult {
  text: string;
  filename: string;
  mimeType: string;
  truncated: boolean;
  imageBase64?: string;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  try {
    const mod = await import("pdf-parse");
    const pdfParse = (mod as any).default ?? mod;
    const result = await pdfParse(buffer);
    return result.text;
  } catch {
    throw new Error("PDF extraction failed — ensure pdf-parse is installed");
  }
}

async function extractDocx(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch {
    throw new Error("DOCX extraction failed — ensure mammoth is installed");
  }
}

export async function extractText(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<ExtractionResult> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";

  if (mimeType.startsWith("image/") || ["png","jpg","jpeg","gif","webp"].includes(ext)) {
    return {
      text: `[Image: ${filename}]`,
      filename,
      mimeType,
      truncated: false,
      imageBase64: buffer.toString("base64"),
    };
  }

  let raw = "";

  if (mimeType === "text/plain" || ext === "txt" || ext === "md") {
    raw = buffer.toString("utf-8");
  } else if (mimeType === "application/pdf" || ext === "pdf") {
    raw = await extractPdf(buffer);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    raw = await extractDocx(buffer);
  } else {
    raw = buffer.toString("utf-8");
  }

  const trimmed = raw.trim();
  const truncated = trimmed.length > MAX_CHARS;

  return {
    text: truncated ? trimmed.slice(0, MAX_CHARS) + "\n[...truncated]" : trimmed,
    filename,
    mimeType,
    truncated,
  };
}