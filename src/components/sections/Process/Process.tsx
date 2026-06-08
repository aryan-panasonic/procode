import styles from "./Process.module.css";

const steps = [
  { n:"01", title:"Capture", sub:"Image Ingestion", desc:"Smartphones, fixed cameras, or handheld devices capture shelf images. Works with existing camera infrastructure." },
  { n:"02", title:"AI Analysis", sub:"Computer Vision", desc:"Our deep learning models identify SKUs, read price tags, and compare against planograms — in 0.3 seconds per shelf." },
  { n:"03", title:"Insights", sub:"Anomaly Detection", desc:"Out-of-stocks, compliance deviations, and price anomalies are detected and ranked by business impact." },
  { n:"04", title:"Action", sub:"Workflow Automation", desc:"Field staff alerts, dashboard updates, and ERP sync happen automatically. No manual data entry." },
];

const tech = ["Deep Learning","Computer Vision","OCR","Edge AI","Cloud Processing","Real-time Analytics"];

export default function Process() {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <div className="accentBar" />
          <span className="sectionLabel">How It Works</span>
          <h2 className="sectionTitle">From Shelf to <span className="gradientText">Insight in Seconds</span></h2>
          <p className="sectionSubtitle" style={{textAlign:"center"}}>Four steps, fully automated. Capture to action without manual intervention.</p>
        </div>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s.n} className={styles.step}>
              {i < steps.length - 1 && <div className={styles.connector} />}
              <div className={styles.numWrap}><span className={styles.num}>{s.n}</span></div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <div className={styles.stepSub}>{s.sub}</div>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div className={styles.techRow}>
          {tech.map(t => (
            <div key={t} className={styles.chip}>
              <span className={styles.chipDot} />{t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
