"use client";
import { useEffect, useRef } from "react";
import styles from "./ShelfViz.module.css";

const ROWS = 5;
const COLS = 8;

type Status = "ok"|"violation"|"missing"|"deviation";

const GRID: Status[][] = [
  ["ok","ok","violation","ok","ok","missing","ok","ok"],
  ["ok","deviation","ok","ok","violation","ok","ok","ok"],
  ["ok","ok","ok","missing","ok","ok","deviation","ok"],
  ["violation","ok","ok","ok","ok","ok","ok","missing"],
  ["ok","ok","deviation","ok","ok","violation","ok","ok"],
];

const COLORS: Record<Status,string> = {
  ok:        "#0056b3",
  violation: "#dc3545",
  missing:   "#fd7e14",
  deviation: "#ffc107",
};

const LABELS: Record<Status,string> = {
  ok:        "適合",
  violation: "違反",
  missing:   "欠品",
  deviation: "ズレ",
};

export default function ShelfViz() {
  const lineRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    let frame: number;
    let start: number | null = null;
    const DURATION = 3000;
    const W = COLS * 52;

    function animate(ts: number) {
      if (!start) start = ts;
      const pct = ((ts - start) % DURATION) / DURATION;
      el!.setAttribute("x", String(pct * W - 4));
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const W = COLS * 52 + 8;
  const H = ROWS * 42 + 8;

  return (
    <div className={styles.wrap}>
      <div className={styles.label}>棚割コンプライアンス分析 · LIVE</div>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} xmlns="http://www.w3.org/2000/svg">
        <rect width={W} height={H} rx="6" fill="var(--ink-900)" stroke="var(--border)" strokeWidth="1"/>
        {GRID.map((row, r) =>
          row.map((status, c) => {
            const x = 4 + c * 52;
            const y = 4 + r * 42;
            const color = COLORS[status];
            return (
              <g key={`${r}-${c}`}>
                <rect x={x} y={y} width={46} height={36} rx="3"
                  fill={color} opacity={status==="ok"?0.18:0.28}
                  stroke={color} strokeWidth={status==="ok"?"0.5":"1.5"}/>
                {status !== "ok" && (
                  <>
                    <rect x={x} y={y} width={46} height={36} rx="3"
                      fill={color} opacity={0} className={styles.pulse}/>
                    <text x={x+23} y={y+22} textAnchor="middle"
                      fontSize="9" fill={color} fontWeight="600">
                      {LABELS[status]}
                    </text>
                  </>
                )}
                {status === "ok" && (
                  <text x={x+23} y={y+22} textAnchor="middle"
                    fontSize="8" fill={color} opacity={0.7}>✓</text>
                )}
              </g>
            );
          })
        )}
        <rect ref={lineRef} x="0" y="4" width="4" height={H-8} rx="2"
          fill="rgba(255,255,255,0.6)" opacity="0.7"/>
      </svg>
      <div className={styles.legend}>
        {(Object.entries(LABELS) as [Status, string][]).map(([s,l]) => (
          <div key={s} className={styles.legendItem}>
            <span style={{background:COLORS[s]}} className={styles.dot}/>
            {l}
          </div>
        ))}
      </div>
      <div className={styles.stats}>
        <div className={styles.stat}><span className={styles.statV}>87%</span><span className={styles.statL}>適合率</span></div>
        <div className={styles.stat}><span className={styles.statV} style={{color:"#dc3545"}}>5</span><span className={styles.statL}>違反</span></div>
        <div className={styles.stat}><span className={styles.statV} style={{color:"#fd7e14"}}>3</span><span className={styles.statL}>欠品</span></div>
      </div>
    </div>
  );
}
