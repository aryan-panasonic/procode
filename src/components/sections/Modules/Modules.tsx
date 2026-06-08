import styles from "./Modules.module.css";

const modules = [
  "AI Product Recognition",
  "Planogram Compliance",
  "OCR & Pricing",
  "Analytics Dashboard",
  "API Integration",
  "Auto Planogram Generation"
];

export default function Modules() {
  return (
    <section className={styles.section}>
      <div className="container">

        <h2 className="sectionTitle">
          Platform Modules
        </h2>

        <div className={styles.grid}>
          {modules.map(module => (
            <div key={module} className={styles.card}>
              <h3>{module}</h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}