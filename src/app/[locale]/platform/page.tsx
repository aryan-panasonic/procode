import type { Metadata } from "next";
import PlatformClient from "./PlatformClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return {
    title: isJa
      ? "AIシェルフプラットフォーム – 機能・モジュール｜パナソニックコネクト"
      : "AI Shelf Platform – Features & Modules | Panasonic Connect",
    description: isJa
      ? "棚割AIの6つのモジュール。棚割認識・プラノグラムコンプライアンス・OCR価格・分析・API連携・自動生成。SOC2 Type II・ISO 27001認証取得。"
      : "Six integrated AI shelf modules: shelf recognition, planogram compliance, OCR price, analytics, API integration, and auto-generation. SOC2 Type II & ISO 27001 certified.",
    alternates: {
      languages: {
        ja: "https://isa.panasonic-connect.com/ja/platform",
        en: "https://isa.panasonic-connect.com/en/platform",
      },
    },
    openGraph: {
      title: isJa ? "AIシェルフプラットフォーム｜パナソニックコネクト" : "AI Shelf Platform | Panasonic Connect",
      description: isJa
        ? "棚割認識・プラノグラムコンプライアンス・OCR価格・分析・API連携の6モジュール統合プラットフォーム。"
        : "Six integrated modules: shelf recognition, planogram compliance, OCR price, analytics, and API integration.",
      locale: isJa ? "ja_JP" : "en_US",
      type: "website",
    },
  };
}

export default function PlatformPage() {
  return <PlatformClient />;
}
