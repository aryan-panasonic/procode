import {getTranslations} from "next-intl/server";

export default async function Integrations() {
  const localeText = await getTranslations("platform");
  const integrations = ["ERP", "CRM", "BI Platforms", "Data Warehouses", "REST APIs", "CSV Import/Export"];

  return (
    <section className="section" style={{background: "var(--ink-950)"}}>
      <div className="container">
        <div style={{textAlign: "center", marginBottom: "3rem"}}>
          <h2 className="sectionTitle">Seamless Enterprise Integrations</h2>
          <p className="sectionSubtitle" style={{margin: "0 auto"}}>{localeText("sub")}</p>
        </div>
        <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem"}}>
          {integrations.map(int => (
            <div key={int} style={{padding: "1rem 2rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--slate-300)", fontWeight: 500, fontSize: "1.1rem"}}>{int}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
