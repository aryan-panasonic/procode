import Link from "next/link";
import styles from "./Footer.module.css";
import {getTranslations} from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");
  const cols = [
    {
      title: t("colProduct"),
      links: [
        {label: t("links.platform"), href: "/platform"},
        {label: t("links.capabilities"), href: "/platform#capabilities"},
        {label: t("links.apiDocs"), href: "/documentation#api"},
        {label: t("links.pricing"), href: "/pricing"},
      ],
    },
    {
      title: t("colDeploy"),
      links: [
        {label: t("links.caseStudies"), href: "/case-studies"},
        {label: t("links.solutions"), href: "/solutions"},
        {label: t("links.resources"), href: "/resources"},
        {label: t("links.brochure"), href: "/brochure"},
      ],
    },
    {
      title: t("colSupport"),
      links: [
        {label: t("links.support"), href: "/support"},
        {label: t("links.faq"), href: "/documentation#faq"},
        {label: t("links.contact"), href: "/contact"},
        {label: t("links.docs"), href: "/documentation"},
      ],
    },
    {
      title: t("colCompany"),
      links: [
        {label: t("links.company"), href: "/company"},
      ],
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.topLine} />
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <div className={styles.logoRow}>
              <div className={styles.logoMark}>ISA</div>
              <div>
                <div className={styles.logoName}>INTELLIGENT SHELF ANALYZER</div>
                <div className={styles.logoPanasonic}>Panasonic Connect</div>
              </div>
            </div>
            <p className={styles.tagline}>{t("tagline")}</p>
            <div className={styles.badges}>
              <span className="tag tagCyan">SOC2 Type II</span>
              <span className="tag tagGold">ISO 27001</span>
              <span className="tag tagGreen">99.9% SLA</span>
            </div>
          </div>

          <div className={styles.links}>
            {cols.map(col => (
              <div key={col.title} className={styles.col}>
                <div className={styles.colTitle}>{col.title}</div>
                <ul className={styles.colList}>
                  {col.links.map(l => (
                    <li key={l.href}>
                      <Link href={l.href} className={styles.colLink}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.bottomLeft}>
            <span>{t("copyright")}</span>
            <div className={styles.bottomLinks}>
              <Link href="/legal/privacy" className={styles.bottomLink}>{t("privacy")}</Link>
              <Link href="/legal/terms" className={styles.bottomLink}>{t("terms")}</Link>
            </div>
          </div>
          <div className={styles.companyInfo}>{t("companyInfo")}</div>
        </div>
      </div>
    </footer>
  );
}
