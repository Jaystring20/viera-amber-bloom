import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Shield, X } from "lucide-react";
import logoSrc from "@/assets/viera-amber-logo.png";
import { useLocation, useNavigate } from "react-router-dom";

const GOLD = "#D97706";
const GOLD_DIM = "rgba(217,119,6,0.10)";

const NAV_LINKS = [
  { label: "Illustrations", href: "/illustrations", isRoute: true },
  { label: "VAGIN", href: "/vagin", isRoute: true },
  { label: "VIVA", href: "/viva", isRoute: true },
  { label: "VAM", href: "/vam", isRoute: true },
  { label: "Shop", href: "/vash", isRoute: true },
  { label: "Contact", href: "#contact" },
];

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isVaginRoute = location.pathname === "/vagin";

  // Active route detection
  const isActive = (href: string) => {
    if (href.startsWith("/")) return location.pathname === href;
    return false;
  };

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
    if (href.startsWith("/")) {
      navigate(href);
      return;
    }
    // Hash link — try to scroll on current page, else go home first
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) {
          const top = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
        }
      }, 300);
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      const top = (el as HTMLElement).getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (location.pathname === "/") {
      const heroEl = document.getElementById("hero");
      if (heroEl) {
        const top = heroEl.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
      }
    } else {
      navigate("/");
    }
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-[100]"
      style={{ padding: "16px 20px" }}
    >
      {/* ── Floating Nav Pill ────────────────────────────────────────── */}
      <nav
        className="mx-auto flex items-center justify-between h-16 md:h-14 px-5 md:px-7 rounded-2xl md:rounded-full"
        style={{
          maxWidth: "min(calc(100% - 40px), 1100px)",
          /* Darker + more opaque so text is always legible over any background */
          background: "rgba(5, 5, 5, 0.90)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          /* Stronger gold border — visible but not loud */
          border: "1px solid rgba(217, 119, 6, 0.28)",
          /* Deeper shadow for more physical separation from page content */
          boxShadow:
            "0 4px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.03) inset",
        }}
      >
        {/* Logo */}
        <a
          href="/"
          onClick={handleLogoClick}
          aria-label={isVaginRoute ? "VAGIN — back to Viera Amber" : "Viera Amber — home"}
          className="flex items-center"
          style={{ cursor: "pointer", gap: 10 }}
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
                className="h-5 w-auto select-none"
                draggable={false}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
        </a>

        {/* ── Desktop nav links ─────────────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href} style={{ position: "relative" }}>
                <motion.a
                  href={l.href}
                  onClick={handleNavClick(l.href)}
                  whileHover={reduced ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="relative flex flex-col items-center uppercase rounded-lg"
                  style={{
                    fontSize: 11,
                    letterSpacing: "1.5px",
                    fontWeight: active ? 600 : 500,
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    padding: "7px 14px",
                    color: active ? GOLD : "rgba(250,250,250,0.82)",
                    background: active ? GOLD_DIM : "transparent",
                    transition: "color 0.18s ease, background 0.18s ease",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (active) return;
                    e.currentTarget.style.color = GOLD;
                    e.currentTarget.style.background = GOLD_DIM;
                  }}
                  onMouseLeave={(e) => {
                    if (active) return;
                    e.currentTarget.style.color = "rgba(250,250,250,0.82)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {l.label}
                  {/* Active gold underline dot */}
                  {active && (
                    <motion.span
                      layoutId="nav-active-dot"
                      style={{
                        display: "block",
                        width: 16,
                        height: 2,
                        borderRadius: 1,
                        background: GOLD,
                        marginTop: 3,
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.a>
              </li>
            );
          })}

          {/* Admin shield — desktop */}
          <li>
            <motion.a
              href="/vagin-dashboard"
              aria-label="Admin dashboard"
              whileHover={reduced ? {} : { scale: 1.1 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center rounded-lg"
              style={{ padding: "8px 10px", opacity: 0.32, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.32")}
            >
              <Shield size={15} color={GOLD} strokeWidth={1.5} />
            </motion.a>
          </li>
        </ul>

        {/* ── Mobile: shield + hamburger ───────────────────────────── */}
        <div className="md:hidden flex items-center gap-1">
          <motion.a
            href="/vagin-dashboard"
            aria-label="Admin dashboard"
            className="flex items-center justify-center rounded-lg"
            style={{ padding: "8px", opacity: 0.32 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.32")}
          >
            <Shield size={16} color={GOLD} strokeWidth={1.5} />
          </motion.a>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              padding: "8px",
              color: "rgba(250,250,250,0.82)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile dropdown overlay ───────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            className="md:hidden fixed inset-0 top-16 z-40"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
              className="flex flex-col gap-3 p-4 mt-2 mx-4"
              style={{
                background: "rgba(5,5,5,0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(217,119,6,0.28)",
                borderRadius: 16,
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              }}
            >
              <motion.ul
                initial="initial"
                animate="animate"
                variants={{ animate: { transition: { staggerChildren: reduced ? 0 : 0.04 } } }}
                className="flex flex-col gap-1"
              >
                {NAV_LINKS.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <motion.li
                      key={l.href}
                      variants={{
                        initial: { opacity: 0, x: -16 },
                        animate: { opacity: 1, x: 0, transition: { duration: reduced ? 0 : 0.18 } },
                      }}
                    >
                      <a
                        href={l.href}
                        onClick={handleNavClick(l.href)}
                        autoFocus={l.href === NAV_LINKS[0].href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: 13,
                          letterSpacing: "1.5px",
                          fontWeight: active ? 600 : 400,
                          fontFamily: "DM Sans, system-ui, sans-serif",
                          textTransform: "uppercase",
                          color: active ? GOLD : "rgba(250,250,250,0.82)",
                          background: active ? GOLD_DIM : "transparent",
                          padding: "11px 16px",
                          borderRadius: 10,
                          textDecoration: "none",
                          transition: "color 0.15s, background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (active) return;
                          e.currentTarget.style.color = GOLD;
                          e.currentTarget.style.background = GOLD_DIM;
                        }}
                        onMouseLeave={(e) => {
                          if (active) return;
                          e.currentTarget.style.color = "rgba(250,250,250,0.82)";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {active && (
                          <span style={{
                            width: 3, height: 14, borderRadius: 2,
                            background: GOLD, flexShrink: 0,
                          }} />
                        )}
                        {l.label}
                      </a>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
