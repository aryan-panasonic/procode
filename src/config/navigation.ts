export interface MenuItem {
  label: string;
  href: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface NavigationSection {
  label: string;
  href?: string;
  groups?: MenuGroup[];
}

export interface MenuItem {
  label: string;
  href: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export interface NavigationSection {
  label: string;
  href?: string;
  groups?: MenuGroup[];
}

export const navigation: NavigationSection[] = [
  {
    label: "Solutions",
    groups: [
      {
        title: "Business Type",
        items: [
          {
            label: "Retailers",
            href: "/solutions/retailers"
          },
          {
            label: "FMCG Brands",
            href: "/solutions/fmcg-brands"
          },
          {
            label: "Merchandising Teams",
            href: "/solutions/merchandising-teams"
          },
          {
            label: "Distributors",
            href: "/solutions/distributors"
          }
        ]
      }
    ]
  },

  {
    label: "Platform",
    groups: [
      {
        title: "Capabilities",
        items: [
          {
            label: "AI Product Recognition",
            href: "/platform/product-recognition"
          },
          {
            label: "Planogram Compliance",
            href: "/platform/planogram-compliance"
          },
          {
            label: "OCR & Pricing",
            href: "/platform/ocr-pricing"
          },
          {
            label: "Analytics",
            href: "/platform/analytics"
          },
          {
            label: "API Integration",
            href: "/platform/api"
          }
        ]
      }
    ]
  },

  {
    label: "Industries",
    groups: [
      {
        title: "Industry",
        items: [
          {
            label: "Supermarkets",
            href: "/industries/supermarkets"
          },
          {
            label: "Convenience Stores",
            href: "/industries/convenience-stores"
          },
          {
            label: "Drug Stores",
            href: "/industries/drug-stores"
          },
          {
            label: "Electronics Retail",
            href: "/industries/electronics"
          }
        ]
      }
    ]
  },

  {
    label: "Documentation",
    href: "/documentation"
  },

  {
    label: "Resources",
    href: "/resources"
  },

  {
    label: "Pricing",
    href: "/pricing"
  },

  {
    label: "Company",
    groups: [
      {
        title: "Company",
        items: [
          {
            label: "About",
            href: "/company/about"
          },
          {
            label: "Partners",
            href: "/company/partners"
          },
          {
            label: "Security",
            href: "/company/security"
          },
          {
            label: "Careers",
            href: "/company/careers"
          }
        ]
      }
    ]
  },

  {
    label: "Contact",
    href: "/contact"
  }
];