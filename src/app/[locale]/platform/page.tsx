import Link from "next/link";
import styles from "./platform.module.css";

const modules = [
  {
    id:"product-recognition", icon:"🤖", tag:"Core AI",
    title:"AI Product Recognition",
    desc:"Identify any SKU from a shelf image with 99%+ accuracy. Our deep learning model handles thousands of products across all categories, under any lighting or angle condition.",
    details:["99%+ SKU identification accuracy","Handles 50,000+ product catalog","Works under variable lighting","Sub-300ms per shelf image","Automatic catalog learning","Multi-angle recognition"],
  },
  {
    id:"planogram-compliance", icon:"📐", tag:"Compliance",
    title:"Planogram Compliance Engine",
    desc:"Compare actual shelf state against master planograms at pixel level. Automatically detect facings, position deviations, and missing products — then generate corrective work orders.",
    details:["Pixel-level planogram comparison","Facing count verification","Position deviation detection","Missing product identification","Auto work order generation","Compliance trend tracking"],
  },
  {
    id:"ocr-pricing", icon:"💲", tag:"Intelligence",
    title:"OCR & Price Intelligence",
    desc:"Read price tags via computer vision OCR, detect pricing anomalies, and track competitor pricing across retail partners. Never miss a price deviation again.",
    details:["High-accuracy price tag OCR","Competitor price monitoring","Price anomaly detection","Historical price trend analysis","Promotional compliance checks","Multi-currency support"],
  },
  {
    id:"analytics", icon:"📊", tag:"Analytics",
    title:"Analytics & Reporting",
    desc:"Multi-dimensional shelf performance analytics across store, region, and national levels. Automated executive dashboards and scheduled report delivery.",
    details:["Store-to-national drill-down","Automated executive dashboards","Scheduled report delivery","Custom KPI configuration","Export to CSV / Excel / PDF","API-accessible analytics"],
  },
  {
    id:"api", icon:"⚙️", tag:"Developers",
    title:"API & Integration Platform",
    desc:"RESTful APIs with full OpenAPI documentation, Webhooks for real-time event streaming, and native ERP connectors. SDKs available in Python, Node.js, and Java.",
    details:["RESTful API + OpenAPI spec","Real-time Webhooks","Python / Node.js / Java SDKs","SAP & Oracle connectors","Custom integration support","Sandbox environment"],
  },
  {
    id:"auto-planogram", icon:"✨", tag:"AI-Generated",
    title:"Auto Planogram Generation",
    desc:"Let AI design the optimal shelf layout using sales velocity, category strategy, and space constraints. Generate compliant planograms in minutes instead of weeks.",
    details:["Sales-velocity-driven layouts","Category rule enforcement","Space constraint optimization","Version control & history","Export to standard formats","Compliance pre-validation"],
  },
];

export default function PlatformPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">Platform</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>
            One Integrated <span className="gradientText">AI Platform</span>
          </h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            Six powerful modules. Use any one standalone or combine them all — the more you integrate, the more intelligence you unlock.
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.grid}>
          {modules.map(m => (
            <div key={m.id} className={styles.moduleCard}>
              <div className={styles.moduleHead}>
                <div className={styles.moduleIconWrap}>
                  <span className={styles.moduleIcon}>{m.icon}</span>
                </div>
                <span className="tag tagCyan" style={{fontSize:".62rem"}}>{m.tag}</span>
              </div>
              <h2 className={styles.moduleTitle}>{m.title}</h2>
              <p className={styles.moduleDesc}>{m.desc}</p>
              <ul className={styles.detailList}>
                {m.details.map(d => (
                  <li key={d} className={styles.detailItem}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                    {d}
                  </li>
                ))}
              </ul>
              <Link href="/contact" className={styles.moduleLink}>Learn more →</Link>
            </div>
          ))}
        </div>

        {/* Integration banner */}
        <div className={styles.integBanner}>
          <div className={styles.integLeft}>
            <h3 className={styles.integTitle}>Integrates with your existing stack</h3>
            <p className={styles.integDesc}>Native connectors for SAP, Oracle, Microsoft Dynamics, and major retail management systems. Custom integration support for everything else.</p>
          </div>
          <div className={styles.integLogos}>
            {["SAP","Oracle","MS Dynamics","Salesforce","Custom ERP"].map(l => (
              <div key={l} className={styles.integLogo}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
