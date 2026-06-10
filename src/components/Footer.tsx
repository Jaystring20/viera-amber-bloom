const QUICK_LINKS = [
  { label: "Illustrations", href: "#illustrations" },
  { label: "VAGIN", href: "#vagin" },
  { label: "VIVA", href: "#viva" },
  { label: "VAM", href: "#vam" },
  { label: "Shop", href: "#shop" },
  { label: "Contact", href: "#contact" },
];

const Footer = () => {
  return (
    <footer className="bg-brand-dark border-t border-brand-gold/70">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <div className="font-display text-brand-text" style={{ fontSize: 18, letterSpacing: "4px" }}>
            VIERA AMBER
          </div>
          <p className="mt-4 italic text-brand-textDim font-display" style={{ fontSize: 16 }}>
            For her, by her.
          </p>
        </div>

        <div>
          <h4 className="uppercase text-brand-gold mb-4" style={{ fontSize: 12, letterSpacing: "2px" }}>
            Explore
          </h4>
          <ul className="space-y-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-brand-textDim hover:text-brand-gold transition-colors"
                  style={{ fontSize: 14 }}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="uppercase text-brand-gold mb-4" style={{ fontSize: 12, letterSpacing: "2px" }}>
            Connect
          </h4>
          <ul className="space-y-2 text-brand-textDim" style={{ fontSize: 14 }}>
            <li>
              <a href="mailto:admin@vieraamber.com" className="hover:text-brand-gold transition-colors">
                admin@vieraamber.com
              </a>
            </li>
            <li>18 Ajose Street, Maryland, Lagos</li>
            <li>
              <a
                href="https://instagram.com/viera_amber"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-gold transition-colors"
              >
                @viera_amber
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com/vieraamberva"
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-gold transition-colors"
              >
                @vieraamberva
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-borderSubtle">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 text-brand-textDim" style={{ fontSize: 12 }}>
          © 2026 Viera Amber. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
