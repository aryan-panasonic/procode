import { notFound, redirect } from "next/navigation";
import { pool } from "@/lib/db/postgres";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cookies } from "next/headers";

export const revalidate = 0; // Dynamic, requires auth

export default async function PrivateDocsPage({ params }: { params: Promise<{ version: string, slug: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");

  if (!token?.value) {
    redirect("/admin"); // Redirect to admin login if no token
  }

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
    `SELECT * FROM doc_pages WHERE version_id = $1 AND slug = $2 AND visibility = 'private' AND is_deleted = false`,
    [versionId, slug]
  );

  if (pRows.length === 0) {
    return notFound();
  }

  const page = pRows[0];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#f3f4f6', background: '#0f172a', minHeight: '100vh' }}>
      <div style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '4px', display: 'inline-block', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px', textTransform: 'uppercase' }}>
        Internal Only
      </div>
      <h1 style={{ fontSize: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
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
