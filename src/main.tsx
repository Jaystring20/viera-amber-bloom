import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

/* ── Service worker ───────────────────────────────────────────────────────
   Registered after load so it never competes with first paint, and only in
   production: an active worker in dev shadows Vite's HMR and serves stale
   modules, which is a miserable way to lose an afternoon. */
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  });
}
