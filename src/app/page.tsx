import {
  ComparisonSection,
  FAQSection,
  FeaturesSection,
  Footer,
  HeroSection,
  Navbar,
  PlaygroundGrid,
} from "@/components";
import { BackgroundEffects } from "@/components/ui/background-effects";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0E1525] text-white">
      <Navbar />
      <main>
        <div className="container mx-auto px-6 pt-32">
          <HeroSection />
          <PlaygroundGrid />
        </div>
        <FeaturesSection />
        <ComparisonSection />
        <FAQSection />
      </main>
      <Footer />
      <BackgroundEffects />
    </div>
  );
}
