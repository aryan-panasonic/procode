import Link from "next/link";
import styles from "./solutions.module.css";

const solutions = [
  {
    slug:"retailers", icon:"🛒", title:"Retailers",
    headline:"Full shelf visibility, enforced at scale",
    desc:"Real-time compliance monitoring across every aisle, every store. AI detects out-of-stocks, misplacements, and pricing errors — before they cost you sales.",
    stats:[{v:"30%",l:"Lost sales recovered"},{v:"94%",l:"Compliance rate achieved"},{v:"0.3s",l:"Per-shelf processing"}],
    features:["Live shelf compliance monitoring","Out-of-stock detection & alerting","Price tag verification via OCR","Planogram deviation auto-reporting","Field staff mobile workflow","Store performance benchmarking"],
  },
  {
    slug:"fmcg-brands", icon:"🏷️", title:"FMCG Brands",
    headline:"Own your shelf space, know your competitors",
    desc:"AI-measured share of shelf across all retail partners. Track brand presence, facing compliance, and competitive positioning with precision data you've never had before.",
    stats:[{v:"18%",l:"Shelf share gain"},{v:"3×",l:"Faster insight delivery"},{v:"100%",l:"Partner coverage"}],
    features:["Real-time share of shelf measurement","Facing compliance tracking","Competitor shelf space analysis","Brand presence heatmaps","Partner performance scoring","Promotional compliance verification"],
  },
  {
    slug:"merchandising-teams", icon:"📋", title:"Merchandising Teams",
    headline:"Audit in minutes, not hours",
    desc:"Snap a photo with your phone — AI does the rest. Automated shelf analysis and report generation replaces 75% of manual audit work, letting your team focus on fixing, not measuring.",
    stats:[{v:"75%",l:"Audit time eliminated"},{v:"10×",l:"Stores audited per day"},{v:"95%",l:"Report accuracy"}],
    features:["Mobile image capture workflow","Automatic planogram diff analysis","One-click compliance report export","Corrective action task assignment","Route optimization suggestions","Historical audit trail & analytics"],
  },
  {
    slug:"distributors", icon:"🚚", title:"Distributors",
    headline:"Territory-wide availability intelligence",
    desc:"Monitor product availability across your entire distribution footprint from a single dashboard. Detect stockout risks early and optimize replenishment to cut out-of-stocks by 22%.",
    stats:[{v:"22%",l:"Out-of-stock reduction"},{v:"15%",l:"Replenishment efficiency gain"},{v:"48h",l:"Earlier stockout warning"}],
    features:["Territory-wide availability dashboard","Stockout risk prediction","Replenishment schedule optimization","Market intelligence by region","SKU performance analytics","Retailer compliance scoring"],
  },
];

export default function SolutionsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">Solutions</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>
            Built for <span className="gradientText">Every Role in Retail</span>
          </h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            Purpose-built workflows for retailers, FMCG brands, merchandising teams, and distributors.
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.solutionsList}>
          {solutions.map((s, i) => (
            <div key={s.slug} className={`${styles.solutionRow} ${i % 2 === 1 ? styles.solutionRowReverse : ""}`}>
              {/* Text */}
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
                <Link href={`/contact`} className="btnPrimary" style={{marginTop:"1rem",display:"inline-flex"}}>
                  Request Demo →
                </Link>
              </div>
              {/* Feature list */}
              <div className={styles.featuresCard}>
                <div className={styles.featuresTitle}>Key Capabilities</div>
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
