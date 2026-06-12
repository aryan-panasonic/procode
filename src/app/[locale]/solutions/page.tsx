import Link from "next/link";
import styles from "./solutions.module.css";

const solutions = [
  {
    slug:"retailers", icon:"🛒", title:"小売業",
    headline:"全店舗の棚をリアルタイムで完全可視化",
    desc:"すべての通路、すべての店舗でリアルタイムのコンプライアンス監視。欠品・位置ズレ・価格エラーを売上損失になる前にAIが検出します。",
    stats:[{v:"30%",l:"機会損失削減"},{v:"94%",l:"達成コンプライアンス率"},{v:"0.3s",l:"棚別処理速度"}],
    features:["リアルタイム棚割コンプライアンス監視","欠品検知・アラート","OCR価格タグ確認","プラノグラム逸脱自動レポート","フィールドスタッフモバイルワークフロー","店舗パフォーマンスベンチマーク"],
  },
  {
    slug:"fmcg-brands", icon:"🏷️", title:"FMCGブランド",
    headline:"棚シェアを把握し、競合を圧倒する",
    desc:"全小売パートナーでのAI計測棚シェア。これまで得られなかった精度で、ブランドプレゼンス・フェイシングコンプライアンス・競合ポジションを追跡。",
    stats:[{v:"18%",l:"棚シェア向上"},{v:"3×",l:"インサイト提供速度"},{v:"100%",l:"パートナーカバレッジ"}],
    features:["リアルタイム棚シェア計測","フェイシングコンプライアンス追跡","競合棚スペース分析","ブランドプレゼンスヒートマップ","パートナーパフォーマンス評価","プロモーションコンプライアンス確認"],
  },
  {
    slug:"merchandising-teams", icon:"📋", title:"MDチーム",
    headline:"棚割監査を数時間から数分へ",
    desc:"スマートフォンで撮影するだけ。AIが自動分析・レポート生成。手動監査工数の75%を削減し、担当者は測定でなく改善に集中できます。",
    stats:[{v:"75%",l:"監査工数削減"},{v:"10×",l:"1日あたり監査店舗数"},{v:"95%",l:"レポート精度"}],
    features:["モバイル撮影ワークフロー","プラノグラム自動差異分析","ワンクリックコンプライアンスレポート出力","是正タスク自動割り当て","ルート最適化提案","監査履歴・分析トレイル"],
  },
  {
    slug:"distributors", icon:"🚚", title:"流通・卸業",
    headline:"エリア全体の在庫状況をダッシュボードで把握",
    desc:"単一ダッシュボードで配送エリア全体の商品在庫を監視。欠品リスクを早期検知し、補充最適化で欠品率を22%削減。",
    stats:[{v:"22%",l:"欠品削減率"},{v:"15%",l:"補充効率向上"},{v:"48h",l:"欠品警告の早期化"}],
    features:["エリアワイド在庫ダッシュボード","欠品リスク予測","補充スケジュール最適化","地域別市場インテリジェンス","SKUパフォーマンス分析","小売業者コンプライアンス評価"],
  },
];

export default function SolutionsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <span className="sectionLabel">ソリューション / Solutions</span>
          <h1 className="sectionTitle" style={{marginTop:".75rem"}}>
            業態に最適化された<span className="gradientText">専用ソリューション</span>
          </h1>
          <p className="sectionSubtitle" style={{margin:"1rem auto 0",textAlign:"center"}}>
            小売業・FMCGブランド・MD担当・流通業、各ロールの課題に特化したワークフロー設計。
          </p>
        </div>
      </div>

      <div className="container" style={{paddingBottom:"5rem"}}>
        <div className={styles.solutionsList}>
          {solutions.map((s, i) => (
            <div key={s.slug} className={`${styles.solutionRow} ${i % 2 === 1 ? styles.solutionRowReverse : ""}`}>
              {/* Text */}
              <div className={styles.solutionText}>
                <div className={styles.solutionTag}>
                  <span className={styles.solutionIcon}>{s.icon}</span>
                  <span className={styles.solutionLabel}>{s.title}</span>
                </div>
                <h2 className={styles.solutionTitle}>{s.headline}</h2>
                <p className={styles.solutionDesc}>{s.desc}</p>
                <div className={styles.statsRow}>
                  {s.stats.map(st => (
                    <div key={st.l} className={styles.stat}>
                      <div className={styles.statVal}>{st.v}</div>
                      <div className={styles.statLbl}>{st.l}</div>
                    </div>
                  ))}
                </div>
                <Link href={`/contact`} className="btnPrimary" style={{marginTop:"1rem",display:"inline-flex"}}>
                  デモを依頼する →
                </Link>
              </div>
              {/* Feature list */}
              <div className={styles.featuresCard}>
                <div className={styles.featuresTitle}>主要機能</div>
                <ul className={styles.featuresList}>
                  {s.features.map(f => (
                    <li key={f} className={styles.featuresItem}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
