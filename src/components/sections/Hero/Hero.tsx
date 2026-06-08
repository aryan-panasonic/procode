import styles from "./Hero.module.css";
import Link from "next/link";

export default function Hero() {
  const bars = [82,95,58,77,91,44,88,66,73,94];

  return (
    <section className={styles.hero}>
      <div className={styles.bgGrid} />
      <div className={styles.bgGlow} />
      <div className={styles.bgGlow2} />

      <div className="container">
        <div className={styles.inner}>
          {/* Left: content */}
          <div>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowDot} />
              <span className={styles.eyebrowText}>Enterprise Solutions</span>
            </div>

            <h1 className={styles.h1}>
              AI Shelf Intelligence Platform<br />
              for Retailers and FMCG Manufacturers
            </h1>

            <div className={styles.sub}>
              <p>Automate shelf audits, detect planogram violations, and improve retail execution across every store location.</p>
              <ul style={{textAlign: "left", marginTop: "1.5rem", fontSize: "0.95rem", lineHeight: "2.0", listStyle: "none", padding: 0}}>
                <li>✓ Mobile photo capture</li>
                <li>✓ AI shelf recognition</li>
                <li>✓ Real-time compliance monitoring</li>
                <li>✓ Enterprise reporting</li>
              </ul>
            </div>

            <div className={styles.actions}>
              <Link href="/contact" className="btnPrimary">
                Request Demo
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/brochure" className="btnOutline">Download Brochure</Link>
            </div>

            <div className={styles.trust}>
              {["SOC2 Type II Certified", "99.9% Uptime SLA", "On-premise available"].map(t => (
                <div key={t} className={styles.trustItem}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right: dashboard mock */}
          <div className={styles.visual}>
            <div className={styles.dashCard}>
              <div className={styles.dashHeader}>
                <div className={styles.dashDots}><span/><span/><span/></div>
                {/* Replaced dashboard with an Enterprise Illustration or clean graphic placeholder */}
              </div>
              <div className={styles.dashboardImagePlaceholder} style={{ width: '100%', height: '400px', background: 'var(--ink-800)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)', flexDirection: 'column' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom: '1rem'}}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <div>Enterprise Architecture Diagram Placeholder</div>
                <div style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>Store #124 • Compliance Score • Region • SKU Count</div>
              </div>
            </div>


          </div>
        </div>
      </div>

      <div className={styles.scrollHint}>
        <div className={styles.scrollLine} />
        scroll
      </div>
    </section>
  );
}
