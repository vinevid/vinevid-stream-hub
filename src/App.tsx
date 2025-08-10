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
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import { RequireAdmin } from "./components/admin/RequireAdmin";

const LazyAdminVideosList = lazy(() => import("./pages/admin/VideosList"));
const LazyAdminNewVideo = lazy(() => import("./pages/admin/NewVideo"));
const LazyAdminEditVideo = lazy(() => import("./pages/admin/EditVideo"));
const LazyAdminComments = lazy(() => import("./pages/admin/Comments"));
const LazyAdminSettings = lazy(() => import("./pages/admin/Settings"));
const LazyAdminCategories = lazy(() => import("./pages/admin/Categories"));
const LazyAdminHowTo = lazy(() => import("./pages/admin/HowToEditor"));

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
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                <Route path="/admin/videos" element={<RequireAdmin><LazyAdminVideosList /></RequireAdmin>} />
                <Route path="/admin/videos/new" element={<RequireAdmin><LazyAdminNewVideo /></RequireAdmin>} />
                <Route path="/admin/videos/:id/edit" element={<RequireAdmin><LazyAdminEditVideo /></RequireAdmin>} />
                <Route path="/admin/comments" element={<RequireAdmin><LazyAdminComments /></RequireAdmin>} />
                <Route path="/admin/settings" element={<RequireAdmin><LazyAdminSettings /></RequireAdmin>} />
                <Route path="/admin/categories" element={<RequireAdmin><LazyAdminCategories /></RequireAdmin>} />
                <Route path="/admin/how-to" element={<RequireAdmin><LazyAdminHowTo /></RequireAdmin>} />
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
