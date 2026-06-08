import Link from "next/link";
import styles from "./CTA.module.css";

export default function CTA() {
  return (
    <section className={styles.section}>
      <div className="container">

        <div className={styles.box}>

          <h2>
            Ready to Modernize Retail Execution?
          </h2>

          <p>
            Discover how AI-powered shelf intelligence can improve visibility,
            compliance, and operational efficiency.
          </p>

          <Link
            href="/contact"
            className={styles.button}
          >
            Request a Demo
          </Link>

        </div>

      </div>
    </section>
  );
}