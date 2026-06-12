import styles from "./Process.module.css";
import {getTranslations} from "next-intl/server";

export default async function Process() {
  const t = await getTranslations("howItWorks");
  const steps = t.raw("steps") as {title: string; desc: string}[];
  const tech = ["Deep Learning", "Computer Vision", "OCR", "Edge AI", "Cloud Processing", "Real-time Analytics"];

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.head}>
          <div className="accentBar" />
          <span className="sectionLabel">{t("title")}</span>
          <h2 className="sectionTitle">From Shelf to <span className="gradientText">Insight in Seconds</span></h2>
          <p className="sectionSubtitle" style={{textAlign: "center"}}>{t("sub")}</p>
        </div>
        <div className={styles.steps}>
          {steps.map((s, i) => (
            <div key={s.title} className={styles.step}>
              {i < steps.length - 1 && <div className={styles.connector} />}
              <div className={styles.numWrap}><span className={styles.num}>{String(i + 1).padStart(2, "0")}</span></div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <div className={styles.stepSub}>{s.title}</div>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div className={styles.techRow}>
          {tech.map(t => <div key={t} className={styles.chip}><span className={styles.chipDot} />{t}</div>)}
        </div>
      </div>
    </section>
  );
}
