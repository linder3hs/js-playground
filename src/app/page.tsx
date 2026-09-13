import { Navbar, Footer, PlaygroundGrid, HeroSection } from "@/components";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0B] text-zinc-900 dark:text-zinc-100">
      <Navbar />
      <main>
        <HeroSection />
        <PlaygroundGrid />
      </main>
      <Footer />
    </div>
  );
}
