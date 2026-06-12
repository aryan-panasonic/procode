import styles from "./Solutions.module.css";
import Link from "next/link";
import type {CSSProperties} from "react";
import {getTranslations} from "next-intl/server";

const solutions = [
  {
    tag: "Retailers", href: "/solutions/retailers",
    accent: "var(--cyan)",
    metric: "30%", metricLabel: "Reduced out-of-stock loss",
    title: "Full Shelf Compliance Automation",
    desc: "Real-time camera analysis detects out-of-stocks, misplacements, and price tag errors instantly. Push alerts to field staff and cut lost sales at the shelf.",
    features: ["Live compliance monitoring", "Price tag verification", "Stock threshold alerts"],
  },
  {
    tag: "FMCG Brands", href: "/solutions/fmcg-brands",
    accent: "var(--gold)",
    metric: "18%", metricLabel: "Share of shelf gained",
    title: "Maximize Share of Shelf",
    desc: "AI automatically measures competitor shelf space. Track brand presence, facing compliance, and competitive positioning in real time across all retail partners.",
    features: ["Shelf share measurement", "Brand presence tracking", "Competitive benchmarking"],
  },
  {
    tag: "Merchandising Teams", href: "/solutions/merchandising-teams",
    accent: "var(--green)",
    metric: "75%", metricLabel: "Audit labor eliminated",
    title: "Slash Audit Workload by 75%",
    desc: "Snap a photo, let AI do the rest. Automated shelf analysis and report generation replaces hours of manual work with minutes of review.",
    features: ["Mobile image capture", "Auto planogram diff", "One-click report export"],
  },
  {
    tag: "Distributors", href: "/solutions/distributors",
    accent: "#a78bfa",
    metric: "22%", metricLabel: "Out-of-stock rate reduced",
    title: "Market Intelligence at Territory Scale",
    desc: "Monitor product availability across your entire distribution area from a single dashboard. Early stockout detection optimizes replenishment scheduling.",
    features: ["Territory-wide availability", "Replenishment optimization", "Market intelligence"],
  },
];

export default async function Solutions() {
  const t = await getTranslations("caseStudiesPreview");
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <div className="accentBar" />
          <span className="sectionLabel">Solutions</span>
          <h2 className="sectionTitle">Built for <span className="gradientText">Every Role in Retail</span></h2>
          <p className="sectionSubtitle" style={{textAlign: "center"}}>Purpose-built workflows for retailers, brands, merchandising teams, and distributors.</p>
        </div>
        <div className={styles.grid}>
          {solutions.map(s => (
            <div key={s.tag} className={styles.card} style={{"--acc": s.accent} as CSSProperties}>
              <div className={styles.topLine} style={{background: s.accent}} />
              <div className={styles.topRow}>
                <div>
                  <div className={styles.tagLabel} style={{color: s.accent}}>{s.tag}</div>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricNum} style={{color: s.accent}}>{s.metric}</span>
                  <span className={styles.metricLbl}>{s.metricLabel}</span>
                </div>
              </div>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.desc}</p>
              <ul className={styles.features}>
                {s.features.map(f => (
                  <li key={f} className={styles.feat}>
                    <span className={styles.featDot} style={{background: s.accent}} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={s.href} className={styles.link} style={{color: s.accent}}>{t("link")}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
