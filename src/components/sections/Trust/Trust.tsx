import styles from "./Trust.module.css";
import {getTranslations} from "next-intl/server";

export default async function Trust() {
  const t = await getTranslations("trust");
  const items = t.raw("items") as string[];
  return (
    <section className={styles.trustStrip} style={{padding: "3rem 0", background: "var(--surface)", borderBottom: "1px solid var(--border)"}}>
      <div className="container">
        <div style={{textAlign: "center", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--slate-500)", marginBottom: "1.5rem"}}>
          {t("label")}
        </div>
        <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", alignItems: "center"}}>
          {items.map(ind => (
            <div key={ind} style={{fontSize: "1.1rem", fontWeight: 600, color: "var(--slate-400)", padding: "0.5rem 1rem", background: "var(--ink-900)", borderRadius: "var(--radius)", border: "1px solid var(--border)"}}>
              {ind}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
