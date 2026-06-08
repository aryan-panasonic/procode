import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">

        <div className={styles.grid}>

          <div>
            <h4>Retail AI</h4>
            <p>
              AI Shelf Intelligence Platform
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}