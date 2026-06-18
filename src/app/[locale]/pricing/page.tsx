import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return {
    title: isJa
      ? "料金プラン – AIシェルフインテリジェンスプラットフォーム｜パナソニックコネクト"
      : "Pricing Plans – AI Shelf Intelligence Platform | Panasonic Connect",
    description: isJa
      ? "スターター・プロフェッショナル・エンタープライズの3プラン。30日間無料トライアル、クレジットカード不要。貴社の規模・要件に合わせた最適なプランをご提案します。"
      : "Starter, Professional, and Enterprise plans. 30-day free trial, no credit card required. Contact us for a custom quote.",
    alternates: {
      languages: {
        ja: "https://isa.panasonic-connect.com/ja/pricing",
        en: "https://isa.panasonic-connect.com/en/pricing",
      },
    },
    openGraph: {
      title: isJa ? "料金プラン｜パナソニックコネクト ISA" : "Pricing | Panasonic Connect ISA",
      description: isJa
        ? "スターター・プロフェッショナル・エンタープライズ。30日間無料トライアル。"
        : "Starter, Professional, Enterprise. 30-day free trial.",
      locale: isJa ? "ja_JP" : "en_US",
      type: "website",
    },
  };
}

export default function PricingPage() {
  return <PricingClient />;
}
