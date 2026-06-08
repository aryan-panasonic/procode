import styles from "./ROI.module.css";

const metrics = [
  { v:"80%",    l:"Reduction in Audit Time",   sub:"Automated image processing",  c:"var(--cyan)" },
  { v:"5x",     l:"Faster Reporting",   sub:"Compared to manual methods",           c:"var(--cyan)"  },
  { v:"Improved", l:"Shelf Compliance",   sub:"Continuous monitoring",    c:"var(--cyan)"  },
  { v:"Higher", l:"Execution Accuracy",   sub:"Data-driven execution",   c:"var(--cyan)"      },
];

export default function ROI() {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <div className="accentBar" />
          <span className="sectionLabel">Business Impact</span>
          <h2 className="sectionTitle">Measurable <span className="gradientText">ROI</span>, Fast</h2>
        </div>

        <div className={styles.metricsRow}>
          {metrics.map(m => (
            <div key={m.l} className={styles.mCard}>
              <div className={styles.mVal} style={{color:m.c}}>{m.v}</div>
              <div className={styles.mLbl}>{m.l}</div>
              <div className={styles.mSub}>{m.sub}</div>
            </div>
          ))}
        </div>

        <div className={styles.caseCard}>
          <div className={styles.caseTop}>
            <span className="tag tagGold">Case Study Placeholder</span>
          </div>
          <div className={styles.caseBody}>
            <div>
              <div className={styles.caseMeta}>
                <span className={styles.caseName}>[Client Company Name]</span>
                <span className={styles.caseSub}>[Scale/Scope Placeholder]</span>
              </div>
              <div className={styles.block}>
                <div className={styles.blockTitle}>Challenge</div>
                <p className={styles.blockText}>[Detailed description of the client's previous operational bottlenecks, high labor costs, or poor visibility.]</p>
              </div>
              <div className={styles.block}>
                <div className={`${styles.blockTitle} ${styles.blockGreen}`}>Outcome</div>
                <p className={styles.blockText}>[Detailed description of how the INTELLIGENT SHELF ANALYZER solved the problem, including specific implementation steps and verified results.]</p>
              </div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statVal}>[Stat]</div>
              <div className={styles.statLbl}>[Impact Label]</div>
              <div className={styles.statDivider} />
              <div className={styles.statVal} style={{color:"var(--green)"}}>[Stat]</div>
              <div className={styles.statLbl}>[Impact Label]</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
