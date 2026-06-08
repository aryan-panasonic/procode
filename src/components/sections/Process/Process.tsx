import styles from "./Process.module.css";

const processSteps = [
  "Capture Shelf Images",
  "Upload Data",
  "AI Processing",
  "Actionable Insights"
];

export default function Process() {
  return (
    <section className={styles.section}>
      <div className="container">

        <h2 className="sectionTitle">
          How It Works
        </h2>

        <div className={styles.steps}>
          {processSteps.map((step, index) => (
            <div key={step} className={styles.step}>
              <div className={styles.number}>
                {index + 1}
              </div>

              <h3>{step}</h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}