import Link from "next/link";
import styles from "./Industries.module.css";

const industries = [
  { icon:"🛒", title:"Supermarkets",       sub:"Grocery & Fresh",       href:"/industries" },
  { icon:"🏪", title:"Convenience Stores", sub:"CVS & Mini-mart",       href:"/industries" },
  { icon:"💊", title:"Drug Stores",         sub:"Pharmacy & Health",     href:"/industries" },
  { icon:"📱", title:"Electronics Retail",  sub:"Consumer Electronics",  href:"/industries" },
  { icon:"🏬", title:"Department Stores",   sub:"General Merchandise",   href:"/industries" },
  { icon:"🔨", title:"FMCG Manufacturers",    sub:"Brand Execution",        href:"/industries" },
];

export default function Industries() {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <div className="accentBar" />
          <span className="sectionLabel">Industries</span>
          <h2 className="sectionTitle">Every <span className="gradientText">Retail Format</span> Covered</h2>
          <p className="sectionSubtitle" style={{textAlign:"center"}}>INTELLIGENT SHELF ANALYZER is purpose-tuned for the dynamics of each retail vertical.</p>
        </div>
        <div className={styles.grid}>
          {industries.map(ind => (
            <Link key={ind.title} href={ind.href} className={styles.card}>
              <div className={styles.cardIcon}>{ind.icon}</div>
              <div className={styles.info}>
                <div className={styles.cardTitle}>{ind.title}</div>
                <div className={styles.cardSub}>{ind.sub}</div>
              </div>
              <span className={styles.arrowIcon}>›</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
