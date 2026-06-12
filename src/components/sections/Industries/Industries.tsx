import Link from "next/link";
import styles from "./Industries.module.css";
import {getTranslations} from "next-intl/server";

const icons = ["🛒", "🏪", "💊", "📱", "🏬", "🔨"];

export default async function Industries() {
  const t = await getTranslations("industries");
  const items = t.raw("items") as {title: string; sub: string}[];
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
          {items.map((ind, i) => (
            <Link key={i} href="/industries" className={styles.card}>
              <div className={styles.cardIcon}>{icons[i]}</div>
              <div className={styles.info}>
                <div className={styles.cardTitle}>{ind.title}</div>
                <div className={styles.cardSub}>{ind.sub}</div>
              </div>
              <span className={styles.arrowIcon}>›</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
