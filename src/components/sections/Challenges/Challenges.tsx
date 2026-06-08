import styles from "./Challenges.module.css";

const items = [
  { icon: "👁️", title: "Zero Shelf Visibility", desc: "Manual audits can't keep pace with modern retail. Out-of-stocks and misplacements go undetected for hours." },
  { icon: "📋", title: "Planogram Non-Compliance", desc: "Brand guidelines go unenforced. Shelf facings deviate from plan with no automatic detection or alerting." },
  { icon: "💰", title: "Inefficient Price Monitoring", desc: "Tracking competitor pricing manually is resource-intensive. Market shifts happen faster than teams can react." },
  { icon: "📊", title: "Data Silos", desc: "Sales, inventory, and shelf data live in separate systems. Integrated analysis is slow, expensive, and manual." },
  { icon: "⏱️", title: "High Audit Labor Cost", desc: "Regular shelf audits consume thousands of hours. Human error is inevitable and outcomes are inconsistent." },
  { icon: "📈", title: "ROI Blind Spots", desc: "Merchandising investment effects are invisible. Leadership can't see what's working or prove impact." },
];

export default function Challenges() {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <div className="accentBar" />
          <span className="sectionLabel">Business Challenges</span>
          <h2 className="sectionTitle">Six Problems<br /><span className="gradientText">Holding Retail Back</span></h2>
          <p className="sectionSubtitle" style={{textAlign:"center"}}>INTELLIGENT SHELF ANALYZER addresses the operational gaps that cost retailers millions in lost revenue and wasted effort every year.</p>
        </div>
        <div className={styles.grid}>
          {items.map(item => (
            <div key={item.title} className={styles.card}>
              <div className={styles.icon}>{item.icon}</div>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.desc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
