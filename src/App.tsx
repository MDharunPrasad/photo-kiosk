import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PhotoBoothProvider } from "./context/PhotoBoothContext";
import PrivateRoute from "./components/PrivateRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BundlesPage from "./pages/BundlesPage";
import EditorPage from "./pages/EditorPage";
import CartPage from "./pages/CartPage";
import SessionViewerPage from "./pages/SessionViewerPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import SparklesIntro from "@/components/ui/sparkles-intro";
import OperatorDashboard from "./pages/OperatorDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PhotoBoothProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SparklesIntro />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route element={<PrivateRoute />}>
              <Route path="/bundles" element={<BundlesPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/session/:id" element={<SessionViewerPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PhotoBoothProvider>
  </QueryClientProvider>
);

export default App;
