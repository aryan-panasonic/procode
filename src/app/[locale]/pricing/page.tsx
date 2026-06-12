"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./pricing.module.css";

const plans = [
  {
    id:"starter", name:"Starter", nameJa:"スターター",
    desc:"AIシェルフ管理を始める中規模チェーン向け",
    priceNote:"要お見積もり",
    highlight:false,
    badge:null,
  },
  {
    id:"pro", name:"Professional", nameJa:"プロフェッショナル",
    desc:"数百店舗規模のリアルタイム棚管理に",
    priceNote:"要お見積もり",
    highlight:true,
    badge:"最も選ばれています",
  },
  {
    id:"enterprise", name:"Enterprise", nameJa:"エンタープライズ",
    desc:"大規模展開・カスタム要件に完全対応",
    priceNote:"カスタム見積",
    highlight:false,
    badge:null,
  },
];

type V = boolean | string | null;
const matrix: {category: string; rows: {label: string; vals: V[]}[]}[] = [
  {
    category:"ストア規模",
    rows:[
      {label:"対応店舗数",vals:["〜50店舗","〜500店舗","無制限"]},
      {label:"月間画像処理数",vals:["10,000","100,000","無制限"]},
      {label:"ユーザーアカウント",vals:["10","100","無制限"]},
    ],
  },
  {
    category:"棚割AIモジュール",
    rows:[
      {label:"AI棚割認識 (標準)",vals:[true,true,true]},
      {label:"AI棚割認識 (高精度)",vals:[false,true,true]},
      {label:"プラノグラムコンプライアンス",vals:[true,true,true]},
      {label:"リアルタイム監視",vals:[false,true,true]},
      {label:"OCR価格インテリジェンス",vals:[false,true,true]},
      {label:"プラノグラム自動生成AI",vals:[false,false,true]},
      {label:"カスタムAIモデル学習",vals:[false,false,true]},
    ],
  },
  {
    category:"レポート・分析",
    rows:[
      {label:"自動レポート生成",vals:["月次","日次","リアルタイム"]},
      {label:"ダッシュボード",vals:[true,true,true]},
      {label:"エグゼクティブレポート",vals:[false,true,true]},
      {label:"カスタムKPI設定",vals:[false,true,true]},
      {label:"データエクスポート",vals:["CSV","CSV/Excel","CSV/Excel/API"]},
    ],
  },
  {
    category:"API・連携",
    rows:[
      {label:"REST API",vals:["制限あり","フルアクセス","フルアクセス"]},
      {label:"Webhook",vals:[false,true,true]},
      {label:"SDK (Python/Node.js/Java)",vals:[false,true,true]},
      {label:"SAP / Oracle コネクタ",vals:[false,"標準コネクタ","カスタム連携"]},
      {label:"サンドボックス環境",vals:[true,true,true]},
    ],
  },
  {
    category:"インフラ・セキュリティ",
    rows:[
      {label:"展開方式",vals:["クラウド","クラウド","クラウド / オンプレ / ハイブリッド"]},
      {label:"日本国内データ保管",vals:[true,true,true]},
      {label:"SOC2 Type II",vals:[true,true,true]},
      {label:"ISO 27001",vals:[false,true,true]},
      {label:"セキュリティ監査支援",vals:[false,false,true]},
      {label:"SLA",vals:["99.5%","99.9%","99.9%+カスタム"]},
    ],
  },
  {
    category:"サポート",
    rows:[
      {label:"メールサポート",vals:[true,true,true]},
      {label:"優先サポート (日本語)",vals:[false,true,true]},
      {label:"24時間サポート",vals:[false,false,true]},
      {label:"専任カスタマーサクセス",vals:[false,"オプション",true]},
      {label:"導入支援チーム",vals:[false,false,true]},
      {label:"トレーニング",vals:["オンライン","オンライン+オンサイト","カスタム"]},
    ],
  },
];

const faqs = [
  {q:"無料トライアルはありますか？",a:"全プランで30日間の無料トライアルをご利用いただけます。クレジットカード不要です。"},
  {q:"年間契約と月次契約の違いは？",a:"年間契約の場合、月次契約と比較して割引が適用されます。詳細は営業担当にお問い合わせください。"},
  {q:"既存のERPシステムと連携できますか？",a:"SAP・Oracle・主要な小売管理システム向けのネイティブコネクタをご用意しています。カスタム連携も対応可能です。"},
  {q:"オンプレミス導入は可能ですか？",a:"Enterpriseプランではオンプレミス・プライベートクラウド・ハイブリッド構成に対応しています。"},
  {q:"プランのアップグレードはいつでもできますか？",a:"はい、いつでもアップグレードが可能です。変更は翌月から反映されます。"},
];

function Cell({v}: {v:V}) {
  if (v === true) return <span className={styles.yes}>✓</span>;
  if (v === false) return <span className={styles.no}>—</span>;
  return <span className={styles.str}>{v}</span>;
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number|null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container" style={{textAlign:"center"}}>
          <span className="sectionLabel">料金プラン / Pricing</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>
            貴社の規模に合わせた<span className="gradientText">柔軟なプラン</span>
          </h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0"}}>
            50店舗の中規模チェーンから数千店舗の大規模展開まで、貴社に最適なプランをご用意しています。
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.planCards}>
          {plans.map(p => (
            <div key={p.id} className={`${styles.planCard}${p.highlight?" "+styles.planHighlight:""}`}>
              {p.badge && <div className={styles.planBadge}>{p.badge}</div>}
              <div className={styles.planName}>{p.nameJa}</div>
              <div className={styles.planNameEn}>{p.name}</div>
              <p className={styles.planDesc}>{p.desc}</p>
              <div className={styles.planPrice}>{p.priceNote}</div>
              <Link href="/contact" className={p.highlight?"btnPrimary":"btnOutline"} style={{width:"100%",justifyContent:"center",marginTop:"auto"}}>
                お問い合わせ
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.matrixWrap}>
          <h2 className={styles.matrixTitle}>機能比較表</h2>
          <div className={styles.matrixScroll}>
            <table className={styles.matrix}>
              <thead>
                <tr>
                  <th className={styles.thFeature}>機能</th>
                  {plans.map(p=>(
                    <th key={p.id} className={`${styles.thPlan}${p.highlight?" "+styles.thHighlight:""}`}>
                      {p.nameJa}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map(cat => (
                  <>
                    <tr key={cat.category} className={styles.catRow}>
                      <td colSpan={4} className={styles.catLabel}>{cat.category}</td>
                    </tr>
                    {cat.rows.map(row => (
                      <tr key={row.label} className={styles.dataRow}>
                        <td className={styles.featureLabel}>{row.label}</td>
                        {row.vals.map((v,i)=>(
                          <td key={i} className={`${styles.cell}${plans[i].highlight?" "+styles.cellHighlight:""}`}>
                            <Cell v={v}/>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.faqSection}>
          <h2 className={styles.faqTitle}>よくある質問</h2>
          <div className={styles.faqs}>
            {faqs.map((f,i)=>(
              <div key={i} className={styles.faqItem} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
                <div className={styles.faqQ}>
                  <span>{f.q}</span>
                  <span className={styles.faqChevron}>{openFaq===i?"▲":"▼"}</span>
                </div>
                {openFaq===i && <p className={styles.faqA}>{f.a}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.ctaStrip}>
          <div>
            <h2 className={styles.ctaTitle}>まずは気軽にご相談ください</h2>
            <p className={styles.ctaSub}>貴社の規模・要件に合わせた最適なプランを提案します。30日間無料トライアルも実施中。</p>
          </div>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            <Link href="/contact" className="btnPrimary">デモを依頼する</Link>
            <Link href="/brochure" className="btnOutline">資料ダウンロード</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
