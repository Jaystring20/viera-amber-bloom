import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// The hub loads eagerly; every other page is split into its own chunk and
// only downloaded when visited.
const Illustrations = lazy(() => import("./pages/Illustrations.tsx"));
const VAGINPage = lazy(() => import("./pages/VAGIN.tsx"));
const VAGINDashboard = lazy(() => import("./pages/VAGINDashboard.tsx"));
const VIVAPage = lazy(() => import("./pages/VIVA.tsx"));
const VIVAStory = lazy(() => import("./pages/VIVAStory.tsx"));
const VivaTryOn = lazy(() => import("./pages/VivaTryOn.tsx"));
const VAMPage = lazy(() => import("./pages/VAM.tsx"));
const VASHPage = lazy(() => import("./pages/VASH.tsx"));
const AdminProducts = lazy(() => import("./pages/AdminProducts.tsx"));
import MobileTabBar from "./components/MobileTabBar.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="min-h-screen bg-brand-dark" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/illustrations" element={<Illustrations />} />
          {/* Retired — this used a separate, now-orphaned category system
              (CollectionId) that never matched the client's real taxonomy
              and had no live links pointing to it anymore. Redirects rather
              than 404s in case an old bookmark or external link still uses it. */}
          <Route path="/collections/:collectionId" element={<Navigate to="/illustrations" replace />} />
          <Route path="/vagin" element={<VAGINPage />} />
          <Route path="/vagin-dashboard" element={<VAGINDashboard />} />
          <Route path="/viva" element={<VIVAPage />} />
          <Route path="/viva/story" element={<VIVAStory />} />
          <Route path="/viva/try-on" element={<VivaTryOn />} />
          <Route path="/vam" element={<VAMPage />} />
          <Route path="/vash" element={<VASHPage />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        {/* Inside the router: it reads the active route to light its tab. */}
        <MobileTabBar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
