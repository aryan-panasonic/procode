"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Header.module.css";
import LanguageSwitcher from "./LanguageSwitcher";
import MegaMenu from "./MegaMenu";
import { navigation } from "@/config/navigation";

import ThemeToggle from "../ThemeToggle";

export default function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={`container ${styles.topBarInner}`}>
          <div className={styles.topBarLinks}>
            <Link href="/documentation">Documentation</Link>
            <Link href="/support">Support</Link>
            <Link href="/company/about">Company</Link>
          </div>
          <div className={styles.topBarRight}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.inner}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>ISA</div>
            <span className={styles.logoText}>INTELLIGENT SHELF ANALYZER</span>
          </Link>

          {/* Desktop nav */}
          <nav className={styles.nav}>
            {navigation.map((item) => (
              <div
                key={item.label}
                className={styles.navItem}
                onMouseEnter={() => setOpen(item.label)}
                onMouseLeave={() => setOpen(null)}
              >
                {item.href ? (
                  <Link href={item.href} className={styles.navBtn}>{item.label}</Link>
                ) : (
                  <button type="button" className={styles.navBtn}>
                    {item.label}
                    {item.groups && <span className={styles.chevron}>▾</span>}
                  </button>
                )}
                {item.groups && open === item.label && (
                  <MegaMenu groups={item.groups} />
                )}
              </div>
            ))}
          </nav>

          {/* Right */}
          <div className={styles.right}>
            <Link href="/demo" className="btnOutline" style={{padding: '9px 16px', fontSize: '0.84rem'}}>Request Demo</Link>
            <Link href="/contact" className={styles.ctaBtn}>Contact Sales</Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={styles.mobileToggle}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ""}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ""}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className={styles.mobileDrawer}>
          {navigation.map((item) => (
            <div key={item.label}>
              {item.href ? (
                <Link href={item.href} className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                  {item.label}
                </Link>
              ) : (
                <>
                  <span className={styles.mobileLink}>{item.label}</span>
                  {item.groups?.map(g => g.items.map(it => (
                    <Link key={it.href} href={it.href} className={styles.mobileSub} onClick={() => setMobileOpen(false)}>
                      {it.label}
                    </Link>
                  )))}
                </>
              )}
            </div>
          ))}
          <div className={styles.mobileCtas}>
            <Link href="/contact" className="btnPrimary" onClick={() => setMobileOpen(false)}>Contact Sales</Link>
          </div>
        </div>
      )}
    </header>
  );
}
