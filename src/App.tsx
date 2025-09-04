import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { lazy, Suspense } from "react";
import Splash from "./pages/Splash";
import Home from "./pages/Home";
import HowToDownload from "./pages/HowToDownload";
import VideoDetails from "./pages/VideoDetails";
import FakeDownload from "./pages/FakeDownload";
import { About, DMCA, Contact } from "./pages/StaticPages";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { RequireAdmin } from "./components/admin/RequireAdmin";

const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const LazyAdminVideosList = lazy(() => import("./pages/admin/VideosList"));
const LazyAdminNewVideo = lazy(() => import("./pages/admin/NewVideo"));
const LazyAdminEditVideo = lazy(() => import("./pages/admin/EditVideo"));
const LazyAdminComments = lazy(() => import("./pages/admin/Comments"));
const LazyAdminSettings = lazy(() => import("./pages/admin/Settings"));
const LazyAdminCategories = lazy(() => import("./pages/admin/Categories"));
const LazyAdminHowTo = lazy(() => import("./pages/admin/HowToEditor"));
const LazyAdminConfig = lazy(() => import("./pages/admin/AdminConfig"));
const CategoryListing = lazy(() => import("./pages/CategoryListing"));
const Latest = lazy(() => import("./pages/Latest"));
const Trending = lazy(() => import("./pages/Trending"));
const TopCdrama = lazy(() => import("./pages/TopCdrama"));
const TopKdrama = lazy(() => import("./pages/TopKdrama"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/home" element={<Home />} />
                <Route path="/how-to-download" element={<HowToDownload />} />
                <Route path="/video/:id" element={<VideoDetails />} />
                <Route path="/download/:id" element={<FakeDownload />} />
                <Route path="/about" element={<About />} />
                <Route path="/dmca" element={<DMCA />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/category/:category" element={<CategoryListing />} />
                <Route path="/latest" element={<Latest />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/top-cdrama" element={<TopCdrama />} />
                <Route path="/top-kdrama" element={<TopKdrama />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="videos" element={<LazyAdminVideosList />} />
                  <Route path="videos/new" element={<LazyAdminNewVideo />} />
                  <Route path="videos/:id/edit" element={<LazyAdminEditVideo />} />
                  <Route path="comments" element={<LazyAdminComments />} />
                  <Route path="settings" element={<LazyAdminSettings />} />
                  <Route path="config" element={<LazyAdminConfig />} />
                  <Route path="categories" element={<LazyAdminCategories />} />
                  <Route path="how-to" element={<LazyAdminHowTo />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
