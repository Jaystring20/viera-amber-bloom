import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Palette,
  HeartHandshake,
  Shirt,
  GraduationCap,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

/* ════════════════════════════════════════════════════════════════════════
   MOBILE TAB BAR

   Five tabs, because the product is five arms — the site's own thesis
   ("One brand. Five expressions.") happens to land exactly on Material's
   3–5 bottom-nav ceiling, so nothing had to be demoted to fit.

   Home is deliberately not a tab: the wordmark in the top NavBar already
   goes home on every screen, and spending a sixth slot to duplicate it
   would push past the ceiling.

   Every tab carries an icon AND a label. Icon-only bottom navigation is a
   known discoverability failure, and these five names are the brand's own
   vocabulary — VAGIN and VASH are not guessable from a glyph.

   The active tab is tinted with that arm's own accent, the same colours
   used by the Hero threads and the Ecosystem map, so the colour system
   teaches itself as the visitor moves.
   ════════════════════════════════════════════════════════════════════════ */

type Tab = {
  to: string;
  label: string;
  accent: string;
  Icon: LucideIcon;
};

const TABS: Tab[] = [
  { to: "/illustrations", label: "Art",   accent: "#D97706", Icon: Palette },
  { to: "/vagin",         label: "VAGIN", accent: "#62017F", Icon: HeartHandshake },
  { to: "/viva",          label: "VIVA",  accent: "#6E0025", Icon: Shirt },
  { to: "/vam",           label: "VAM",   accent: "#888888", Icon: GraduationCap },
  { to: "/vash",          label: "Shop",  accent: "#0B7B8C", Icon: ShoppingBag },
];

const INK = "#0A0A0A";

/* Surfaces where a marketing tab bar is noise: the admin dashboards are tools
   with their own navigation, and the hero lab is a scratch page. */
const HIDDEN_ON = ["/vagin-dashboard", "/vagin-user", "/hero-lab", "/viva/try-on"];

const MobileTabBar = () => {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();

  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Ecosystem sections"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[90]"
      style={{
        background: "rgba(250,250,250,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: `1px solid ${INK}14`,
        /* Clears the iPhone home indicator. Requires viewport-fit=cover on
           the viewport meta tag, which index.html sets. */
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -1px 16px rgba(10,10,10,0.06)",
      }}
    >
      <ul className="flex items-stretch justify-around m-0 p-0 list-none">
        {TABS.map((tab) => {
          const active = pathname === tab.to;
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center justify-center w-full"
                style={{
                  /* 56px clears the 44pt/48dp touch minimum with room for the
                     label, and the full cell is tappable — not just the icon. */
                  minHeight: 56,
                  gap: 3,
                  paddingTop: 8,
                  paddingBottom: 8,
                  textDecoration: "none",
                  color: active ? tab.accent : "rgba(10,10,10,0.55)",
                  transition: "color 0.2s ease",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Active indicator — a short rule in the arm's colour, shared
                    across tabs via layoutId so it slides between them rather
                    than blinking out and in. */}
                {active && (
                  <motion.span
                    aria-hidden="true"
                    layoutId="tabbar-indicator"
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 34 }
                    }
                    style={{
                      position: "absolute",
                      top: 0,
                      width: 26,
                      height: 2.5,
                      borderRadius: 999,
                      background: tab.accent,
                    }}
                  />
                )}

                <tab.Icon
                  size={21}
                  strokeWidth={active ? 2.2 : 1.75}
                  aria-hidden="true"
                />
                <span
                  style={{
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    fontSize: 10,
                    fontWeight: active ? 700 : 500,
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                  }}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileTabBar;
