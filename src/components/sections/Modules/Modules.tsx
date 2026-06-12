import styles from "./Modules.module.css";
import Link from "next/link";
import {getTranslations} from "next-intl/server";

const icons = [
  <svg key="0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>,
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18" /><path d="M7 16l4-6 4 4 4-8" /></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 9l3 3-3 3M13 15h3M2 5h20v14H2z" /></svg>,
];

const hrefs = ["/platform/product-recognition", "/platform/mobile-capture", "/platform/planogram-compliance", "/platform/analytics", "/platform/api"];
const chips = ["Core AI", "Data Input", "Automation", "Insights", "Developers"];

export default async function PlatformOverview() {
  const t = await getTranslations("modules");
  const items = t.raw("items") as {title: string; desc: string}[];

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <div className="accentBar" />
          <span className="sectionLabel">{t("label")}</span>
          <h2 className="sectionTitle">{t("title")}</h2>
          <p className="sectionSubtitle" style={{textAlign: "center"}}>{t("sub")}</p>
        </div>
        <div className={styles.grid}>
          {items.map((m, i) => (
            <Link key={i} href={hrefs[i]} className={styles.card}>
              <div className={styles.iconWrap}>{icons[i]}</div>
              <div className={styles.chipRow}><span className={styles.modChip}>{chips[i]}</span></div>
              <h3 className={styles.title}>{m.title}</h3>
              <p className={styles.desc}>{m.desc}</p>
              <span className={styles.arrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
