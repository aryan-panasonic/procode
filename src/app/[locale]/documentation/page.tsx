import Link from "next/link";
import styles from "./docs.module.css";

const sections = [
  {
    title: "Getting Started",
    icon: "🚀",
    links: ["Introduction","Quick Start Guide","Authentication","Your First API Call","SDK Setup"],
  },
  {
    title: "Product Catalog APIs",
    icon: "📦",
    links: ["List SKUs","Create SKU","Update SKU","Delete SKU","Bulk Import"],
  },
  {
    title: "Shelf Analysis APIs",
    icon: "🔍",
    links: ["Submit Shelf Image","Get Analysis Report","Compliance Score","Out-of-Stock Detection","Historical Reports"],
  },
  {
    title: "Planogram APIs",
    icon: "📋",
    links: ["Upload Planogram","Compare vs Reality","Deviation Report","Auto-Generate Planogram","Planogram Versions"],
  },
  {
    title: "OCR & Pricing APIs",
    icon: "💰",
    links: ["Price Tag OCR","Price Monitoring","Competitor Pricing","Price Alert Configuration","Price History"],
  },
  {
    title: "SDKs & Tools",
    icon: "🛠️",
    links: ["Python SDK","Node.js SDK","Java SDK","CLI Tool","Postman Collection"],
  },
];

const quickLinks = [
  { label: "API Reference", href: "#", desc: "Full endpoint documentation" },
  { label: "Authentication Guide", href: "#", desc: "API keys, OAuth, JWT" },
  { label: "Rate Limits", href: "#", desc: "Quotas and throttling" },
  { label: "Changelog", href: "#", desc: "Latest releases and updates" },
  { label: "OpenAPI Spec", href: "#", desc: "Download swagger.yaml" },
  { label: "Status Page", href: "#", desc: "System uptime and incidents" },
];

export default function DocumentationPage() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.docHeader}>
        <div className="container">
          <span className="sectionLabel">Documentation</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>Developer <span className="gradientText">Reference</span></h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            Everything you need to integrate INTELLIGENT SHELF ANALYZER into your systems.
          </p>
          <div className={styles.searchBar}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search documentation..." className={styles.searchInput} />
            <span className={styles.searchHint}>⌘K</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sideSection}>
              <div className={styles.sideLabel}>Quick Links</div>
              {quickLinks.map(l => (
                <Link key={l.label} href={l.href} className={styles.sideLink}>
                  <span className={styles.sideLinkTitle}>{l.label}</span>
                  <span className={styles.sideLinkDesc}>{l.desc}</span>
                </Link>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className={styles.main}>
            <div className={styles.grid}>
              {sections.map(sec => (
                <div key={sec.title} className={styles.secCard}>
                  <div className={styles.secHead}>
                    <span className={styles.secIcon}>{sec.icon}</span>
                    <h2 className={styles.secTitle}>{sec.title}</h2>
                  </div>
                  <ul className={styles.secLinks}>
                    {sec.links.map(l => (
                      <li key={l}>
                        <Link href="#" className={styles.docLink}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
                            <path d="M14 2v6h6"/>
                          </svg>
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Code sample */}
            <div className={styles.codeCard}>
              <div className={styles.codeHeader}>
                <span className={styles.codeTitle}>Quick Start — Submit a shelf image</span>
                <span className="tag tagCyan">Python</span>
              </div>
              <pre className={styles.code}>{`import shelfai

client = shelfai.Client(api_key="your_api_key")

# Submit a shelf image for analysis
result = client.analyze_shelf(
    image_path="shelf_photo.jpg",
    store_id="store_001",
    planogram_id="planogram_v2"
)

print(f"Compliance score: {result.compliance_score}%")
print(f"Out-of-stock items: {result.out_of_stock}")
print(f"Price deviations: {result.price_deviations}")`}</pre>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
