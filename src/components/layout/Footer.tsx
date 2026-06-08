import Link from "next/link";
import styles from "./Footer.module.css";

const cols = [
  {
    title: "Platform",
    links: [
      { label: "Overview", href: "/platform" },
      { label: "Shelf Recognition", href: "/platform#recognition" },
      { label: "Compliance", href: "/platform#compliance" },
      { label: "Analytics", href: "/platform#analytics" },
      { label: "Security", href: "/platform#security" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Retail Chains", href: "/solutions#retail-chains" },
      { label: "FMCG Brands", href: "/solutions#fmcg-brands" },
      { label: "Convenience Stores", href: "/solutions#convenience-stores" },
      { label: "Drug Stores", href: "/solutions#drug-stores" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/documentation" },
      { label: "API Reference", href: "/documentation#api" },
      { label: "Product Brochure", href: "/resources#brochure" },
      { label: "FAQ", href: "/resources#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/company/about" },
      { label: "Contact Sales", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topLine} />
      <div className="container">
        <div className={styles.inner}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <div className={styles.logoMark}>S</div>
              <span className={styles.logoName}>INTELLIGENT SHELF ANALYZER</span>
            </div>
            <p className={styles.tagline}>
              AI-powered shelf intelligence for modern retail. Real-time compliance, recognition, and analytics — at scale.
            </p>
            <div className={styles.badges}>
              <span className="tag tagCyan">SOC2 Type II</span>
              <span className="tag tagGold">ISO 27001</span>
              <span className="tag tagGreen">99.9% SLA</span>
            </div>
          </div>

          {/* Link columns */}
          <div className={styles.links}>
            {cols.map(col => (
              <div key={col.title} className={styles.col}>
                <div className={styles.colTitle}>{col.title}</div>
                <ul className={styles.colList}>
                  {col.links.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className={styles.colLink}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.bottomLinks}>
            <span>© 2025 INTELLIGENT SHELF ANALYZER Inc. All rights reserved.</span>
            <Link href="/privacy" className={styles.bottomLink}>Privacy</Link>
            <Link href="/terms" className={styles.bottomLink}>Terms</Link>
            <Link href="/company/security" className={styles.bottomLink}>Security</Link>
          </div>
          <div className={styles.langs}>
            <span className={styles.langBtn}>🇯🇵 日本語</span>
            <span className={styles.langBtn}>🇬🇧 English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
