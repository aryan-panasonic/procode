"use client";

import {useEffect, useState, type CSSProperties} from "react";
import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import styles from "./Header.module.css";
import LanguageSwitcher from "./LanguageSwitcher";
import MegaMenu from "./MegaMenu";
import ThemeToggle from "../ThemeToggle";
import {getNavigation} from "@/config/navigation";

interface TicketForm { name: string; email: string; phone: string; message: string; }

function SupportModal({onClose}: {onClose: () => void}) {
  const t = useTranslations("ticketModal");
  const text = {
    title: t("title"),
    name: t("name"),
    email: t("email"),
    phone: t("phone"),
    message: t("message"),
    submit: t("submit"),
    submitting: t("submitting"),
    cancel: t("cancel"),
    placeholder: t("placeholder"),
    success: t("success"),
    successSub: t("successSub"),
    close: t("close"),
    failed: t("failed"),
  };

  const [form, setForm] = useState<TicketForm>({name: "", email: "", phone: "", message: ""});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!form.message.trim()) {
      setError(text.placeholder);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const draftRes = await fetch("/api/tickets/draft", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({messages: [{role: "user", content: form.message}]}),
      });
      const draftData = await draftRes.json();
      if (draftData.error) throw new Error(draftData.error);

      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          title: draftData.draft.title,
          summary: form.message,
          category: draftData.draft.category,
          priority: draftData.draft.priority,
          customer_name: form.name || undefined,
          customer_email: form.email || undefined,
          customer_phone: form.phone || undefined,
          conversation_summary: draftData.conversationSummary,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDone(true);
    } catch (e: any) {
      setError(e.message ?? text.failed);
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle = (extra?: CSSProperties): CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 12px",
    borderRadius: 6,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#f3f4f6",
    fontSize: 13,
    outline: "none",
    ...extra,
  });

  return (
    <div onClick={onClose} style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 28, width: "100%", maxWidth: 460}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
          <span style={{fontSize: 17, fontWeight: 700, color: "#f3f4f6"}}>🎫 {text.title}</span>
          <button onClick={onClose} style={{background: "none", border: "none", color: "#9ca3af", fontSize: 20, cursor: "pointer", lineHeight: 1}}>×</button>
        </div>

        {done ? (
          <div style={{textAlign: "center", padding: "24px 0"}}>
            <div style={{fontSize: 36, marginBottom: 12}}>✅</div>
            <div style={{fontSize: 15, fontWeight: 600, color: "#86efac"}}>{text.success}</div>
            <div style={{fontSize: 13, color: "#6b7280", marginTop: 6}}>{text.successSub}</div>
            <button onClick={onClose} style={{marginTop: 20, padding: "9px 24px", borderRadius: 6, border: "none", background: "#1d4ed8", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer"}}>{text.close}</button>
          </div>
        ) : (
          <>
            <div style={{display: "flex", flexDirection: "column", gap: 10}}>
              <input style={fieldStyle()} placeholder={text.name} value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
              <input style={fieldStyle()} placeholder={text.email} type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
              <input style={fieldStyle()} placeholder={text.phone} value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
              <textarea rows={4} style={fieldStyle({resize: "vertical", minHeight: 90})} placeholder={text.message} value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} />
            </div>
            {error && <div style={{marginTop: 10, fontSize: 12, color: "#f87171"}}>{error}</div>}
            <div style={{display: "flex", gap: 10, marginTop: 16}}>
              <button onClick={submit} disabled={loading} style={{flex: 1, padding: "10px 0", borderRadius: 6, border: "none", background: "#1d4ed8", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: loading ? 0.7 : 1}}>
                {loading ? text.submitting : text.submit}
              </button>
              <button onClick={onClose} style={{padding: "10px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#9ca3af", fontSize: 13, cursor: "pointer"}}>{text.cancel}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Header() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const megaT = useTranslations("megaMenu");
  const navigation = getNavigation(t, megaT);
  const [open, setOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, {passive: true});
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarInner}`}>
          <div className={styles.topBarLinks}>
            <Link href="/documentation">{megaT("docs")}</Link>
            <Link href="/support">{megaT("help")}</Link>
            <Link href="/company">{megaT("company")}</Link>
          </div>
          <div className={styles.topBarRight}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.inner}>
          <Link href={`/${locale}`} className={styles.logo}>
            <div className={styles.logoMark}>ISA</div>
            <span className={styles.logoText}>INTELLIGENT SHELF ANALYZER</span>
          </Link>

          <nav className={styles.nav}>
            {navigation.map(item => (
              <div key={item.label} className={styles.navItem} onMouseEnter={() => setOpen(item.label)} onMouseLeave={() => setOpen(null)}>
                {item.href ? (
                  <Link href={item.href} className={styles.navBtn}>{item.label}</Link>
                ) : (
                  <button type="button" className={styles.navBtn}>
                    {item.label}
                    {item.groups && <span className={styles.chevron}>▾</span>}
                  </button>
                )}
                {item.groups && open === item.label && <MegaMenu groups={item.groups} />}
              </div>
            ))}
          </nav>

          <div className={styles.right}>
            <button onClick={() => setShowSupport(true)} className="btnOutline" style={{padding: "9px 16px", fontSize: "0.84rem"}}>{t("support")}</button>
            <Link href="/contact" className={styles.ctaBtn}>{t("cta")}</Link>
          </div>

          <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ""}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ""}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ""}`} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={styles.mobileDrawer}>
          {navigation.map(item => (
            <div key={item.label}>
              {item.href ? (
                <Link href={item.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>{item.label}</Link>
              ) : (
                <>
                  <span className={styles.mobileLink}>{item.label}</span>
                  {item.groups?.map(g => g.items.map(it => (
                    <Link key={it.href} href={it.href} className={styles.mobileSub} onClick={() => setMobileOpen(false)}>{it.label}</Link>
                  )))}
                </>
              )}
            </div>
          ))}
          <div className={styles.mobileCtas}>
            <button className="btnPrimary" onClick={() => {setMobileOpen(false); setShowSupport(true);}}>{t("support")}</button>
            <Link href="/contact" className="btnPrimary" onClick={() => setMobileOpen(false)}>{t("cta")}</Link>
          </div>
        </div>
      )}

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </header>
  );
}
