"use client";

import styles from "./MegaMenu.module.css";
import Link from "next/link";

export default function MegaMenu({
  groups
}: {
  groups: any[];
}) {
  return (
    <div className={styles.menu}>
      {groups.map(group => (
        <div
          key={group.title}
          className={styles.group}
        >
          <h4>{group.title}</h4>

          {group.items.map((item: any) => (
            <Link
              key={item.href}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}