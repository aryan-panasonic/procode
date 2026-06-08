import Link from "next/link";
import styles from "./resources.module.css";

const featured = {
  tag:"Research Report", title:"The State of Retail Shelf Execution 2025",
  desc:"Our annual report analyzing shelf compliance rates, out-of-stock frequency, and the adoption of AI-powered retail intelligence across 18,000+ stores globally.",
  readTime:"12 min read",
};

const posts = [
  { tag:"Blog", title:"How Computer Vision is Replacing Manual Shelf Audits", date:"May 2025", read:"7 min" },
  { tag:"Case Study", title:"How a 850-Store Chain Cut Audit Costs by 80% with INTELLIGENT SHELF ANALYZER", date:"Apr 2025", read:"5 min" },
  { tag:"Whitepaper", title:"Planogram Compliance: The $47B Problem Retailers Ignore", date:"Mar 2025", read:"14 min" },
  { tag:"Blog", title:"OCR vs Manual Price Checking: A Total Cost Analysis", date:"Mar 2025", read:"8 min" },
  { tag:"Blog", title:"Share of Shelf Measurement: From Guesswork to Precision", date:"Feb 2025", read:"6 min" },
  { tag:"Case Study", title:"FMCG Brand Gains 18% Shelf Share Using AI Compliance Data", date:"Feb 2025", read:"4 min" },
  { tag:"Whitepaper", title:"Building a Retail AI Business Case for Executives", date:"Jan 2025", read:"10 min" },
  { tag:"Blog", title:"Integrating Shelf Intelligence with Your ERP System", date:"Jan 2025", read:"9 min" },
];

const tagColors: Record<string,string> = {
  "Blog":"tagCyan",
  "Case Study":"tagGold",
  "Whitepaper":"tagGreen",
  "Research Report":"tagGreen",
};

export default function ResourcesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">Resources</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>Retail AI <span className="gradientText">Knowledge Hub</span></h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            Insights, case studies, and deep-dives on shelf intelligence, planogram compliance, and retail AI.
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        {/* Featured */}
        <div className={styles.featured}>
          <div className={styles.featuredBadge}>
            <span className={`tag ${tagColors[featured.tag]}`}>{featured.tag}</span>
            <span className={styles.featuredNew}>New</span>
          </div>
          <h2 className={styles.featuredTitle}>{featured.title}</h2>
          <p className={styles.featuredDesc}>{featured.desc}</p>
          <div className={styles.featuredFooter}>
            <span className={styles.readTime}>📖 {featured.readTime}</span>
            <Link href="#" className="btnPrimary">Download Report</Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className={styles.filterRow}>
          {["All","Blog","Case Studies","Whitepapers","Research"].map(f => (
            <button key={f} className={`${styles.filterBtn} ${f==="All" ? styles.filterActive : ""}`}>{f}</button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {posts.map(p => (
            <Link key={p.title} href="#" className={styles.postCard}>
              <div className={styles.postMeta}>
                <span className={`tag ${tagColors[p.tag] || "tagCyan"}`} style={{fontSize:".62rem"}}>{p.tag}</span>
                <span className={styles.postDate}>{p.date}</span>
              </div>
              <h3 className={styles.postTitle}>{p.title}</h3>
              <div className={styles.postFooter}>
                <span className={styles.postRead}>{p.read} read</span>
                <span className={styles.postArrow}>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Newsletter */}
        <div className={styles.newsletter}>
          <div className={styles.newsletterLeft}>
            <h3 className={styles.newsletterTitle}>Get retail AI insights in your inbox</h3>
            <p className={styles.newsletterDesc}>Monthly digest of shelf intelligence research, product updates, and industry news.</p>
          </div>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="work@company.com" className={styles.newsletterInput} />
            <button className="btnPrimary">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
}
