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