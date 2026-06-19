import type { ReactNode } from "react";

export const metadata = {
  title: "Admin — INTELLIGENT SHELF ANALYZER",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth">
      <body style={{
        margin: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#0a0e17",
        color: "#f3f4f6",
        minHeight: "100vh",
      }}>
        {/* ── Top nav ── */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "12px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "#111827",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.12em",
                         textTransform: "uppercase", color: "#3b82f6" }}>
            ISA Admin
          </span>
          <a href="/admin/analytics" style={navLinkStyle}>
            Analytics
          </a>

          <a href="/admin/tickets" style={navLinkStyle}>
            Tickets
          </a>

          <a href="/admin/documents" style={navLinkStyle}>
            Documents
          </a>

          <a href="/admin/documentation" style={navLinkStyle}>
            Documentation
          </a>

          <a href="/admin/logout" style={navLinkStyle}>
            Logout
          </a>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>
            Internal use only
          </span>
        </nav>

        <main style={{ padding: "32px max(32px, 4vw)", maxWidth: 1600, margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#d1d5db",
  textDecoration: "none",
  padding: "4px 8px",
  borderRadius: 4,
};
