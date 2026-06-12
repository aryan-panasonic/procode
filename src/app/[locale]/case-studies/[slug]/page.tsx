import { notFound } from "next/navigation";
import Link from "next/link";
import { getCaseStudy, caseStudies } from "@/data/case-studies";
import styles from "./slug.module.css";

export function generateStaticParams() {
  return caseStudies.map(c => ({slug: c.slug}));
}

export default async function CaseStudyPage({params}: {params: Promise<{slug:string}>}) {
  const {slug} = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <div className={styles.breadcrumb}>
            <Link href="/case-studies">← 導入事例一覧</Link>
          </div>
          <span className="sectionLabel">{cs.industry}</span>
          <h1 className="sectionTitle" style={{marginTop:".5rem"}}>
            {cs.company}
          </h1>
          <p className={styles.headline}>{cs.challenge}</p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.layout}>
          <main className={styles.main}>
            <section className={styles.sec}>
              <h2 className={styles.secTitle}>お客様の課題</h2>
              <ul className={styles.list}>
                {cs.challenges.map((c,i) => (
                  <li key={i} className={styles.listItem}>
                    <span className={styles.bullet}>0{i+1}</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.sec}>
              <h2 className={styles.secTitle}>導入のポイント</h2>
              <p className={styles.solutionText}>{cs.solution}</p>
              <ul className={styles.checkList}>
                {cs.solutionPoints.map((p,i) => (
                  <li key={i}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.sec}>
              <h2 className={styles.secTitle}>導入効果</h2>
              <div className={styles.results}>
                {cs.results.map((r,i) => (
                  <div key={i} className={styles.resultCard}>
                    <div className={styles.resultVal}>{r.value}</div>
                    <div className={styles.resultLabel}>{r.label}</div>
                    <div className={styles.resultDetail}>{r.detail}</div>
                  </div>
                ))}
              </div>
              <blockquote className={styles.quote}>
                <p>{cs.quote}</p>
                <cite>{cs.quoteAuthor}</cite>
              </blockquote>
            </section>

            <section className={styles.sec}>
              <h2 className={styles.secTitle}>システム構成</h2>
              <div className={styles.diagram}>
                <div className={styles.diagNode}>店舗モバイル撮影</div>
                <div className={styles.diagArrow}>→</div>
                <div className={styles.diagNode} style={{borderColor:"var(--cyan)",color:"var(--cyan)"}}>ISA AI エンジン</div>
                <div className={styles.diagArrow}>→</div>
                <div className={styles.diagNode}>分析ダッシュボード</div>
                <div className={styles.diagArrow}>→</div>
                <div className={styles.diagNode}>ERP / 基幹連携</div>
              </div>
              <div className={styles.modules}>
                <span className={styles.modulesLabel}>使用モジュール:</span>
                {cs.modules.map(m => (
                  <span key={m} className={styles.moduleTag}>{m}</span>
                ))}
              </div>
            </section>
          </main>

          <aside className={styles.aside}>
            <div className={styles.asideCard}>
              <div className={styles.asideMetric}>
                <span className={styles.asideVal}>{cs.metric}</span>
                <span className={styles.asideLabel}>{cs.metricLabel}</span>
              </div>
              <div className={styles.asideIndustry}>{cs.industry}</div>
            </div>
            <div className={styles.ctaCard}>
              <h3>この事例に近い課題をお持ちですか？</h3>
              <p>貴社の業態・規模に合わせたご提案をいたします。</p>
              <Link href="/contact" className="btnPrimary" style={{width:"100%",justifyContent:"center",marginTop:"1rem"}}>
                お問い合わせ・デモ依頼
              </Link>
              <Link href="/brochure" className="btnOutline" style={{width:"100%",justifyContent:"center",marginTop:"8px"}}>
                資料ダウンロード
              </Link>
            </div>
            <div className={styles.otherCases}>
              <div className={styles.otherLabel}>他の導入事例</div>
              {caseStudies.filter(c => c.slug !== slug).slice(0,3).map(c => (
                <Link key={c.slug} href={`/case-studies/${c.slug}`} className={styles.otherLink}>
                  <span className={styles.otherMetric}>{c.metric}</span>
                  <span>{c.industry}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
