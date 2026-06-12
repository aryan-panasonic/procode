import styles from "./FAQ.module.css";
import {getTranslations} from "next-intl/server";

export default async function FAQ() {
  const t = await getTranslations("faq");
  const items = t.raw("items") as {q: string; a: string}[];

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.header}>
          <span className="sectionLabel">{t("label")}</span>
          <h2 className="sectionTitle" style={{color: "var(--text-primary)"}}>{t("title")}</h2>
        </div>
        <div className={styles.faqList}>
          {items.map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <h3 className={styles.question}>{faq.q}</h3>
              <p className={styles.answer}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
