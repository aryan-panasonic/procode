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
    label: "Platform",
    groups: [
      {
        title: "Capabilities",
        items: [
          { label: "Overview", href: "/platform" },
          { label: "Shelf Recognition", href: "/platform#recognition" },
          { label: "Compliance Monitoring", href: "/platform#compliance" },
          { label: "Analytics Dashboard", href: "/platform#analytics" },
          { label: "Integrations", href: "/platform#integrations" },
          { label: "Security", href: "/platform#security" }
        ]
      }
    ]
  },
  {
    label: "Solutions",
    groups: [
      {
        title: "By Format",
        items: [
          { label: "Retail Chains", href: "/solutions#retail-chains" },
          { label: "FMCG Brands", href: "/solutions#fmcg-brands" },
          { label: "Convenience Stores", href: "/solutions#convenience-stores" },
          { label: "Drug Stores", href: "/solutions#drug-stores" },
          { label: "Electronics Retailers", href: "/solutions#electronics" }
        ]
      }
    ]
  },
  {
    label: "Pricing",
    href: "/pricing"
  },
  {
    label: "Resources",
    groups: [
      {
        title: "Developer & User Resources",
        items: [
          { label: "Documentation", href: "/documentation" },
          { label: "Product Brochure", href: "/resources#brochure" },
          { label: "FAQ", href: "/resources#faq" },
          { label: "API Reference", href: "/documentation#api" }
        ]
      }
    ]
  },
  {
    label: "Support",
    groups: [
      {
        title: "Help & Contact",
        items: [
          { label: "Support Chatbot", href: "/support#chatbot" },
          { label: "Contact Support", href: "/support#contact" },
          { label: "Knowledge Base", href: "/support#knowledge-base" },
          { label: "System Status", href: "/support#status" }
        ]
      }
    ]
  },
  {
    label: "Contact",
    href: "/contact"
  }
];