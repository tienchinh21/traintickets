import { HeroSection } from "@/components/landing/hero-section";
import { InfoSections } from "@/components/landing/info-sections";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { PromoSections } from "@/components/landing/promo-sections";
import { RouteSection } from "@/components/landing/route-section";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#172033]">
      <LandingHeader />
      <main>
        <HeroSection />
        <RouteSection />
        <PromoSections />
        <InfoSections />
      </main>
      <LandingFooter />
    </div>
  );
}
