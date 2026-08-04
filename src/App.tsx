import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Illustrations from "./pages/Illustrations.tsx";
import CollectionPage from "./pages/CollectionPage.tsx";
import VAGINPage from "./pages/VAGIN.tsx";
import VAGINDashboard from "./pages/VAGINDashboard.tsx";
import VIVAPage from "./pages/VIVA.tsx";
import VivaTryOn from "./pages/VivaTryOn.tsx";
import VAMPage from "./pages/VAM.tsx";
import VASHPage from "./pages/VASH.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminProducts from "./pages/AdminProducts.tsx";
import MobileTabBar from "./components/MobileTabBar.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/illustrations" element={<Illustrations />} />
          <Route path="/collections/:collectionId" element={<CollectionPage />} />
          <Route path="/vagin" element={<VAGINPage />} />
          <Route path="/vagin-dashboard" element={<VAGINDashboard />} />
          <Route path="/viva" element={<VIVAPage />} />
          <Route path="/viva/try-on" element={<VivaTryOn />} />
          <Route path="/vam" element={<VAMPage />} />
          <Route path="/vash" element={<VASHPage />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Inside the router: it reads the active route to light its tab. */}
        <MobileTabBar />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
