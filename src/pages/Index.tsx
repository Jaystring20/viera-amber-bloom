import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import EcosystemSection from "@/components/sections/EcosystemSection";

type Section = {
  id: string;
  bg: string;
  label: string;
  light?: boolean;
};

const SECTIONS: Section[] = [

  { id: "illustrations", bg: "#0A0A0A", label: "Illustrations" },
  { id: "vagin", bg: "#62017F", label: "VAGIN" },
  { id: "viva", bg: "#6E0025", label: "VIVA" },
  { id: "vam", bg: "#FAFAFA", label: "VAM", light: true },
  { id: "shop", bg: "#0A0A0A", label: "Shop" },
  { id: "founder", bg: "#FAFAFA", label: "Founder", light: true },
  { id: "contact", bg: "#0A0A0A", label: "Contact" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-brand-dark">
      <NavBar />
      <main>
        <section id="hero" aria-label="Hero">
          <HeroSection />
        </section>
        <section id="ecosystem" aria-label="The Viera Amber Ecosystem">
          <EcosystemSection />
        </section>
        {SECTIONS.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className="min-h-screen flex items-center justify-center"
            style={{ backgroundColor: s.bg, color: s.light ? "#0A0A0A" : "#FAFAFA" }}
            aria-label={s.label}
          >
            <span
              className="font-display opacity-30"
              style={{ fontSize: 14, letterSpacing: "6px", textTransform: "uppercase" }}
            >
              {s.label}
            </span>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
