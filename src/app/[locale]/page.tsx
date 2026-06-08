import Hero from "@/components/sections/Hero/Hero";
import Challenges from "@/components/sections/Challenges/Challenges";
import Solutions from "@/components/sections/Solutions/Solutions";
import Modules from "@/components/sections/Modules/Modules";
import Process from "@/components/sections/Process/Process";
import Industries from "@/components/sections/Industries/Industries";
import ROI from "@/components/sections/ROI/ROI";
import Trust from "@/components/sections/Trust/Trust";
import CTA from "@/components/sections/CTA/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Challenges />
      <Solutions />
      <Modules />
      <Process />
      <Industries />
      <ROI />
      <Trust />
      <CTA />
    </>
  );
}