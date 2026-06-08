import Link from "next/link";
import styles from "./CTA.module.css";

export default function CTA() {
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.box}>
          <div className={styles.glow} />
          <div className={styles.inner}>
            <span className="sectionLabel" style={{marginBottom:"1.25rem"}}>Get Started</span>
            <h2 className={styles.title}>
              Shelf Intelligence,<br />
              <span className="gradientText">Starting Today</span>
            </h2>
            <p className={styles.sub}>
              See a live demo tailored to your retail format. Our engineers walk you through real data in 30 minutes — no slides, no fluff.
            </p>
            <div className={styles.actions}>
              <Link href="/contact" className="btnPrimary" style={{fontSize:"1rem",padding:"14px 30px"}}>
                Request a Demo
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/contact" className="btnOutline" style={{fontSize:"1rem",padding:"13px 30px"}}>
                Talk to Sales
              </Link>
            </div>
            <div className={styles.checks}>
              {["No contract required","Response within 1 business day","Full English & Japanese support"].map(c => (
                <span key={c} className={styles.check}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
