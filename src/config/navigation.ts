export interface MenuItem { label: string; href: string; }
export interface MenuGroup { title: string; items: MenuItem[]; }
export interface NavigationSection { label: string; href?: string; groups?: MenuGroup[]; }

export function getNavigation(navT: (key: string) => string, megaT: (key: string) => string): NavigationSection[] {
  return [
    {
      label: navT("platform"),
      groups: [
        {
          title: megaT("features"),
          items: [
            { label: megaT("overview"), href: "/platform" },
            { label: megaT("shelfRec"), href: "/platform#recognition" },
            { label: megaT("planogram"), href: "/platform#compliance" },
            { label: megaT("ocrPrice"), href: "/platform#ocr" },
            { label: megaT("analytics"), href: "/platform#analytics" },
            { label: megaT("apiIntegration"), href: "/platform#api" },
          ],
        },
        {
          title: megaT("techSec"),
          items: [
            { label: megaT("techSpecs"), href: "/platform#specs" },
            { label: megaT("techSec").split("&")[1]?.trim() || megaT("techSec").split("・")[1] || "Security", href: "/platform#security" },
            { label: megaT("apiDocs"), href: "/documentation#api" },
          ],
        },
      ],
    },
    {
      label: navT("solutions"),
      groups: [
        {
          title: megaT("byFormat"),
          items: [
            { label: megaT("supermarkets"), href: "/solutions#retail-chains" },
            { label: megaT("cvs"), href: "/solutions#convenience-stores" },
            { label: megaT("drugStores"), href: "/solutions#drug-stores" },
            { label: megaT("fmcg"), href: "/solutions#fmcg-brands" },
            { label: megaT("electronics"), href: "/solutions#electronics" },
          ],
        },
      ],
    },
    { label: navT("pricing"), href: "/pricing" },
    {
      label: navT("caseStudies"),
      groups: [
        {
          title: megaT("byFormat"),
          items: [
            { label: megaT("allCases"), href: "/case-studies" },
            { label: megaT("supermarkets").replace("s", ""), href: "/case-studies/retail-chain-compliance" },
            { label: megaT("cvs").split(" ")[0] || "Convenience", href: "/case-studies/convenience-oos" },
            { label: megaT("drugStores").replace("s", ""), href: "/case-studies/drugstore-planogram" },
            { label: megaT("fmcg").split(" ")[0] + " & Distribution", href: "/case-studies/fmcg-shelf-share" },
          ],
        },
      ],
    },
    {
      label: navT("resources"),
      groups: [
        {
          title: megaT("docs"),
          items: [
            { label: megaT("docs"), href: "/documentation" },
            { label: megaT("apiDocs").split(" ")[0] + " Reference", href: "/documentation#api" },
            { label: megaT("productPdf"), href: "/brochure" },
          ],
        },
        {
          title: megaT("company"),
          items: [
            { label: megaT("about"), href: "/company" },
          ],
        },
      ],
    },
    {
      label: navT("support"),
      groups: [
        {
          title: megaT("help"),
          items: [
            { label: megaT("supportCenter"), href: "/support" },
            { label: megaT("contactUs"), href: "/contact" },
            { label: megaT("faq"), href: "/documentation#faq" },
          ],
        },
      ],
    },
  ];
}
