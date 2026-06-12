import {getTranslations} from "next-intl/server";

export default async function Security() {
  const t = await getTranslations("security");
  const items = t.raw("items") as {title: string; desc: string}[];

  return (
    <section className="section" style={{background: "var(--ink-900)", borderTop: "1px solid var(--border)"}}>
      <div className="container">
        <div style={{textAlign: "center", marginBottom: "3rem"}}>
          <span style={{fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cyan)"}}>{t("label")}</span>
          <h2 className="sectionTitle">{t("title")}</h2>
          <p className="sectionSubtitle" style={{margin: "0 auto"}}>{t("sub")}</p>
        </div>
        <div className="grid3">
          {items.map((sec, i) => (
            <div key={i} className="card" style={{padding: "1.5rem"}}>
              <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <h4 style={{color: "var(--slate-200)", fontSize: "1.05rem"}}>{sec.title}</h4>
              </div>
              <p style={{color: "var(--slate-400)", fontSize: "0.9rem", lineHeight: "1.5"}}>{sec.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
