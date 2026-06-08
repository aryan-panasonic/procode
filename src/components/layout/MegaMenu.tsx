"use client";
import styles from "./MegaMenu.module.css";
import Link from "next/link";

export default function MegaMenu({ groups }: { groups: any[] }) {
  return (
    <div className={styles.menu}>
      <div className={styles.inner}>
        {groups.map(group => (
          <div key={group.title} className={styles.group}>
            <div className={styles.groupTitle}>{group.title}</div>
            {group.items.map((item: any) => (
              <Link key={item.href} href={item.href} className={styles.item}>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
