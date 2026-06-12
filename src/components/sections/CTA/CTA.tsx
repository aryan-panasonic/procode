import Link from "next/link";
import styles from "./CTA.module.css";
import {getTranslations} from "next-intl/server";

export default async function CTA() {
  const t = await getTranslations("cta");
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.box}>
          <div className={styles.glow} />
          <div className={styles.inner}>
            <span className="sectionLabel" style={{marginBottom: "1.25rem"}}>{t("label")}</span>
            <h2 className={styles.title}>
              {t("title")}<br />
              <span className="gradientText">{t("titleAccent")}</span>
            </h2>
            <p className={styles.sub}>{t("sub")}</p>
            <div className={styles.actions}>
              <Link href="/contact" className="btnPrimary" style={{fontSize: "1rem", padding: "14px 30px"}}>
                {t("btn1")}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/brochure" className="btnOutline" style={{fontSize: "1rem", padding: "13px 30px"}}>{t("btn2")}</Link>
            </div>
            <div className={styles.checks}>
              {[t("check1"), t("check2"), t("check3")].map(c => <span key={c} className={styles.check}>{c}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
