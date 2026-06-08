"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function LanguageSwitcher() {
  const pathname = usePathname();

  const jaPath = pathname.replace(/^\/(ja|en)/, "/ja");
  const enPath = pathname.replace(/^\/(ja|en)/, "/en");

  return (
    <>
      <Link href={jaPath}>JA</Link>
      {" | "}
      <Link href={enPath}>EN</Link>
    </>
  );
}