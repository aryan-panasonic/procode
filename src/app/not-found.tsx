import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.shelf}>
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className={`${styles.slot} ${i===3||i===6?styles.empty:""}`}>
              {i!==3&&i!==6 && <div className={styles.product}/>}
              {(i===3||i===6) && <span className={styles.emptyLabel}>欠品</span>}
            </div>
          ))}
        </div>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>このページは見つかりませんでした</h1>
        <p className={styles.sub}>
          お探しのページが移動または削除された可能性があります。<br />
          URLをご確認いただくか、トップページからお探しください。
        </p>
        <div className={styles.actions}>
          <Link href="/" className="btnPrimary">
            ホームへ戻る
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link href="/support" className="btnOutline">サポートに問い合わせる</Link>
        </div>
      </div>
    </div>
  );
}
