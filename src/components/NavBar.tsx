import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Shield, X } from "lucide-react";
import logoSrc from "@/assets/viera-amber-logo.png";
import { useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Illustrations", href: "/illustrations", isRoute: true },
  { label: "VAGIN", href: "/vagin", isRoute: true },
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
  const location = useLocation();
  const isVaginRoute = location.pathname === "/vagin";

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

    // Handle route navigation
    if (href.startsWith("/")) {
      window.location.pathname = href;
      return;
    }

    // Handle anchor scrolling
    const el = document.querySelector(href);
    if (el) {
      const top = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);

    // If on home page, scroll to hero; otherwise navigate home
    if (window.location.pathname === "/") {
      const heroEl = document.getElementById("hero");
      if (heroEl) {
        const top = heroEl.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      }
    } else {
      window.location.pathname = "/";
    }
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-[100]"
      style={{
        padding: "16px 20px",
        transition: "padding 0.3s ease",
      }}
    >
      {/* Floating Glass Navigation Container */}
      <nav
        className="mx-auto flex items-center justify-between h-16 md:h-14 px-6 md:px-8 rounded-2xl md:rounded-full"
        style={{
          maxWidth: "min(calc(100% - 40px), 1100px)",
          background: "rgba(10, 10, 10, 0.65)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(217, 119, 6, 0.12)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.25)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <a
          href="/"
          onClick={handleLogoClick}
          aria-label={isVaginRoute ? "VAGIN — back to Viera Amber" : "Viera Amber — home"}
          className="flex items-center"
          style={{ cursor: "pointer", transition: "opacity 0.2s", gap: 10 }}
        >
          <AnimatePresence mode="wait">
            {isVaginRoute ? (
              <motion.img
                key="vagin-logo"
                src="/vagin-logo.png"
                alt="VAGIN"
                className="w-auto select-none"
                style={{ height: 48, filter: "drop-shadow(0 0 8px rgba(237,21,93,0.3))" }}
                draggable={false}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
              />
            ) : (
              <motion.img
                key="main-logo"
                src={logoSrc}
                alt="Viera Amber"
                className="h-5 md:h-5 w-auto select-none"
                draggable={false}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </a>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={handleNavClick(l.href)}
                className="uppercase transition-all duration-200 hover:text-brand-orange text-brand-textDim px-4 py-2 rounded-lg hover:bg-white/5"
                style={{ fontSize: 11, letterSpacing: "1.2px", fontWeight: 400 }}
              >
                {l.label}
              </a>
            </li>
          ))}
          {/* Admin access — desktop */}
          <li>
            <a
              href="/vagin-dashboard"
              aria-label="Admin dashboard"
              className="flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/5"
              style={{ padding: "8px 10px", opacity: 0.35 }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
            >
              <Shield size={15} color="#D97706" strokeWidth={1.5} />
            </a>
          </li>
        </ul>

        {/* Mobile right-side controls */}
        <div className="md:hidden flex items-center gap-1">
          {/* Admin access — mobile */}
          <a
            href="/vagin-dashboard"
            aria-label="Admin dashboard"
            className="flex items-center justify-center rounded-lg transition-all duration-200"
            style={{ padding: "8px", opacity: 0.35 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
          >
            <Shield size={16} color="#D97706" strokeWidth={1.5} />
          </a>

          {/* Hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="text-brand-text transition-colors hover:text-brand-orange"
            onClick={() => setOpen((v) => !v)}
            style={{ padding: "8px" }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Glass Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
            className="md:hidden fixed inset-0 top-16 z-40"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={(e) => {
              if (e.target === overlayRef.current) setOpen(false);
            }}
          >
            <motion.div
              className="flex flex-col gap-3 p-4 mt-2 mx-4"
              style={{
                background: "rgba(10, 10, 10, 0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(217, 119, 6, 0.12)",
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <motion.ul
                initial="initial"
                animate="animate"
                variants={{ animate: { transition: { staggerChildren: reduced ? 0 : 0.05 } } }}
                className="flex flex-col gap-2"
              >
                {NAV_LINKS.map((l) => (
                  <motion.li
                    key={l.href}
                    variants={{
                      initial: { opacity: 0, x: -20 },
                      animate: { opacity: 1, x: 0, transition: { duration: reduced ? 0 : 0.2 } },
                    }}
                  >
                    <a
                      href={l.href}
                      onClick={handleNavClick(l.href)}
                      autoFocus={l.href === NAV_LINKS[0].href}
                      className="uppercase text-brand-text hover:text-brand-orange transition-all px-4 py-3 rounded-lg hover:bg-white/5 block"
                      style={{ fontSize: 13, letterSpacing: "1.5px", fontWeight: 400 }}
                    >
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
