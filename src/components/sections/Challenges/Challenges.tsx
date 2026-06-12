import styles from "./Challenges.module.css";
import {getTranslations} from "next-intl/server";

export default async function Challenges() {
  const t = await getTranslations("problem");
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
          {items.map(item => (
            <div key={item.title} className={styles.card}>
              <div className={styles.icon}>⚠️</div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.desc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
