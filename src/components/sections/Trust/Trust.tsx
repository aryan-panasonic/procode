import styles from "./Trust.module.css";

const items = [
  "Enterprise Security",
  "API Integrations",
  "Scalable Architecture",
  "Multilingual Support",
  "AI Transparency"
];

export default function Trust() {
  return (
    <section className={styles.section}>
      <div className="container">

        <h2 className="sectionTitle">
          Enterprise Trust
        </h2>

        <div className={styles.grid}>
          {items.map(item => (
            <div key={item} className={styles.card}>
              {item}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}