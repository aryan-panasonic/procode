import Link from "next/link";
import styles from "./terms.module.css";

export const metadata = {
  title:"利用規約 | INTELLIGENT SHELF ANALYZER",
  description:"INTELLIGENT SHELF ANALYZERの利用規約。サービスのご利用前に必ずお読みください。",
};

const sections = [
  {
    title:"第1条（適用）",
    content:"本規約は、パナソニック コネクト株式会社（以下「当社」）が提供するINTELLIGENT SHELF ANALYZER（以下「本サービス」）の利用に関し、当社とお客様との間に適用されます。本サービスを利用した時点で、本規約に同意したものとみなします。",
  },
  {
    title:"第2条（利用登録）",
    content:"本サービスの利用を希望する法人または個人は、当社が定める方法で申し込みを行い、当社が承認した場合に利用登録が完了します。未成年者や権限のない方の利用登録は認められません。",
  },
  {
    title:"第3条（利用料金）",
    content:"本サービスの利用料金は、別途定める料金プランに従います。料金プランの変更は、次の契約更新日より適用されます。料金の支払いが遅延した場合、当社はサービスを一時停止する場合があります。",
  },
  {
    title:"第4条（禁止事項）",
    content:`本サービスの利用にあたり、以下の行為を禁止します。

• 法令または本規約に違反する行為
• 当社または第三者の権利・利益を侵害する行為
• 本サービスを通じた不正アクセスまたはリバースエンジニアリング
• 虚偽の情報を提供する行為
• 他のユーザーへの迷惑行為
• 本サービスの商業的転売または再配布`,
  },
  {
    title:"第5条（知的財産権）",
    content:"本サービスに関する知的財産権（ソフトウェア、アルゴリズム、デザイン等）は当社に帰属します。お客様は、本規約の範囲内でのみ本サービスを利用する権利を有します。",
  },
  {
    title:"第6条（データの取り扱い）",
    content:"お客様が本サービスに入力または生成したデータの権利はお客様に帰属します。当社は、サービスの提供・改善目的のためにデータを処理しますが、第三者への提供は行いません（法令に基づく場合を除く）。",
  },
  {
    title:"第7条（サービスの停止・変更）",
    content:"当社は、メンテナンス・障害・その他やむを得ない事情により、予告なく本サービスを停止または変更する場合があります。ただし、計画的なメンテナンスは事前にお知らせします。",
  },
  {
    title:"第8条（免責事項）",
    content:"当社は、本サービスの利用によって生じた損害について、当社の故意または重大な過失がある場合を除き、責任を負いません。本サービスの稼働率は99.9%を目標としますが、完全な稼働を保証するものではありません。",
  },
  {
    title:"第9条（契約の解除）",
    content:"お客様は、当社が定める手続きに従い、いつでも本サービスの解約を申し込むことができます。当社は、お客様が本規約に違反した場合、事前通知なく利用停止または契約を解除する場合があります。",
  },
  {
    title:"第10条（準拠法・管轄）",
    content:"本規約は日本法に準拠します。本規約に関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。",
  },
  {
    title:"第11条（規約の変更）",
    content:"当社は本規約を変更する場合があります。重要な変更については、本サービス上または登録メールアドレスへの通知により、事前にお知らせします。変更後も継続してサービスを利用した場合、変更に同意したものとみなします。",
  },
];

export default function TermsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">Legal</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>利用規約</h1>
          <p style={{fontSize:"0.85rem",color:"var(--slate-500)",marginTop:".5rem"}}>
            最終更新日: 2025年1月1日 | 施行日: 2025年1月1日
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.layout}>
          <nav className={styles.toc}>
            <div className={styles.tocTitle}>目次</div>
            {sections.map((s,i) => (
              <a key={i} href={`#sec-${i}`} className={styles.tocLink}>{s.title}</a>
            ))}
            <div className={styles.tocDivider}/>
            <Link href="/legal/privacy" className={styles.tocLink}>プライバシーポリシー →</Link>
          </nav>
          <article className={styles.content}>
            <div className={styles.notice}>
              本規約は、本サービスの利用を開始する前に必ずお読みください。本サービスを利用することにより、本規約に同意したものとみなされます。
            </div>
            {sections.map((s,i) => (
              <section key={i} id={`sec-${i}`} className={styles.sec}>
                <h2 className={styles.secTitle}>{s.title}</h2>
                <div className={styles.secContent}>
                  {s.content.split("\n").map((line,j) => (
                    <p key={j} style={{marginBottom:line.startsWith("•")?"0.25rem":"0"}}>{line}</p>
                  ))}
                </div>
              </section>
            ))}
            <div className={styles.company}>
              パナソニック コネクト株式会社<br />
              〒104-0061 東京都中央区銀座<br />
              法人番号: 4010001182655<br />
              お問い合わせ: legal@isa.panasonic.com
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
