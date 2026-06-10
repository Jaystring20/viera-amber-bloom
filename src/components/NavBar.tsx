import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/viera-amber-logo.png.asset.json";

const NAV_LINKS = [
  { label: "Illustrations", href: "#illustrations" },
  { label: "VAGIN", href: "#vagin" },
  { label: "VIVA", href: "#viva" },
  { label: "VAM", href: "#vam" },
  { label: "Shop", href: "#shop" },
  { label: "Contact", href: "#contact" },
];

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (el) {
      const top = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-[100] transition-colors duration-300"
      style={{ backgroundColor: scrolled || open ? "#0A0A0A" : "transparent" }}
    >
      <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-10 h-20">
        <a
          href="#hero"
          onClick={handleNavClick("#hero")}
          aria-label="Viera Amber — home"
          className="flex items-center"
        >
          <img
            src={logoAsset.url}
            alt="Viera Amber"
            className="h-5 md:h-6 w-auto select-none"
            draggable={false}
          />
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={handleNavClick(l.href)}
                className="uppercase transition-colors duration-200 hover:text-brand-gold text-brand-textDim"
                style={{ fontSize: 12, letterSpacing: "1.5px", fontWeight: 400 }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden text-brand-text"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="md:hidden fixed inset-0 top-20 bg-brand-dark"
            onClick={(e) => {
              if (e.target === overlayRef.current) setOpen(false);
            }}
          >
            <motion.ul
              initial="initial"
              animate="animate"
              variants={{ animate: { transition: { staggerChildren: reduced ? 0 : 0.06 } } }}
              className="flex flex-col items-center justify-center gap-8 pt-16"
            >
              {NAV_LINKS.map((l) => (
                <motion.li
                  key={l.href}
                  variants={{
                    initial: { opacity: 0, y: 16 },
                    animate: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.3 } },
                  }}
                >
                  <a
                    href={l.href}
                    onClick={handleNavClick(l.href)}
                    autoFocus={l.href === NAV_LINKS[0].href}
                    className="uppercase text-brand-text hover:text-brand-gold transition-colors"
                    style={{ fontSize: 18, letterSpacing: "2px" }}
                  >
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
