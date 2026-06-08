import React from "react";

export default function Problem() {
  const problems = [
    {
      title: "Manual Audits",
      desc: "Store visits consume significant time and labor, taking staff away from customer-facing activities."
    },
    {
      title: "Inconsistent Reporting",
      desc: "Different teams and regions collect different data, leading to fragmented and unreliable compliance metrics."
    },
    {
      title: "Limited Visibility",
      desc: "Headquarters lacks real-time insights into shelf conditions, causing delayed responses to out-of-stocks."
    }
  ];

  return (
    <section className="section" style={{ background: "var(--ink-950)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 className="sectionTitle">Current Retail Challenges</h2>
        </div>

        <div className="grid3">
          {problems.map((p, i) => (
            <div key={i} className="card" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.25rem", color: "var(--red)", marginBottom: "1rem" }}>{p.title}</h3>
              <p style={{ color: "var(--slate-400)", lineHeight: "1.6" }}>{p.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "4rem" }}>
          <p style={{ fontSize: "1.2rem", fontWeight: 500, color: "var(--cyan)" }}>
            Our platform solves these challenges through AI-powered shelf recognition.
          </p>
        </div>
      </div>
    </section>
  );
}
