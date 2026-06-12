"use client";
import { useState } from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import styles from "./platform.module.css";

const DemoViz = ({ active, demoT }: { active: string, demoT: any }) => {
  if (active === "recognition") {
    const recProds = demoT.raw("recProds") as string[];
    return (
      <div className={styles.demoBox}>
        <div className={styles.demoLabel}>{demoT("recLbl")}</div>
        <div className={styles.recGrid}>
          {recProds.map((p,i) => (
            <div key={i} className={styles.recCell}>
              <div className={styles.recBox} style={{background:i===3?"rgba(220,53,69,0.12)":"var(--cyan-pale)",borderColor:i===3?"var(--red)":"var(--cyan)"}}/>
              <div className={styles.recLabel}>{p}</div>
              <div className={styles.recConf} style={{color:i===3?"var(--red)":"var(--green)"}}>{i===3?demoT("recConfCheck"):"99%"}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (active === "compliance") {
    return (
      <div className={styles.demoBox}>
        <div className={styles.demoLabel}>{demoT("compLbl")}</div>
        <div className={styles.scoreCircle}>
          <svg viewBox="0 0 120 120" className={styles.circSvg}>
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--ink-700)" strokeWidth="10"/>
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--cyan)" strokeWidth="10"
              strokeDasharray="251" strokeDashoffset="38" strokeLinecap="round" transform="rotate(-90 60 60)"/>
          </svg>
          <div className={styles.scoreText}><span className={styles.scoreVal}>85%</span><span className={styles.scoreLbl}>{demoT("compRate")}</span></div>
        </div>
        <div className={styles.compIssues}>
          <div className={styles.issue} style={{borderLeft:"3px solid var(--red)"}}>{demoT("compIssue1")}</div>
          <div className={styles.issue} style={{borderLeft:"3px solid var(--gold)"}}>{demoT("compIssue2")}</div>
        </div>
      </div>
    );
  }
  if (active === "ocr") {
    const ocrProds = demoT.raw("ocrProds") as {p:string,t:string,r:string,ok:boolean}[];
    return (
      <div className={styles.demoBox}>
        <div className={styles.demoLabel}>{demoT("ocrLbl")}</div>
        {ocrProds.map((r,i)=>(
          <div key={i} className={styles.ocrRow}>
            <span className={styles.ocrProd}>{r.p}</span>
            <span className={styles.ocrTag}>{demoT("ocrTag")} {r.t}</span>
            <span className={styles.ocrRef} style={{color:r.ok?"var(--green)":"var(--red)"}}>{r.ok?demoT("ocrMatch"):`${demoT("ocrMismatch")}${r.r})`}</span>
          </div>
        ))}
      </div>
    );
  }
  if (active === "analytics") {
    const anaStats = demoT.raw("anaStats") as {v:string,l:string}[];
    return (
      <div className={styles.demoBox}>
        <div className={styles.demoLabel}>{demoT("anaLbl")}</div>
        <div className={styles.anaStats}>
          {anaStats.map((s,i)=>(
            <div key={i} className={styles.anaStat}>
              <div className={styles.anaVal} style={{color:i===2?"var(--red)":"var(--cyan)"}}>{s.v}</div>
              <div className={styles.anaLbl}>{s.l}</div>
            </div>
          ))}
        </div>
        <div className={styles.anaBar}>
          {[82,95,78,91,88,96,74].map((v,i)=>(
            <div key={i} className={styles.bar} style={{height:`${v}%`,opacity:0.6+i*0.05}}/>
          ))}
        </div>
      </div>
    );
  }
  if (active === "api") {
    return (
      <div className={styles.demoBox}>
        <div className={styles.demoLabel}>{demoT("apiLbl")}</div>
        <pre className={styles.code}>{`POST /v1/shelf/analyze
{
  "store_id": "TKY-001",
  "planogram_id": "pg_v3",
  "compliance_score": 0.94,
  "violations": [
    { "sku": "4901234567890",
      "type": "facing_count",
      "expected": 4, "actual": 2 }
  ]
}`}</pre>
      </div>
    );
  }
  if (active === "auto") {
    const autoSteps = demoT.raw("autoSteps") as string[];
    return (
      <div className={styles.demoBox}>
        <div className={styles.demoLabel}>{demoT("autoLbl")}</div>
        <div className={styles.autoSteps}>
          {autoSteps.map((s,i)=>(
            <div key={i} className={styles.autoStep}>
              <span className={styles.autoNum}>{i+1}</span>
              <span className={styles.autoTxt}>{s}</span>
              <span className={styles.autoCheck} style={{color:i<3?"var(--green)":"var(--cyan)"}}>✓</span>
            </div>
          ))}
        </div>
        <div className={styles.autoResult}>{demoT("autoRes")}</div>
      </div>
    );
  }
  return null;
};

export default function PlatformPage() {
  const t = useTranslations("platform");
  const demoT = useTranslations("platform.demo");
  const [active, setActive] = useState("recognition");
  
  const tabs = t.raw("tabs") as {id:string, icon:string, label:string, title:string, desc:string, points:string[], demo:string}[];
  const specs = t.raw("specs") as {label:string, value:string}[];
  const metrics = t.raw("metrics") as {v:string, l:string}[];
  const specHead = t.raw("specHead") as string[];
  
  const tab = tabs.find(t=>t.id===active)!;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">{t("label")}</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>
            {t("title1")}<br /><span className="gradientText">{t("title2")}</span>
          </h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            {t("sub")}
          </p>
          <div className={styles.heroMetrics}>
            {metrics.map(m=>(
              <div key={m.l} className={styles.heroMetric}>
                <span className={styles.heroMetricVal}>{m.v}</span>
                <span className={styles.heroMetricLbl}>{m.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.tabBar}>
          {tabs.map(tItem=>(
            <button key={tItem.id} onClick={()=>setActive(tItem.id)}
              className={`${styles.tabBtn}${active===tItem.id?" "+styles.tabActive:""}`}>
              <span>{tItem.icon}</span>{tItem.label}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          <div className={styles.tabLeft}>
            <h2 className={styles.tabTitle}>{tab.title}</h2>
            <p className={styles.tabDesc}>{tab.desc}</p>
            <ul className={styles.tabPoints}>
              {tab.points.map((p,i)=>(
                <li key={i}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
            <div className={styles.tabActions}>
              <Link href="/contact" className="btnPrimary">{t("btn1")}</Link>
              <Link href="/documentation" className="btnOutline">{t("btn2")}</Link>
            </div>
          </div>
          <div className={styles.tabRight}>
            <DemoViz active={active} demoT={demoT} />
          </div>
        </div>

        <section className={styles.specSection}>
          <h2 className="sectionTitle" style={{fontSize:"1.4rem",marginBottom:"1.5rem"}}>
            {t("specsTitle")} <span style={{fontSize:"0.7em",fontWeight:400,color:"var(--slate-500)"}}>{t("specsSub")}</span>
          </h2>
          <div className={styles.specTable}>
            <div className={styles.specHead}>
              <div>{specHead[0]}</div><div>{specHead[1]}</div>
            </div>
            {specs.map(s=>(
              <div key={s.label} className={styles.specRow}>
                <div className={styles.specLabel}>{s.label}</div>
                <div className={styles.specValue}>{s.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.ctaStrip}>
          <div>
            <h2 className={styles.ctaTitle}>{t("ctaTitle")}</h2>
            <p className={styles.ctaSub}>{t("ctaSub")}</p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/contact" className="btnPrimary">{t("ctaBtn1")}</Link>
            <Link href="/brochure" className="btnOutline">{t("ctaBtn2")}</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
