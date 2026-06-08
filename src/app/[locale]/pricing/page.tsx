import Link from "next/link";

const plans = [
  {
    name: "Starter",
    desc: "For mid-size retailers and brands getting started with AI shelf intelligence.",
    price: "Contact Sales",
    popular: false,
    features: ["Up to 50 stores","AI product recognition (standard)","Planogram compliance monitoring","Monthly automated reports","Email support","API access (limited)"],
  },
  {
    name: "Professional",
    desc: "For growing operations that need real-time shelf data across hundreds of locations.",
    price: "Contact Sales",
    popular: true,
    features: ["Up to 500 stores","High-accuracy AI recognition","Real-time planogram monitoring","OCR & price intelligence","Daily reports & alerts","Priority support (EN/JP)","Full API + SDK access","Standard ERP integration","Dedicated customer success"],
  },
  {
    name: "Enterprise",
    desc: "Fully custom deployment for large retailers, FMCG brands, and multi-national operations.",
    price: "Custom",
    popular: false,
    features: ["Unlimited stores","All platform modules","Auto planogram generation AI","Custom AI model training","24/7 SLA support","On-premise / hybrid deployment","Custom ERP & system integration","Dedicated implementation team","Security audit support","Custom contracts & NDA"],
  },
];

const faqs = [
  { q:"Is there a free trial?", a:"Yes — all plans include a 30-day free trial, no credit card required." },
  { q:"Are there annual discounts?", a:"Annual contracts receive a discount versus month-to-month billing. Ask our sales team for details." },
  { q:"Can you integrate with our existing ERP?", a:"Yes. We have native connectors for SAP, Oracle, and major retail management systems. Custom integrations are also supported." },
  { q:"Is data stored locally?", a:"Enterprise clients can run on-premise or in a private cloud. All cloud deployments use SOC2-certified infrastructure." },
  { q:"What languages is support available in?", a:"Full support in English and Japanese across all plans. Enterprise plans include dedicated JP-language account management." },
];

export default function PricingPage() {
  return (
    <div style={{paddingTop:"68px", minHeight:"100vh", background:"var(--ink-950)"}}>
      {/* Hero */}
      <div style={{padding:"5rem 0 3rem", textAlign:"center"}}>
        <div className="container">
          <span className="sectionLabel">Pricing</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>Simple, <span className="gradientText">Transparent Plans</span></h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0", textAlign:"center"}}>
            All plans include a 30-day free trial. Pricing scales with the number of stores and modules activated.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container" style={{paddingBottom:"5rem"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.25rem",marginBottom:"4rem"}}>
          {plans.map(p => (
            <div key={p.name} style={{
              position:"relative", background: p.popular ? "rgba(0,200,232,0.06)" : "rgba(255,255,255,0.032)",
              border:`1px solid ${p.popular ? "rgba(0,200,232,0.28)" : "rgba(255,255,255,0.07)"}`,
              borderRadius:"var(--radius-xl)", padding:"2rem",
              display:"flex", flexDirection:"column", gap:"1rem"
            }}>
              {p.popular && (
                <div style={{
                  position:"absolute", top:"-14px", left:"50%", transform:"translateX(-50%)",
                  background:"var(--cyan)", color:"var(--ink-950)", fontSize:".72rem",
                  fontWeight:700, padding:"4px 16px", borderRadius:"100px", whiteSpace:"nowrap"
                }}>Most Popular</div>
              )}
              <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",borderRadius:"2px 2px 0 0",background:p.popular?"var(--cyan)":"rgba(255,255,255,0.1)"}} />
              <h3 style={{fontFamily:"var(--font-display)",fontSize:"1.3rem",fontWeight:700,color:"var(--text-primary)"}}>{p.name}</h3>
              <p style={{fontSize:".82rem",color:"var(--slate-400)",lineHeight:1.7}}>{p.desc}</p>
              <div style={{fontFamily:"var(--font-mono)",fontSize:"1.5rem",fontWeight:500,color:p.popular?"var(--cyan)":"var(--text-primary)"}}>{p.price}</div>
              <ul style={{display:"flex",flexDirection:"column",gap:"8px",flex:1}}>
                {p.features.map(f => (
                  <li key={f} style={{display:"flex",alignItems:"flex-start",gap:"8px",fontSize:".82rem",color:"var(--slate-300)"}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5" style={{marginTop:"2px",flexShrink:0}}><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/contact" style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                padding:"12px", borderRadius:"var(--radius)", fontWeight:600, fontSize:".88rem",
                background:p.popular?"var(--cyan)":"transparent",
                color:p.popular?"var(--ink-950)":"var(--text-primary)",
                border:`1px solid ${p.popular?"var(--cyan)":"rgba(255,255,255,0.2)"}`,
                transition:"var(--ease)"
              }}>
                {p.popular ? "Get Started" : "Contact Sales"}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="sectionTitle" style={{textAlign:"center",marginBottom:"2.5rem"}}>Frequently Asked <span className="gradientText">Questions</span></h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"1.25rem",marginBottom:"3rem"}}>
          {faqs.map(faq => (
            <div key={faq.q} style={{background:"rgba(255,255,255,0.032)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"var(--radius-lg)",padding:"1.5rem"}}>
              <h3 style={{fontFamily:"var(--font-display)",fontSize:"1rem",fontWeight:600,color:"var(--text-primary)",marginBottom:".65rem"}}>{faq.q}</h3>
              <p style={{fontSize:".82rem",color:"var(--slate-400)",lineHeight:1.8}}>{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1.5rem",
          background:"rgba(0,200,232,0.06)", border:"1px solid rgba(0,200,232,0.18)",
          borderRadius:"var(--radius-xl)", padding:"2.5rem"
        }}>
          <div>
            <h3 style={{fontFamily:"var(--font-display)",fontSize:"1.2rem",fontWeight:700,color:"var(--text-primary)",marginBottom:".5rem"}}>Large enterprise or complex requirements?</h3>
            <p style={{fontSize:".85rem",color:"var(--slate-400)"}}>Our solutions engineers will scope a custom deployment and pricing for your needs.</p>
          </div>
          <Link href="/contact" className="btnPrimary">Talk to Enterprise Sales</Link>
        </div>
      </div>
    </div>
  );
}
