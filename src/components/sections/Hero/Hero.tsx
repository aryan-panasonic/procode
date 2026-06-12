import styles from "./Hero.module.css";
import Link from "next/link";
import ShelfViz from "./ShelfViz";
import {getTranslations} from "next-intl/server";

export default async function Hero() {
  const t = await getTranslations("hero");
  return (
    <section className={styles.hero}>
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow} />
      <div className={styles.bgGlow2} />
      <div className="container">
        <div className={styles.inner}>
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span className={styles.eyebrowText}>{t("eyebrow")}</span>
            </div>
            <h1 className={styles.h1}>
              {t("h1a")}<br />
              <span style={{fontSize: "0.7em", fontWeight: 500, color: "var(--slate-400)"}}>{t("h1b")}</span>
            </h1>
            <div className={styles.sub}>
              <p>{t("sub")}</p>
              <ul style={{textAlign: "left", marginTop: "1.25rem", fontSize: "0.9rem", lineHeight: 2, listStyle: "none", padding: 0}}>
                <li>✓ {t("feat1")}</li>
                <li>✓ {t("feat2")}</li>
                <li>✓ {t("feat3")}</li>
                <li>✓ {t("feat4")}</li>
              </ul>
            </div>
            <div className={styles.actions}>
              <Link href="/contact" className="btnPrimary">
                {t("cta1")}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/brochure" className="btnOutline">{t("cta2")}</Link>
            </div>
            <div className={styles.trust}>
              {[t("trust1"), t("trust2"), t("trust3")].map(item => (
                <div key={item} className={styles.trustItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.visual}>
            <div className={styles.dashCard}>
              <div className={styles.dashHeader}>
                <div className={styles.dashDots}><span /><span /><span /></div>
                <span style={{fontSize: "0.7rem", color: "var(--slate-500)", fontFamily: "var(--font-mono)"}}>LIVE · {t("vizLabel")}</span>
              </div>
              <ShelfViz />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.scrollHint}>
        <div className={styles.scrollLine} />
        scroll
      </div>
    </section>
  );
}
