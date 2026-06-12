"use client";

import {usePathname, useRouter} from "next/navigation";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = pathname.match(/^\/(en|ja)/)?.[1] ?? "ja";
  const isJaActive = currentLocale === "ja";

  function toggle() {
    const next = isJaActive ? "en" : "ja";
    const remainder = pathname.replace(/^\/(en|ja)/, "") || "/";
    router.push(`/${next}${remainder}`);
  }

  return (
    <button type="button" onClick={toggle} className={styles.toggle} aria-label="Toggle language">
      <span className={`${styles.opt} ${!isJaActive ? styles.active : ""}`}>EN</span>
      <span className={styles.track} aria-hidden="true">
        <span className={`${styles.thumb} ${isJaActive ? styles.thumbRight : ""}`} />
      </span>
      <span className={`${styles.opt} ${isJaActive ? styles.active : ""}`}>JA</span>
    </button>
  );
}
