import type { Metadata } from "next";
import Hero from "@/components/sections/Hero/Hero";
import Trust from "@/components/sections/Trust/Trust";
import Problem from "@/components/sections/Problem/Problem";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import PlatformOverview from "@/components/sections/Modules/Modules";
import Industries from "@/components/sections/Industries/Industries";
import CaseStudiesPreview from "@/components/sections/CaseStudiesPreview/CaseStudiesPreview";
import Integrations from "@/components/sections/Integrations/Integrations";
import Security from "@/components/sections/Security/Security";
import FAQ from "@/components/sections/FAQ/FAQ";
import CTA from "@/components/sections/CTA/CTA";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  const canonical = isJa ? "https://isa.panasonic-connect.com/ja" : "https://isa.panasonic-connect.com/en";
  const alternate = isJa ? "https://isa.panasonic-connect.com/en" : "https://isa.panasonic-connect.com/ja";
  return {
    title: isJa
      ? "AIシェルフインテリジェンスプラットフォーム – 小売棚監査の自動化｜パナソニックコネクト"
      : "AI Shelf Intelligence Platform – Automate Retail Shelf Audits | Panasonic Connect",
    description: isJa
      ? "モバイル撮影で棚割監査を自動化。プラノグラム違反の即時検知、欠品アラート、OCR価格読み取り、エンタープライズAPI連携。SOC2 Type II認証取得。無料トライアルあり。"
      : "Automate retail shelf audits with mobile capture. Instant planogram violation detection, OOS alerts, OCR price reading, and enterprise API integration. SOC2 Type II certified. Free trial available.",
    alternates: { canonical, languages: { [isJa ? "en" : "ja"]: alternate } },
    openGraph: {
      title: isJa
        ? "AIシェルフインテリジェンスプラットフォーム｜パナソニックコネクト"
        : "AI Shelf Intelligence Platform | Panasonic Connect",
      description: isJa
        ? "モバイル撮影で棚割監査を自動化。プラノグラム違反検知・欠品アラート・OCR価格分析をワンプラットフォームで。"
        : "Automate retail shelf audits with AI. Planogram compliance, OOS detection, and OCR price analysis in one platform.",
      locale: isJa ? "ja_JP" : "en_US",
      type: "website",
    },
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Trust />
      <Problem />
      <HowItWorks />
      <PlatformOverview />
      <Industries />
      <CaseStudiesPreview />
      <Integrations />
      <Security />
      <FAQ />
      <CTA />
    </>
  );
}