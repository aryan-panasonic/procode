export default function Challenges() {
  const items = [
    "Manual shelf audits",
    "Price monitoring complexity",
    "Poor planogram compliance",
    "Slow reporting cycles",
    "Limited retail visibility"
  ];

  return (
    <section className="section">
      <div className="container">

        <h2 className="sectionTitle">
          Retail Challenges
        </h2>

        <div>
          {items.map(item => (
            <div key={item}>
              {item}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}