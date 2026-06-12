"use client";
import Link from "next/link";
import {useTranslations} from "next-intl";
import styles from "./company.module.css";

export default function CompanyPage() {
  const t = useTranslations("company");
  
  // Cast arrays from translations
  const stats = t.raw("stats") as {v: string, l: string}[];
  const certs = t.raw("certs") as {name: string, desc: string}[];
  const timeline = t.raw("timeline") as {y: string, t: string, d: string}[];
  const missionCards = t.raw("missionCards") as {icon: string, t: string, d: string}[];
  
  // Attach icons to certs manually since they aren't purely translation text
  const certsWithIcons = certs.map((c, i) => ({
    ...c,
    icon: ["🛡️", "🔒", "🇯🇵", "🇪🇺"][i]
  }));

  return (
    <div className={styles.page}>
      <div className={styles.hero}><div className="container"><span className="sectionLabel">{t("label")}</span><h1 className="sectionTitle" style={{marginTop:".75rem"}}><span className="gradientText">{t("title1")}</span><br />{t("title2")}</h1><p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center",maxWidth:"620px"}}>{t("sub")}</p></div></div>
      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.statsRow}>{stats.map(s => <div key={s.l} className={styles.statCard}><div className={styles.statVal}>{s.v}</div><div className={styles.statLabel}>{s.l}</div></div>)}</div>
        <div className={styles.missionSection}><div className={styles.missionText}><h2 className={styles.secTitle}>{t("missionTitle")}</h2><p className={styles.body}>{t("mission1")}</p><p className={styles.body}>{t("mission2")}</p><div className={styles.missionBadges}><span className="tag tagCyan">Panasonic Connect</span><span className="tag">Tokyo HQ</span><span className="tag">Bilingual Support</span></div></div><div className={styles.missionCards}>{missionCards.map(c2 => <div key={c2.t} className={styles.missionCard}><span className={styles.missionIcon}>{c2.icon}</span><div className={styles.missionCardTitle}>{c2.t}</div><div className={styles.missionCardDesc}>{c2.d}</div></div>)}</div></div>
        <div className={styles.timelineSection}><h2 className={styles.secTitle}>{t("historyTitle")}</h2><div className={styles.timeline}>{timeline.map((e,i)=><div key={i} className={styles.timelineItem}><div className={styles.timelineYear}>{e.y}</div><div className={styles.timelineDot}/><div className={styles.timelineContent}><div className={styles.timelineTitle}>{e.t}</div><div className={styles.timelineDesc}>{e.d}</div></div></div>)}</div></div>
        <div className={styles.certSection}><h2 className={styles.secTitle}>{t("certTitle")}</h2><p className={styles.body} style={{marginBottom:"2rem"}}>{t("certSub")}</p><div className={styles.certGrid}>{certsWithIcons.map(c3 => <div key={c3.name} className={styles.certCard}><div className={styles.certIcon}>{c3.icon}</div><div className={styles.certName}>{c3.name}</div><div className={styles.certDesc}>{c3.desc}</div></div>)}</div></div>
        <div className={styles.ctaStrip}><div><h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2><p className={styles.ctaSub}>{t("ctaSub")}</p></div><div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}><Link href="/contact" className="btnPrimary">{t("ctaBtn1")}</Link><Link href="/brochure" className="btnOutline">{t("ctaBtn2")}</Link></div></div>
      </div>
    </div>
  );
}
