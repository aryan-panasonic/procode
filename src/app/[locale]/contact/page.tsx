import styles from "./contact.module.css";

export default function ContactPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">Contact</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>Let&apos;s Talk <span className="gradientText">Shelf Intelligence</span></h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            Request a demo, ask a question, or get a custom quote. We respond within one business day.
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {/* Form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Request a Demo</h2>
            <form className={styles.form}>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>First Name</label>
                  <input className={styles.input} type="text" placeholder="John" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Last Name</label>
                  <input className={styles.input} type="text" placeholder="Smith" />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Work Email</label>
                <input className={styles.input} type="email" placeholder="john@company.com" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Company</label>
                <input className={styles.input} type="text" placeholder="Company name" />
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Industry</label>
                  <select className={styles.input}>
                    <option value="">Select industry</option>
                    <option>Supermarket</option>
                    <option>Convenience Store</option>
                    <option>Drug Store</option>
                    <option>FMCG Brand</option>
                    <option>Electronics Retail</option>
                    <option>Department Store</option>
                    <option>Distributor</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Number of Stores</label>
                  <select className={styles.input}>
                    <option value="">Select range</option>
                    <option>1–10</option>
                    <option>11–50</option>
                    <option>51–200</option>
                    <option>201–500</option>
                    <option>500+</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>How can we help?</label>
                <textarea className={styles.textarea} rows={4} placeholder="Tell us about your shelf management challenges or what you'd like to see in the demo..." />
              </div>
              <button type="submit" className={`btnPrimary ${styles.submitBtn}`}>
                Request Demo
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <p className={styles.formNote}>By submitting you agree to our Privacy Policy. We&apos;ll contact you within 1 business day.</p>
            </form>
          </div>

          {/* Info side */}
          <div className={styles.info}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>What to expect</h3>
              <ul className={styles.steps}>
                {[
                  { n:"01", t:"Intake call (30 min)", d:"We learn about your stores, formats, and current pain points." },
                  { n:"02", t:"Custom demo", d:"A tailored walkthrough using your shelf data or representative samples." },
                  { n:"03", t:"Technical Q&A", d:"Deep-dive with our engineering team on integration, security, and scale." },
                  { n:"04", t:"Proposal", d:"A scoped proposal with timeline, pricing, and implementation plan." },
                ].map(s => (
                  <li key={s.n} className={styles.step}>
                    <span className={styles.stepNum}>{s.n}</span>
                    <div>
                      <div className={styles.stepTitle}>{s.t}</div>
                      <div className={styles.stepDesc}>{s.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>Other ways to reach us</h3>
              <div className={styles.contactItems}>
                {[
                  { icon:"✉️", label:"Sales", val:"sales@shelfai.com" },
                  { icon:"🛠️", label:"Support", val:"support@shelfai.com" },
                  { icon:"🌐", label:"HQ", val:"Tokyo, Japan" },
                  { icon:"🕐", label:"Response time", val:"Within 1 business day" },
                ].map(c => (
                  <div key={c.label} className={styles.contactItem}>
                    <span className={styles.contactIcon}>{c.icon}</span>
                    <div>
                      <div className={styles.contactLabel}>{c.label}</div>
                      <div className={styles.contactVal}>{c.val}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.trustRow}>
              <span className="tag tagCyan">SOC2 Type II</span>
              <span className="tag tagGold">ISO 27001</span>
              <span className="tag tagGreen">99.9% SLA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
