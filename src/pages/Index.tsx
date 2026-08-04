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

        {/* 07 — VASH Shop (links out to existing store) */}
        <section
          id="shop"
          aria-label="Viera Amber Shop"
          className="w-full flex flex-col items-center justify-center py-20"
          style={{ backgroundColor: "#FAFAFA", minHeight: "50vh" }}
        >
          <div
            className="flex flex-col items-center text-center mx-auto px-6"
            style={{ maxWidth: 560, gap: 20 }}
          >
            <h2
              className="font-display"
              style={{
                fontSize: "clamp(28px, 3.8vw, 44px)",
                fontWeight: 700,
                color: "#0A0A0A",
                margin: 0,
                lineHeight: 1.15,
              }}
            >
              The commercial engine of the ecosystem.
            </h2>
            <p
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontWeight: 300,
                fontSize: 15,
                color: "#555555",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Wearable art, premium Procreate brushes, fashion illustration pose
              references, and customized design products. All curated by Faith
              Adigwe.
            </p>
            <a
              href="https://vieraamber.com/shop"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "DM Sans, system-ui, sans-serif",
                fontSize: 11,
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 500,
                backgroundColor: "#C8A96E",
                color: "#0A0A0A",
                border: "none",
                borderRadius: 2,
                padding: "11px 28px",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Visit the Shop →
            </a>
          </div>
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
