export interface CaseStudy {
  slug: string;
  industry: string;
  category: "retail"|"convenience"|"drugstore"|"fmcg";
  company: string;
  challenge: string;
  metric: string;
  metricLabel: string;
  summary: string;
  challenges: string[];
  solution: string;
  solutionPoints: string[];
  results: {value:string; label:string; detail:string}[];
  quote: string;
  quoteAuthor: string;
  modules: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    slug:"retail-chain-compliance",
    industry:"スーパーマーケットチェーン",
    category:"retail",
    company:"大手スーパーマーケットチェーン（300店舗）",
    challenge:"棚割監査時間を75%削減",
    metric:"75%",
    metricLabel:"棚監査時間削減",
    summary:"月次の棚割監査に多大な人的コストをかけていた大手SMチェーンが、ISAの導入で監査工数を大幅に圧縮し、コンプライアンス率を向上させた事例。",
    challenges:["月次棚割監査に1店舗あたり平均4時間を費やしていた","本部と店舗の認識齟齬によりプラノグラム遵守率が低迷","欠品・位置ズレの発見から是正完了まで平均3日かかっていた"],
    solution:"ISAのAI棚割認識エンジンとプラノグラムコンプライアンス機能を300店舗に展開。店員がスマートフォンで棚を撮影するだけで即座に違反箇所を検出・通知。",
    solutionPoints:["スマートフォンアプリによるモバイル撮影フロー","AIがリアルタイムに違反箇所を色別ハイライト","是正タスクの自動生成と担当者へのプッシュ通知","週次コンプライアンスレポートの自動生成"],
    results:[
      {value:"75%",label:"監査時間削減",detail:"4時間→1時間/店舗"},
      {value:"94%",label:"プラノグラム遵守率",detail:"導入前68%から改善"},
      {value:"1日",label:"是正リードタイム",detail:"平均3日から短縮"},
    ],
    quote:"ISA導入後、店長の業務時間配分が根本的に変わりました。監査作業から解放された分、接客と売場作りに集中できています。",
    quoteAuthor:"店舗運営部 部長",
    modules:["棚割認識AI","プラノグラムコンプライアンス","分析ダッシュボード"],
  },
  {
    slug:"convenience-oos",
    industry:"コンビニエンスストア",
    category:"convenience",
    company:"コンビニエンスストアチェーン（1,200店舗）",
    challenge:"欠品検知率94%達成",
    metric:"94%",
    metricLabel:"欠品検知率",
    summary:"高回転率のコンビニ業態で慢性化していた欠品問題をISAのリアルタイム監視で解消。機会損失を大幅に削減した事例。",
    challenges:["日々の高回転商品の欠品発見が目視に依存していた","ピーク時間帯の欠品が売上に直結していたが把握困難","補充作業のタイミングが非効率で過剰在庫も発生していた"],
    solution:"ISAのリアルタイム棚監視とアラート機能を活用。カメラ画像から1時間毎に欠品状態を自動検出し、バックヤードスタッフへ即時通知。",
    solutionPoints:["固定カメラによる自動撮影スケジューリング","AIによるリアルタイム欠品・低在庫検知","補充優先度スコアリングと自動発注提案","時間帯別欠品傾向の分析レポート"],
    results:[
      {value:"94%",label:"欠品検知率",detail:"目視比+47ポイント"},
      {value:"22%",label:"機会損失削減",detail:"欠品起因の売上損失"},
      {value:"30%",label:"補充効率向上",detail:"無駄な補充ラウンド削減"},
    ],
    quote:"欠品の見逃しがほぼゼロになりました。AIが常に棚を見ているという安心感は、現場スタッフのストレス軽減にも繋がっています。",
    quoteAuthor:"エリアマネージャー",
    modules:["棚割認識AI","リアルタイムアラート","分析ダッシュボード"],
  },
  {
    slug:"drugstore-planogram",
    industry:"ドラッグストア",
    category:"drugstore",
    company:"ドラッグストアチェーン（180店舗）",
    challenge:"プラノグラム遵守率+32%向上",
    metric:"+32%",
    metricLabel:"プラノグラム遵守率向上",
    summary:"カテゴリ数が多く棚割が複雑なドラッグストアで、ISAによるプラノグラム自動照合と是正フローの整備により遵守率が大幅に改善した事例。",
    challenges:["医薬品・化粧品・日用品の複雑なカテゴリ構成で棚割管理が困難","季節・キャンペーンごとの棚替えに本部指示が徹底されにくかった","棚割本部と店舗の齟齬を確認する手段がなかった"],
    solution:"ISAのプラノグラム管理機能で本部の棚割マスターを登録。全店舗の実棚状態を週次でAI照合し、差異レポートを自動配信。",
    solutionPoints:["本部マスタープラノグラムのデジタル登録・バージョン管理","AI照合による差異の自動検出と視覚化","差異是正タスクの店長へのプッシュ配信","キャンペーン棚替えの進捗一元管理"],
    results:[
      {value:"+32%",label:"プラノグラム遵守率",detail:"全店平均"},
      {value:"60%",label:"棚替え工数削減",detail:"本部確認作業の効率化"},
      {value:"週次",label:"全店舗照合",detail:"以前は月次サンプル確認"},
    ],
    quote:"本部が設計した棚割が本当に実行されているか、ようやく可視化できるようになりました。PDCAのスピードが格段に上がっています。",
    quoteAuthor:"マーケティング部 棚割担当",
    modules:["プラノグラムコンプライアンス","棚割認識AI","自動生成AI"],
  },
  {
    slug:"fmcg-shelf-share",
    industry:"FMCGブランド",
    category:"fmcg",
    company:"大手飲料メーカー（全国展開）",
    challenge:"棚シェア18%向上",
    metric:"18%",
    metricLabel:"棚シェア向上",
    summary:"小売店での自社製品棚シェアの実態把握と競合比較をISAで実現。営業活動の精度向上と棚獲得率改善につなげた事例。",
    challenges:["各小売店での自社製品のフェイシング数・棚シェアを把握できていなかった","競合製品との棚割比較が定性的な営業ヒアリング頼みだった","棚割交渉の根拠となるデータが存在しなかった"],
    solution:"フィールド営業担当者にISAアプリを配備。訪問先店舗で撮影するだけで自社・競合のフェイシング数と棚シェアを自動集計。",
    solutionPoints:["フィールド営業向けモバイルアプリ展開","自社・競合製品の自動識別とフェイシング計測","地域・チャネル・SKU別棚シェア分析","営業提案用レポートの自動生成"],
    results:[
      {value:"18%",label:"棚シェア向上",detail:"主力SKU 導入後6ヶ月"},
      {value:"3x",label:"棚割交渉成功率",detail:"データ根拠の提案が奏功"},
      {value:"全国",label:"棚シェア可視化",detail:"5,000店舗をカバー"},
    ],
    quote:"「競合より多く並んでいる」という感覚論から、数字に基づいた棚交渉ができるようになりました。バイヤーとの会話の質が変わりました。",
    quoteAuthor:"営業本部 キーアカウントマネージャー",
    modules:["棚割認識AI","OCR価格インテリジェンス","分析ダッシュボード","API連携"],
  },
  {
    slug:"distributor-stock",
    industry:"流通業",
    category:"fmcg",
    company:"食品卸売業者（取引先小売800店）",
    challenge:"在庫切れ22%削減",
    metric:"22%",
    metricLabel:"在庫切れ削減",
    summary:"取引先小売店の欠品状況をリアルタイムで把握するためにISAを活用。補充提案の自動化で欠品起因の機会損失を削減した事例。",
    challenges:["取引先小売店の在庫状況把握が営業担当の目視に依存していた","欠品発生後の補充提案が遅れ、販売機会を逃していた","大量の取引先を少数の営業チームでカバーする効率化が必要だった"],
    solution:"ISAのAPIを活用し取引先店舗の棚監視をシステム連携。欠品アラートを営業CRMに自動連携し補充提案を迅速化。",
    solutionPoints:["ISA API経由での取引先棚データ収集","自社CRMへのアラート自動連携","補充提案の自動生成と優先度付け","欠品傾向レポートによる発注計画最適化"],
    results:[
      {value:"22%",label:"欠品削減率",detail:"取引先全体平均"},
      {value:"40%",label:"補充リードタイム短縮",detail:"アラート→納品"},
      {value:"15%",label:"営業効率向上",detail:"同一人員でカバー店舗数増加"},
    ],
    quote:"棚の状態がシステムで見えるようになり、営業担当が本当に必要な店舗に集中できるようになりました。",
    quoteAuthor:"営業部 部長",
    modules:["API連携","棚割認識AI","分析ダッシュボード"],
  },
  {
    slug:"electronics-retail",
    industry:"家電量販店",
    category:"retail",
    company:"家電量販チェーン（85店舗）",
    challenge:"監査工数80%削減",
    metric:"80%",
    metricLabel:"監査工数削減",
    summary:"複雑な商品構成と頻繁なモデルチェンジに悩む家電量販店でISAを活用。高精度SKU認識で監査工数を大幅削減した事例。",
    challenges:["製品型番が多岐にわたり目視での棚割確認が困難","メーカー指定の展示位置の遵守確認に膨大な工数がかかっていた","新製品投入時の棚替え確認に遅延が生じていた"],
    solution:"ISAの高精度SKU認識エンジンを活用。家電製品のパッケージや型番表示からも正確に識別し、メーカー展示指示との差異を自動検出。",
    solutionPoints:["家電製品特化の高精度SKU認識","メーカー展示指示書のデジタル管理","型番・カラーバリエーション別の差異検出","新製品棚替え進捗の本部一元管理"],
    results:[
      {value:"80%",label:"監査工数削減",detail:"週次棚確認作業"},
      {value:"99.2%",label:"SKU認識精度",detail:"家電製品カタログ対応"},
      {value:"2日",label:"棚替え完了確認短縮",detail:"以前は5営業日"},
    ],
    quote:"型番の多い家電でもAIが正確に認識してくれます。メーカーとの展示契約の履行証明にも使えるようになりました。",
    quoteAuthor:"MD本部 店舗支援グループ",
    modules:["棚割認識AI","プラノグラムコンプライアンス","分析ダッシュボード"],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find(c => c.slug === slug);
}
