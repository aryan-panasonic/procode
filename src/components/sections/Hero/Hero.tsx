import styles from "./Hero.module.css";
import Link from "next/link";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className="container">

        <div className={styles.content}>
          <h1>
            AI-Powered Shelf Intelligence
            for Modern Retail
          </h1>

          <p>
            Automate shelf audits,
            monitor compliance,
            analyze pricing,
            and improve retail execution
            with AI.
          </p>

          <div className={styles.actions}>
            <Link href="/contact">
              Request Demo
            </Link>

            <Link href="/platform">
              Explore Platform
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}