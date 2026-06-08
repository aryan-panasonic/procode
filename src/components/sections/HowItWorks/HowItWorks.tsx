import React from "react";

export default function HowItWorks() {
  const steps = [
    { title: "Store Photo", desc: "Staff capture images via mobile app or fixed cameras." },
    { title: "AI Analysis", desc: "System processes images using computer vision." },
    { title: "Compliance Detection", desc: "Identifies out-of-stocks and planogram violations." },
    { title: "Analytics Dashboard", desc: "Aggregates data for HQ visibility." },
    { title: "Corrective Action", desc: "Automated alerts trigger staff restock tasks." }
  ];

  return (
    <section className="section" style={{ background: "var(--ink-900)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 className="sectionTitle">How It Works</h2>
          <p className="sectionSubtitle" style={{ margin: "0 auto" }}>An automated, end-to-end process for retail execution.</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginTop: "4rem" }}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ flex: "1 1 150px", textAlign: "center" }}>
                <div style={{ 
                  width: "60px", 
                  height: "60px", 
                  borderRadius: "50%", 
                  background: "var(--cyan-pale)", 
                  color: "var(--cyan)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  margin: "0 auto 1rem",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  border: "1px solid var(--cyan)"
                }}>
                  {i + 1}
                </div>
                <h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem", fontSize: "1rem" }}>{step.title}</h4>
                <p style={{ color: "var(--slate-400)", fontSize: "0.85rem", lineHeight: "1.4" }}>{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div style={{ color: "var(--slate-500)", marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
