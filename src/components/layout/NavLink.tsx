"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const active =
    pathname.startsWith(href);

  return (
    <Link
      href={href}
      style={{
        color: active
          ? "var(--primary)"
          : undefined
      }}
    >
      {children}
    </Link>
  );
}