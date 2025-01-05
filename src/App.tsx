import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TimerProvider } from "@/components/Timer/TimerContext";
import Navigation from "@/components/Navigation";
import Tracking from "./pages/Tracking";
import Events from "./pages/Events";
import Timeline from "./pages/Timeline";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { useState } from "react";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen pb-20">
              <Routes>
                <Route path="/" element={<Tracking />} />
                <Route path="/events" element={<Events />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/habits" element={<Habits />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Navigation />
          </BrowserRouter>
        </TooltipProvider>
      </TimerProvider>
    </QueryClientProvider>
  );
}

export default App;