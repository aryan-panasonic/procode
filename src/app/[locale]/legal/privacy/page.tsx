import styles from "./privacy.module.css";
import Link from "next/link";

export const metadata = {
  title:"プライバシーポリシー | INTELLIGENT SHELF ANALYZER",
  description:"パナソニック コネクト株式会社のIntelligent Shelf Analyzerにおける個人情報の取り扱いについて。",
};

const sections = [
  {
    title:"1. 取得する個人情報の種類",
    content:`本サービスの利用に際して、以下の個人情報を取得する場合があります。

• 氏名・所属会社・役職
• メールアドレス・電話番号
• ご利用のIPアドレス・ブラウザ情報
• サービス利用履歴・操作ログ
• お問い合わせ・サポートチケットの内容
• お支払いに関する情報（クレジットカード番号は直接取得しません）`,
  },
  {
    title:"2. 個人情報の利用目的",
    content:`取得した個人情報は以下の目的で利用します。

• 本サービスの提供・運営・改善
• お問い合わせへの対応
• サポートチケットの処理
• 製品情報・アップデートのご案内（同意いただいた場合）
• 不正利用の防止・セキュリティの確保
• 法的義務の履行`,
  },
  {
    title:"3. 第三者への提供",
    content:`当社は、以下の場合を除き、お客様の個人情報を第三者に提供しません。

• お客様の同意がある場合
• 法令に基づく場合
• 人の生命・身体・財産の保護のために必要な場合
• サービス提供に必要な業務委託先への提供（適切な契約を締結）`,
  },
  {
    title:"4. 個人情報の安全管理",
    content:`当社は個人情報の漏洩・滅失・毀損を防止するため、以下の措置を講じています。

• すべてのデータは転送時・保管時に暗号化（TLS 1.3 / AES-256）
• SOC2 Type II認証取得済み
• ISO 27001認証取得済み
• 定期的なセキュリティ監査の実施
• アクセス権限の最小化・ロールベースアクセス制御`,
  },
  {
    title:"5. Cookieの使用について",
    content:`本サービスではCookieおよび類似の技術を使用します。

• 必須Cookie: サービスの基本機能に必要
• 分析Cookie: サービス改善のためのアクセス解析（Google Analytics）
• 機能Cookie: ユーザー設定の保存

ブラウザの設定によりCookieを無効にすることができますが、一部機能が制限される場合があります。`,
  },
  {
    title:"6. 個人情報の開示・訂正・削除",
    content:`お客様は保有する個人情報の開示・訂正・削除を請求することができます。ご請求は下記お問い合わせ窓口までご連絡ください。なお、ご本人確認をさせていただく場合があります。`,
  },
  {
    title:"7. データの保管場所",
    content:`クラウドサービスご利用の場合、データは日本国内のデータセンターに保管されます。Enterpriseプランでは国内データ保管・オンプレミス導入も対応しています。`,
  },
  {
    title:"8. プライバシーポリシーの改定",
    content:`本ポリシーは必要に応じて改定する場合があります。重要な変更については本サービス上でお知らせします。`,
  },
  {
    title:"9. お問い合わせ窓口",
    content:`個人情報の取り扱いに関するお問い合わせ：\n\nパナソニック コネクト株式会社\n個人情報お問い合わせ窓口\nメール: privacy@isa.panasonic.com\n所在地: 東京都中央区`,
  },
];

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">Legal</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>プライバシーポリシー</h1>
          <p style={{fontSize:"0.85rem",color:"var(--slate-500)",marginTop:".5rem"}}>
            最終更新日: 2025年1月1日
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
            <Link href="/legal/terms" className={styles.tocLink}>利用規約 →</Link>
          </nav>
          <article className={styles.content}>
            <p className={styles.intro}>
              パナソニック コネクト株式会社（以下「当社」）は、INTELLIGENT SHELF ANALYZER（以下「本サービス」）の提供に際し、お客様の個人情報を適切に取り扱うことを重要な責務と認識しています。本プライバシーポリシーは、当社が取得・利用する個人情報の種類・目的・管理方法について説明します。
            </p>
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
          </article>
        </div>
      </div>
    </div>
  );
}
