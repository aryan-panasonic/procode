import Link from "next/link";
import styles from "./company.module.css";

const sections = [
  {
    id:"about", title:"About INTELLIGENT SHELF ANALYZER",
    content:"INTELLIGENT SHELF ANALYZER was founded in 2021 by retail technologists and computer vision researchers who saw a massive gap between what AI could do and what retailers were actually using. We believe every retailer — regardless of size — should have access to the shelf intelligence that only the biggest brands could previously afford.\n\nHeadquartered in Tokyo, with engineering teams in Singapore and London, INTELLIGENT SHELF ANALYZER serves over 25,000 retail locations across 12 countries.",
  },
  {
    id:"security", title:"Security & Compliance",
    content:"Security isn't a feature — it's the foundation of everything we build. INTELLIGENT SHELF ANALYZER is SOC2 Type II certified, ISO 27001 certified, and GDPR compliant. All data processed through our platform is encrypted at rest and in transit.\n\nEnterprise clients can choose on-premise deployment, private cloud, or our multi-tenant cloud. We support custom data residency requirements and have dedicated compliance support for highly regulated industries.",
  }
];

const stats = [
  { v:"2021", l:"Founded" },
  { v:"25,000+", l:"Stores worldwide" },
  { v:"12", l:"Countries" },
  { v:"180+", l:"Team members" },
];

export default function CompanyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">Company</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>
            The Team Behind <span className="gradientText">INTELLIGENT SHELF ANALYZER</span>
          </h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            We&apos;re a team of retail technologists, computer vision researchers, and enterprise software builders on a mission to make every shelf smarter.
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        {/* Stats */}
        <div className={styles.statsRow}>
          {stats.map(s => (
            <div key={s.l} className={styles.statCard}>
              <div className={styles.statVal}>{s.v}</div>
              <div className={styles.statLbl}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className={styles.sectionsList}>
          {sections.map(sec => (
            <div key={sec.id} id={sec.id} className={styles.secBlock}>
              <h2 className={styles.secTitle}>{sec.title}</h2>
              <div className={styles.secContent}>
                {sec.content.split("\n\n").map((para, i) => (
                  <p key={i} className={styles.secPara}>{para}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={styles.ctaBlock}>
          <h3 className={styles.ctaTitle}>Ready to see INTELLIGENT SHELF ANALYZER in action?</h3>
          <p className={styles.ctaDesc}>Join 25,000+ stores using INTELLIGENT SHELF ANALYZER to automate shelf intelligence.</p>
          <div className={styles.ctaActions}>
            <Link href="/contact" className="btnPrimary">Request a Demo</Link>
            <Link href="/contact" className="btnOutline">Contact Sales</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
