import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import styles from "./solutions.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return {
    title: isJa
      ? "店舗運営ソリューション – プラノグラム・欠品・価格検証｜パナソニックコネクト"
      : "Retail Shelf Solutions – Planogram, OOS & Price Verification | Panasonic Connect",
    description: isJa
      ? "プラノグラムコンプライアンス、欠品検知、OCR価格検証。小売業・FMCGブランド向けAI棚割ソリューション。"
      : "Planogram compliance, out-of-stock detection, and OCR price verification. AI shelf solutions for retail and FMCG brands.",
  };
}

const usecaseIcons = ["📐", "📦", "💲"];

export default async function SolutionsPage() {
  const t = await getTranslations("solutions");
  const audiences = t.raw("audiences") as {
    slug: string; icon: string; title: string; headline: string; desc: string;
    stats: {v: string; l: string}[]; features: string[];
  }[];

  const usecases = [
    {
      id: "planogram-compliance",
      icon: usecaseIcons[0],
      title: t("planogramTitle"),
      desc: t("planogramDesc"),
      features: t.raw("planogramFeatures") as string[],
      stat: t("planogramStat"),
    },
    {
      id: "oos-detection",
      icon: usecaseIcons[1],
      title: t("oosTitle"),
      desc: t("oosDesc"),
      features: t.raw("oosFeatures") as string[],
      stat: t("oosStat"),
    },
    {
      id: "price-verification",
      icon: usecaseIcons[2],
      title: t("priceTitle"),
      desc: t("priceDesc"),
      features: t.raw("priceFeatures") as string[],
      stat: t("priceStat"),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">{t("label")}</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>
            {t("heroTitle")}<span className="gradientText">{t("heroTitleAccent")}</span>
          </h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            {t("heroSub")}
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.usecasesHead}>
          <span className="sectionLabel">{t("usecasesLabel")}</span>
          <h2 className="sectionTitle" style={{fontSize:"1.6rem",marginTop:".5rem"}}>{t("usecasesTitle")}</h2>
          <p className="sectionSubtitle" style={{textAlign:"center",margin:".75rem auto 0"}}>{t("usecasesSub")}</p>
        </div>

        <div className={styles.usecaseGrid}>
          {usecases.map((uc) => (
            <div key={uc.id} id={uc.id} className={styles.usecaseCard}>
              <div className={styles.usecaseIcon}>{uc.icon}</div>
              <h3 className={styles.usecaseTitle}>{uc.title}</h3>
              <p className={styles.usecaseDesc}>{uc.desc}</p>
              <ul className={styles.usecaseFeatures}>
                {uc.features.map((f) => (
                  <li key={f} className={styles.usecaseFeatureItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className={styles.usecaseStat}>{uc.stat}</div>
            </div>
          ))}
        </div>

        <div className={styles.audienceHead}>
          <span className="sectionLabel">{t("audienceLabel")}</span>
        </div>

        <div className={styles.solutionsList}>
          {audiences.map((s, i) => (
            <div key={s.slug} id={s.slug} className={`${styles.solutionRow} ${i % 2 === 1 ? styles.solutionRowReverse : ""}`}>
              <div className={styles.solutionText}>
                <div className={styles.solutionTag}>
                  <span className={styles.solutionIcon}>{s.icon}</span>
                  <span className={styles.solutionLabel}>{s.title}</span>
                </div>
                <h2 className={styles.solutionTitle}>{s.headline}</h2>
                <p className={styles.solutionDesc}>{s.desc}</p>
                <div className={styles.statsRow}>
                  {s.stats.map(st => (
                    <div key={st.l} className={styles.stat}>
                      <div className={styles.statVal}>{st.v}</div>
                      <div className={styles.statLbl}>{st.l}</div>
                    </div>
                  ))}
                </div>
                <Link href="/contact" className="btnPrimary" style={{marginTop:"1rem",display:"inline-flex"}}>
                  {t("ctaBtn")}
                </Link>
              </div>
              <div className={styles.featuresCard}>
                <div className={styles.featuresTitle}>{t("featureCard")}</div>
                <ul className={styles.featuresList}>
                  {s.features.map(f => (
                    <li key={f} className={styles.featuresItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
