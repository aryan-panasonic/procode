"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./LanguageSwitcher.module.css";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const ja = pathname.replace(/^\/(ja|en)/, "/ja");
  const en = pathname.replace(/^\/(ja|en)/, "/en");
  return (
    <div className={styles.switcher}>
      <Link href={ja} className={styles.link}>JA</Link>
      <span className={styles.sep}>/</span>
      <Link href={en} className={styles.link}>EN</Link>
    </div>
  );
}
