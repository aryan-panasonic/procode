import styles from "./Modules.module.css";
import Link from "next/link";

const modules = [
  {
    href:"/platform/product-recognition", chip:"Core AI", sub:"Shelf Recognition",
    title:"AI Shelf Recognition",
    desc:"Identify any SKU from a shelf image with 99%+ accuracy. Handles thousands of products across categories in real time.",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>,
  },
  {
    href:"/platform/mobile-capture", chip:"Data Input", sub:"Mobile Capture",
    title:"Mobile Capture App",
    desc:"Empower store staff with an intuitive mobile app to capture shelf images quickly, with built-in quality checks.",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  },
  {
    href:"/platform/planogram-compliance", chip:"Automation", sub:"Compliance Monitoring",
    title:"Compliance Monitoring",
    desc:"Compare actual shelf state against master planograms pixel-by-pixel. Auto-generate deviation reports and corrective work orders.",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href:"/platform/analytics", chip:"Insights", sub:"Reporting & Analytics",
    title:"Reporting & Analytics",
    desc:"Multi-dimensional shelf performance analytics across stores, regions, and national levels. Automated executive-grade reports.",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="M7 16l4-6 4 4 4-8"/></svg>,
  },
  {
    href:"/platform/api", chip:"Developers", sub:"API Integration",
    title:"API Integration",
    desc:"RESTful APIs, Webhooks, and native connectors for major ERP systems. SDKs in Python, Node.js, and Java.",
    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 9l3 3-3 3M13 15h3M2 5h20v14H2z"/></svg>,
  }
];

export default function PlatformOverview() {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <div className="accentBar" />
          <span className="sectionLabel">Platform Overview</span>
          <h2 className="sectionTitle">Comprehensive <span className="gradientText">Retail Execution</span> Suite</h2>
          <p className="sectionSubtitle" style={{textAlign:"center"}}>An integrated suite of tools to capture, analyze, and act on shelf data at enterprise scale.</p>
        </div>
        <div className={styles.grid}>
          {modules.map(m => (
            <Link key={m.title} href={m.href} className={styles.card}>
              <div className={styles.iconWrap}>{m.icon}</div>
              <div className={styles.chipRow}>
                <span className={styles.modChip}>{m.chip}</span>
              </div>
              <h3 className={styles.title}>{m.title}</h3>
              <div className={styles.sub}>{m.sub}</div>
              <p className={styles.desc}>{m.desc}</p>
              <span className={styles.arrow}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
