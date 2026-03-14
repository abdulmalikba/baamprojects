import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import StoriesPage from "./pages/StoriesPage";
import DependenciesPage from "./pages/DependenciesPage";
import BugsPage from "./pages/BugsPage";
import ObservationsPage from "./pages/ObservationsPage";
import BacklogPage from "./pages/BacklogPage";
import ReportsPage from "./pages/ReportsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/stories" element={<StoriesPage />} />
            <Route path="/dependencies" element={<DependenciesPage />} />
            <Route path="/bugs" element={<BugsPage />} />
            <Route path="/observations" element={<ObservationsPage />} />
            <Route path="/backlog" element={<BacklogPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
