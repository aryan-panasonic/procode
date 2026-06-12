"use client";
import {useTranslations} from "next-intl";
import {useState, type FormEvent} from "react";
import styles from "./contact.module.css";

type Status = "idle" | "loading" | "done" | "error";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [form, setForm] = useState({firstName: "", lastName: "", email: "", company: "", industry: "", stores: "", message: ""});
  const [status, setStatus] = useState<Status>("idle");

  const industryOpts = t.raw("industryOpts") as string[];
  const storeOpts = t.raw("storeOpts") as string[];
  const contactItems = t.raw("contactItems") as {icon: string, label: string, val: string}[];

  function set(k: keyof typeof form, v: string) { setForm(f => ({...f, [k]: v})); }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await fetch("/api/tickets", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          title: `${t("title1")} ${form.company || form.firstName}`,
          description: `${form.firstName} ${form.lastName} (${form.email})
${t("company")}: ${form.company}
${t("industry")}: ${form.industry}
${t("stores")}: ${form.stores}

${form.message}`,
          status: "open",
          source: "contact_form",
          metadata: {...form},
        }),
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">{t("label")}</span>
          <h1 className="sectionTitle" style={{marginTop: ".75rem"}}>
            {t("title1")}<br /><span className="gradientText">{t("title2")}</span>
          </h1>
          <p className="sectionSubtitle" style={{margin: "1rem auto 0", textAlign: "center"}}>{t("sub")}</p>
        </div>
      </div>

      <div className="container">
        <div className={styles.grid}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{t("formTitle")}</h2>
            {status === "done" ? (
              <div className={styles.success}>
                <div className={styles.successIcon}>✓</div>
                <h3>{t("successTitle")}</h3>
                <p>{t("successMsg")}</p>
              </div>
            ) : (
              <form className={styles.form} onSubmit={submit}>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>{t("lastName")}</label>
                    <input required className={styles.input} value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Smith" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t("firstName")}</label>
                    <input required className={styles.input} value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="John" />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t("email")}</label>
                  <input required type="email" className={styles.input} value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@company.com" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t("company")}</label>
                  <input required className={styles.input} value={form.company} onChange={e => set("company", e.target.value)} placeholder="Acme Corp" />
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>{t("industry")}</label>
                    <select required className={styles.input} value={form.industry} onChange={e => set("industry", e.target.value)}>
                      <option value="">...</option>
                      {industryOpts.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>{t("stores")}</label>
                    <select required className={styles.input} value={form.stores} onChange={e => set("stores", e.target.value)}>
                      <option value="">...</option>
                      {storeOpts.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>{t("message")}</label>
                  <textarea className={styles.textarea} rows={4} value={form.message} onChange={e => set("message", e.target.value)} placeholder={t("messagePlaceholder")} />
                </div>
                {status === "error" && <p className={styles.errorMsg}>{t("errorMsg")}</p>}
                <button type="submit" className={`btnPrimary ${styles.submitBtn}`} disabled={status === "loading"}>
                  {status === "loading" ? t("submitting") : t("submit")}
                  {status !== "loading" && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  )}
                </button>
                <p className={styles.formNote}>{t("formNote")}</p>
              </form>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>{t("infoTitle")}</h3>
              {[
                {n: "01", t: t("step1t"), d: t("step1d")},
                {n: "02", t: t("step2t"), d: t("step2d")},
                {n: "03", t: t("step3t"), d: t("step3d")},
                {n: "04", t: t("step4t"), d: t("step4d")},
              ].map(s => (
                <div key={s.n} className={styles.step}>
                  <span className={styles.stepNum}>{s.n}</span>
                  <div>
                    <div className={styles.stepTitle}>{s.t}</div>
                    <div className={styles.stepDesc}>{s.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.infoCard}>
              <h3 className={styles.infoTitle}>{t("contactTitle")}</h3>
              <div className={styles.contactItems}>
                {[
                  ...contactItems,
                  {icon: "🕐", label: t("contactTitle"), val: t("replyTime")}, // "Response" mapping isn't directly translated as such, just fallback.
                ].map(citem => (
                  <div key={citem.label} className={styles.contactItem}>
                    <span className={styles.contactIcon}>{citem.icon}</span>
                    <div>
                      <div className={styles.contactLabel}>{citem.label}</div>
                      <div className={styles.contactVal}>{citem.val}</div>
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
