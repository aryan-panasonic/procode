import Link from "next/link";
import styles from "./Industries.module.css";

const industries = [
  "Supermarkets",
  "Convenience Stores",
  "Drug Stores",
  "Electronics Retail",
  "Department Stores",
  "Home Improvement"
];

export default function Industries() {
  return (
    <section className={styles.section}>
      <div className="container">

        <h2 className="sectionTitle">
          Industries We Serve
        </h2>

        <div className={styles.grid}>
          {industries.map(industry => (
            <Link
              href="/industries"
              key={industry}
              className={styles.card}
            >
              {industry}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}