import Link from "next/link";
import {caseStudies} from "@/data/case-studies";
import styles from "./CaseStudiesPreview.module.css";
import {getTranslations} from "next-intl/server";

export default async function CaseStudiesPreview() {
  const t = await getTranslations("caseStudiesPreview");
  const preview = caseStudies.slice(0, 3);
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className="sectionLabel">{t("label")}</span>
            <h2 className="sectionTitle" style={{marginTop: ".5rem"}}>
              {t("title")}<span className="gradientText">{t("titleAccent")}</span>
            </h2>
          </div>
          <Link href="/case-studies" className="btnOutline">{t("link")}</Link>
        </div>
        <div className={styles.grid}>
          {preview.map(cs => (
            <Link key={cs.slug} href={`/case-studies/${cs.slug}`} className={styles.card}>
              <span className={styles.tag}>{cs.industry}</span>
              <div className={styles.metric}>
                <span className={styles.val}>{cs.metric}</span>
                <span className={styles.lbl}>{cs.metricLabel}</span>
              </div>
              <p className={styles.summary}>{cs.summary}</p>
              <span className={styles.arrow}>詳しく見る →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
