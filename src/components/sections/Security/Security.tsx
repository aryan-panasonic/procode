import React from "react";

export default function Security() {
  const securityFeatures = [
    { title: "Role-based Access Control", desc: "Granular permissions for head office, regional managers, and store staff." },
    { title: "Encrypted Data Transmission", desc: "All data is encrypted in transit and at rest using industry standards." },
    { title: "Audit Logs", desc: "Comprehensive logging of all system actions for compliance and tracking." },
    { title: "Secure Cloud Infrastructure", desc: "Hosted on certified, high-availability enterprise cloud environments." },
    { title: "SSO Support", desc: "Seamless integration with your existing identity providers (SAML/OIDC)." }
  ];

  return (
    <section className="section" style={{ background: "var(--ink-900)", borderTop: "1px solid var(--border)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 className="sectionTitle">Enterprise-Grade Security</h2>
          <p className="sectionSubtitle" style={{ margin: "0 auto" }}>Built from the ground up to protect your operational data.</p>
        </div>

        <div className="grid3">
          {securityFeatures.map((sec, i) => (
            <div key={i} className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <h4 style={{ color: "var(--slate-200)", fontSize: "1.05rem" }}>{sec.title}</h4>
              </div>
              <p style={{ color: "var(--slate-400)", fontSize: "0.9rem", lineHeight: "1.5" }}>{sec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
