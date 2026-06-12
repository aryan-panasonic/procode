"use client";
import {useLocale, useTranslations} from "next-intl";
import {useState, type FormEvent} from "react";
import styles from "./brochure.module.css";

type Status = "idle"|"loading"|"done"|"error";

export default function BrochurePage() {
  const locale = useLocale();
  const t = useTranslations("brochure");
  const features = [
    { icon: "🤖", title: t("feat1t"), desc: t("feat1d") },
    { icon: "📐", title: t("feat2t"), desc: t("feat2d") },
    { icon: "💲", title: t("feat3t"), desc: t("feat3d") },
    { icon: "📊", title: t("feat4t"), desc: t("feat4d") },
    { icon: "⚙️", title: t("feat5t"), desc: t("feat5d") },
    { icon: "🔒", title: t("feat6t"), desc: t("feat6d") },
  ];
  const [form, setForm] = useState({name: "", email: "", company: ""});
  const [status, setStatus] = useState<Status>("idle");
  function set(k: keyof typeof form, v: string) { setForm(f => ({...f, [k]: v})); }
  async function submit(e: FormEvent) {
    e.preventDefault(); setStatus("loading");
    try {
      await fetch("/api/tickets", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({title: `${t("title")} ${t("titleAccent")}: ${form.company || form.name}`, description: `${form.name} (${form.email})
${t("company")}: ${form.company}`, status: "open", source: "brochure_download", metadata: form})});
      setStatus("done");
    } catch { setStatus("error"); }
  }
  return (
    <div className={styles.page}>
      <div className={styles.hero}><div className="container" style={{textAlign:"center"}}><span className="sectionLabel">{t("label")}</span><h1 className="sectionTitle" style={{marginTop:".75rem"}}>{t("title")} <span className="gradientText">{t("titleAccent")}</span></h1><p className="sectionSubtitle" style={{margin:"1rem auto 0"}}>{t("sub")}</p></div></div>
      <div className="container" style={{paddingBottom:"5rem"}}><div className={styles.layout}><div className={styles.features}><h2 className={styles.featTitle}>{t("contentsTitle")}</h2><div className={styles.featGrid}>{features.map(f => <div key={f.title} className={styles.featCard}><span className={styles.featIcon}>{f.icon}</span><div><div className={styles.featName}>{f.title}</div><div className={styles.featDesc}>{f.desc}</div></div></div>)}</div><div className={styles.specs}><div className={styles.specRow}><span>{t("pages")}</span><span>{t("pagesVal")}</span></div><div className={styles.specRow}><span>{t("format")}</span><span>{t("formatVal")}</span></div><div className={styles.specRow}><span>{t("lang")}</span><span>{t("langVal")}</span></div><div className={styles.specRow}><span>{t("audience")}</span><span>{t("audienceVal")}</span></div></div></div><div className={styles.formWrap}><div className={styles.formCard}>{status === "done" ? <div className={styles.success}><div style={{fontSize:"2.5rem",marginBottom:"1rem"}}>📥</div><h3>{t("successTitle")}</h3><p>{t("successMsg")}</p><a href="#" className="btnPrimary" style={{marginTop:"1.5rem",display:"inline-flex"}} onClick={e=>e.preventDefault()}>{t("successBtn")}</a></div> : <><h2 className={styles.formTitle}>{t("formTitle")}</h2><p className={styles.formSub}>{t("formSub")}</p><form className={styles.form} onSubmit={submit}><div className={styles.field}><label className={styles.label}>{t("name")}</label><input required className={styles.input} value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Jane Doe"/></div><div className={styles.field}><label className={styles.label}>{t("email")}</label><input required type="email" className={styles.input} value={form.email} onChange={e=>set("email",e.target.value)} placeholder="yamada@company.com"/></div><div className={styles.field}><label className={styles.label}>{t("company")}</label><input required className={styles.input} value={form.company} onChange={e=>set("company",e.target.value)} placeholder="Acme Corp"/></div>{status === "error" && <p style={{fontSize:"0.8rem",color:"var(--red)"}}>Send failed.</p>}<button type="submit" className="btnPrimary" style={{width:"100%",justifyContent:"center"}} disabled={status === "loading"}>{status === "loading" ? t("submitting") : t("submit")}</button><p className={styles.note}>{t("note")}</p></form></>}</div></div></div></div>
    </div>
  );
}
