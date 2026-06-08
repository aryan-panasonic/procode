import React from "react";
import styles from "./FAQ.module.css";

export default function FAQ() {
  const faqs = [
    {
      q: "How does the implementation process work?",
      a: "Implementation typically takes 2-4 weeks. We begin by ingesting your master planograms and catalog data. Next, we run a 5-store pilot to calibrate the AI models for your specific shelf environment. Finally, we integrate the API with your existing retail execution software and roll out to all locations."
    },
    {
      q: "Does this require new hardware?",
      a: "No. Our platform is hardware-agnostic. Field staff can use their existing smartphones or tablets to capture images via our SDK or your existing retail execution app. For fixed-camera solutions, we integrate directly with your existing CCTV or shelf-edge cameras via RTSP streams."
    },
    {
      q: "How accurate is the product recognition?",
      a: "Our models achieve 98%+ accuracy for product recognition and out-of-stock detection in typical retail environments. We handle difficult conditions like glare, angled shots, and dense category shelving by utilizing multi-frame analysis and edge-enhanced OCR."
    },
    {
      q: "Where is the data processed and stored?",
      a: "We offer regional cloud hosting in AWS and Azure (Tokyo, Frankfurt, N. Virginia) to comply with data residency requirements. All image processing can be configured to blur faces and PII before leaving the edge device, ensuring full GDPR and local privacy compliance."
    }
  ];

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <div className={styles.header}>
          <span className="sectionLabel">FAQ</span>
          <h2 className="sectionTitle" style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</h2>
          <p className="sectionSubtitle">Common questions about implementation, security, and integration.</p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <h3 className={styles.question}>{faq.q}</h3>
              <p className={styles.answer}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
