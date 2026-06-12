import {getTranslations} from "next-intl/server";

export default async function Problem() {
  const t = await getTranslations("problem");
  const items = t.raw("items") as {title: string; desc: string}[];

  return (
    <section className="section" style={{background: "var(--ink-950)"}}>
      <div className="container">
        <div style={{textAlign: "center", marginBottom: "3rem"}}>
          <span style={{fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--cyan)"}}>{t("label")}</span>
          <h2 className="sectionTitle">{t("title")}</h2>
          <p className="sectionSubtitle" style={{margin: "0 auto"}}>{t("sub")}</p>
        </div>
        <div className="grid3">
          {items.map((p, i) => (
            <div key={i} className="card" style={{padding: "2rem"}}>
              <h3 style={{fontSize: "1.25rem", color: "var(--red)", marginBottom: "1rem"}}>{p.title}</h3>
              <p style={{color: "var(--slate-400)", lineHeight: "1.6"}}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
