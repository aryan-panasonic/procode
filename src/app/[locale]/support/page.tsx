"use client";
import Link from "next/link";
import {useTranslations} from "next-intl";
import styles from "./support.module.css";
import InlineChatWindow from "@/components/chatbot/InlineChatWindow";

export default function SupportPage() {
  const t = useTranslations("support");
  const paths = t.raw("paths") as {icon: string, title: string, sub: string, desc: string, action: string, href: string | null}[];
  const faqs = t.raw("faqs") as {q: string, a: string}[];

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} section`}>
        <div className="container" style={{textAlign: "center"}}>
          <span className="sectionLabel">{t("label")}</span>
          <h1 className="sectionTitle" style={{marginTop: ".75rem"}}>{t("title1")} <span className="gradientText">{t("title2")}</span></h1>
          <p className="sectionSubtitle" style={{margin: "1rem auto 0"}}>{t("sub")}</p>
        </div>
      </section>

      <div className="container" style={{paddingBottom: "5rem"}}>
        <div className={styles.pathsGrid}>
          {paths.map(p => (
            <div key={p.title} className={styles.pathCard}>
              <div className={styles.pathIcon}>{p.icon}</div>
              <div className={styles.pathTitle}>{p.title}</div>
              <div className={styles.pathSub}>{p.sub}</div>
              <p className={styles.pathDesc}>{p.desc}</p>
              {p.href ? <Link href={p.href} className={styles.pathAction}>{p.action}</Link> : <span className={styles.pathActionMuted}>{p.action}</span>}
            </div>
          ))}
        </div>

        <div className={styles.chatSection}>
          <div className={styles.chatHeader}><h2 className={styles.chatTitle}>{t("chatTitle")}</h2><div className={styles.chatBadge}><span className={styles.dot} />{t("chatBadge")}</div></div>
          <InlineChatWindow />
        </div>

        <div className={styles.infoAndFaq}>
          <div className={styles.supportInfo}>
            <h3 className={styles.infoTitle}>{t("infoTitle")}</h3>
            {[
              [t("hoursKey"), t("hoursVal")], [t("langKey"), t("langVal")], [t("enterpriseKey"), t("enterpriseVal")], [t("slaKey"), t("slaVal")], [t("emailKey"), t("emailVal")],
            ].map(([k, v]) => <div key={k} className={styles.infoRow}><span className={styles.infoKey}>{k}</span><span className={styles.infoVal}>{v}</span></div>)}
            <div className={styles.certBadges}><span className="tag tagCyan">SOC2 Type II</span><span className="tag tagGold">ISO 27001</span><span className="tag tagGreen">99.9% SLA</span></div>
          </div>

          <div className={styles.faqSection}>
            <h3 className={styles.infoTitle}>{t("faqTitle")}</h3>
            {faqs.map((f, i) => <details key={i} className={styles.faqItem}><summary className={styles.faqQ}>{f.q}</summary><p className={styles.faqA}>{f.a}</p></details>)}
            <Link href="/documentation" className={styles.faqMore}>{t("faqMore")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
