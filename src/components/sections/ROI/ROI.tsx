import styles from "./ROI.module.css";

const benefits = [
  "Reduce Audit Time",
  "Improve Shelf Compliance",
  "Increase Product Visibility",
  "Faster Reporting"
];

export default function ROI() {
  return (
    <section className={styles.section}>
      <div className="container">

        <h2 className="sectionTitle">
          Business Outcomes
        </h2>

        <div className={styles.grid}>
          {benefits.map(item => (
            <div key={item} className={styles.card}>
              {item}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}