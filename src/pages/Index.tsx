import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import EcosystemSection from "@/components/sections/EcosystemSection";
import IllustrationsSection from "@/components/sections/IllustrationsSection";
import VAGINSection from "@/components/sections/VAGINSection";
import VIVASection from "@/components/sections/VIVASection";
import VAMSection from "@/components/sections/VAMSection";
import FounderSection from "@/components/sections/FounderSection";
import ContactSection from "@/components/sections/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-brand-dark">
      <NavBar />

      <main>
        {/* 01 — Hero */}
        <section id="hero" aria-label="Viera Amber">
          <HeroSection />
        </section>

        {/* 02 — Ecosystem Map */}
        <section id="ecosystem" aria-label="The Viera Amber Ecosystem">
          <EcosystemSection />
        </section>

        {/* 03 — Illustrations & Designs */}
        <section id="illustrations" aria-label="Illustrations and Designs">
          <IllustrationsSection />
        </section>

        {/* 04 — VAGIN */}
        <section id="vagin" aria-label="Viera Amber's Girls' Initiative">
          <VAGINSection />
        </section>

        {/* 05 — VIVA */}
        <section id="viva" aria-label="VIVA by Viera Amber">
          <VIVASection />
        </section>

        {/* 06 — VAM Masterclass */}
        <section id="vam" aria-label="Viera Amber Masterclass">
          <VAMSection />
        </section>

        {/* 08 — Founder */}
        <section id="founder" aria-label="Meet Our Founder">
          <FounderSection />
        </section>

        {/* 09 — Contact */}
        <section id="contact" aria-label="Contact Viera Amber">
          <ContactSection />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
