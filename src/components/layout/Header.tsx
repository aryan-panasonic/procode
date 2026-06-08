"use client";

import { useState } from "react";
import Link from "next/link";

import styles from "./Header.module.css";
import LanguageSwitcher from "./LanguageSwitcher";
import MegaMenu from "./MegaMenu";

import { navigation } from "@/config/navigation";

export default function Header() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.logo}>
            Retail AI
          </div>

          <nav className={styles.nav}>
            {navigation.map((item) => (
              <div
                key={item.label}
                className={styles.navItem}
                onMouseEnter={() => setOpen(item.label)}
                onMouseLeave={() => setOpen(null)}
              >
                {item.href ? (
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <button type="button">
                    {item.label}
                  </button>
                )}

                {item.groups && open === item.label && (
                  <MegaMenu groups={item.groups} />
                )}
              </div>
            ))}
          </nav>

          <div className={styles.right}>
            <LanguageSwitcher />
            <Link
                href="/contact"
                className={styles.cta}
            >
                Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}