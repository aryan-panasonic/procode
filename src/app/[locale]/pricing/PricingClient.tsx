"use client";
import React, { useState, Fragment } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import styles from "./pricing.module.css";

type V = boolean | string | null;

function Cell({v}: {v: V}) {
  if (v === true) return <span className={styles.yes}>✓</span>;
  if (v === false) return <span className={styles.no}>—</span>;
  return <span className={styles.str}>{v as string}</span>;
}

export default function PricingClient() {
  const t = useTranslations("pricing");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = t.raw("plans") as {
    id: string; name: string; nameEn: string; desc: string;
    priceNote: string; highlight: boolean; badge: string | null;
  }[];
  const matrix = t.raw("matrix") as {
    category: string;
    rows: { label: string; vals: V[] }[];
  }[];
  const faqs = t.raw("faqs") as { q: string; a: string }[];

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container" style={{textAlign: "center"}}>
          <span className="sectionLabel">{t("label")}</span>
          <h1 className="sectionTitle" style={{marginTop: ".75rem"}}>
            {t("title")}<span className="gradientText">{t("titleAccent")}</span>
          </h1>
          <p className="sectionSubtitle" style={{margin: "1rem auto 0"}}>
            {t("sub")}
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom: "5rem"}}>
        <div className={styles.planCards}>
          {plans.map(p => (
            <div key={p.id} className={`${styles.planCard}${p.highlight ? " " + styles.planHighlight : ""}`}>
              {p.badge && <div className={styles.planBadge}>{p.badge}</div>}
              <div className={styles.planName}>{p.name}</div>
              <div className={styles.planNameEn}>{p.nameEn}</div>
              <p className={styles.planDesc}>{p.desc}</p>
              <div className={styles.planPrice}>{p.priceNote}</div>
              <Link
                href="/contact"
                className={p.highlight ? "btnPrimary" : "btnOutline"}
                style={{width: "100%", justifyContent: "center", marginTop: "auto"}}
              >
                {t("contactBtn")}
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.matrixWrap}>
          <h2 className={styles.matrixTitle}>{t("matrixTitle")}</h2>
          <div className={styles.matrixScroll}>
            <table className={styles.matrix}>
              <thead>
                <tr>
                  <th className={styles.thFeature}>{t("matrixFeature")}</th>
                  {plans.map(p => (
                    <th key={p.id} className={`${styles.thPlan}${p.highlight ? " " + styles.thHighlight : ""}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map(cat => (
                  <Fragment key={cat.category}>
                    <tr className={styles.catRow}>
                      <td colSpan={4} className={styles.catLabel}>{cat.category}</td>
                    </tr>
                    {cat.rows.map(row => (
                      <tr key={row.label} className={styles.dataRow}>
                        <td className={styles.featureLabel}>{row.label}</td>
                        {row.vals.map((v, i) => (
                          <td key={i} className={`${styles.cell}${plans[i]?.highlight ? " " + styles.cellHighlight : ""}`}>
                            <Cell v={v} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.faqSection}>
          <h2 className={styles.faqTitle}>{t("faqTitle")}</h2>
          <div className={styles.faqs}>
            {faqs.map((f, i) => (
              <div
                key={i}
                className={styles.faqItem}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                role="button"
                tabIndex={0}
                aria-expanded={openFaq === i}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setOpenFaq(openFaq === i ? null : i); }}
              >
                <div className={styles.faqQ}>
                  <span>{f.q}</span>
                  <span className={styles.faqChevron} aria-hidden="true">{openFaq === i ? "▲" : "▼"}</span>
                </div>
                {openFaq === i && <p className={styles.faqA}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.ctaStrip}>
          <div>
            <h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2>
            <p className={styles.ctaSub}>{t("ctaSub")}</p>
          </div>
          <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
            <Link href="/contact" className="btnPrimary">{t("ctaBtn1")}</Link>
            <Link href="/brochure" className="btnOutline">{t("ctaBtn2")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
