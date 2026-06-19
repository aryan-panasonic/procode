"use client";
import styles from "./MegaMenu.module.css";
import Link from "next/link";

import { useLocale } from "next-intl";

export default function MegaMenu({ groups }: { groups: any[] }) {
  const locale = useLocale();
  return (
    <div className={styles.menu}>
      <div className={styles.inner}>
        {groups.map(group => (
          <div key={group.title} className={styles.group}>
            <div className={styles.groupTitle}>{group.title}</div>
            {group.items.map((item: any) => {
              const href = item.href.startsWith("/" + locale) ? item.href : `/${locale}${item.href}`;
              return (
                <Link key={item.href} href={href} className={styles.item}>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
