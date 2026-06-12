"use client";
import { useState } from "react";
import Link from "next/link";
import { caseStudies } from "@/data/case-studies";
import styles from "./case-studies.module.css";

const CATS = [
  {id:"all",label:"全て"},
  {id:"retail",label:"小売業"},
  {id:"convenience",label:"コンビニ"},
  {id:"drugstore",label:"ドラッグストア"},
  {id:"fmcg",label:"FMCG・流通"},
];

export default function CaseStudiesPage() {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? caseStudies : caseStudies.filter(c => c.category === cat);

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} section`}>
        <div className="container" style={{textAlign:"center"}}>
          <span className="sectionLabel">導入事例 / Case Studies</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>
            お客様の<span className="gradientText">成功事例</span>
          </h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0"}}>
            小売業・FMCG・流通業の各業態でISAがどのように現場の課題を解決し、
            測定可能な成果をもたらしたか。実際の導入効果をご覧ください。
          </p>
        </div>
      </section>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.filters}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`${styles.filterBtn} ${cat===c.id ? styles.filterActive : ""}`}>
              {c.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map(cs => (
            <Link key={cs.slug} href={`/case-studies/${cs.slug}`} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.tag}>{cs.industry}</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricVal}>{cs.metric}</span>
                <span className={styles.metricLabel}>{cs.metricLabel}</span>
              </div>
              <p className={styles.company}>{cs.company}</p>
              <p className={styles.summary}>{cs.summary}</p>
              <div className={styles.modules}>
                {cs.modules.slice(0,2).map(m => (
                  <span key={m} className={styles.moduleTag}>{m}</span>
                ))}
              </div>
              <div className={styles.readMore}>
                詳しく見る
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.cta}>
          <h2 className="sectionTitle" style={{fontSize:"1.5rem"}}>
            類似の課題をお持ちですか？
          </h2>
          <p className="sectionSubtitle" style={{margin:".75rem auto 1.5rem"}}>
            貴社の業態・規模に合わせたご提案をいたします。まずはお気軽にご相談ください。
          </p>
          <Link href="/contact" className="btnPrimary">
            お問い合わせ・デモ依頼
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
