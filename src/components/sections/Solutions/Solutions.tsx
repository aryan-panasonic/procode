import styles from "./Solutions.module.css";

const steps = [
  "Image Capture",
  "AI Analysis",
  "Compliance Detection",
  "Reporting",
  "Business Insights"
];

export default function Solutions() {
  return (
    <section className={styles.section}>
      <div className="container">

        <h2 className="sectionTitle">
          End-to-End Shelf Intelligence
        </h2>

        <p className="sectionSubtitle">
          Transform retail shelf images into actionable business intelligence
          using advanced AI-powered analysis.
        </p>

        <div className={styles.flow}>
          {steps.map((step, index) => (
            <div key={step} className={styles.item}>
              <div className={styles.card}>{step}</div>

              {index !== steps.length - 1 && (
                <div className={styles.arrow}>→</div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}