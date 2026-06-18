import { notFound } from "next/navigation";
import { pool } from "@/lib/db/postgres";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 60; // optionally cache for 60 seconds

export default async function PublicDocsPage({ params }: { params: Promise<{ version: string, slug: string }> }) {
  const { version, slug } = await params;

  // We find the version matching the version string (e.g. "v2.1")
  const { rows: vRows } = await pool.query(
    `SELECT id FROM doc_versions WHERE version_name = $1 AND status = 'published'`,
    [version]
  );

  if (vRows.length === 0) {
    return notFound();
  }

  const versionId = vRows[0].id;

  const { rows: pRows } = await pool.query(
    `SELECT * FROM doc_pages WHERE version_id = $1 AND slug = $2 AND visibility = 'public' AND is_deleted = false`,
    [versionId, slug]
  );

  if (pRows.length === 0) {
    return notFound();
  }

  const page = pRows[0];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#1f2937' }}>
      <h1 style={{ fontSize: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '24px' }}>
        {page.title}
      </h1>
      <div style={{ lineHeight: '1.7', fontSize: '16px' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {page.content_md}
        </ReactMarkdown>
      </div>
    </div>
  );
}
