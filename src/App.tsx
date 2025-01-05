import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TimerProvider } from "@/components/Timer/TimerContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Tracking from "./pages/Tracking";
import Events from "./pages/Events";
import Timeline from "./pages/Timeline";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Login from "./pages/Login";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen pb-20">
              <Routes>
                {!session ? (
                  <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </>
                ) : (
                  <>
                    <Route path="/" element={<Tracking />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/timeline" element={<Timeline />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/habits" element={<Habits />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </>
                )}
              </Routes>
            </div>
            {session && <Navigation />}
          </BrowserRouter>
        </TooltipProvider>
      </TimerProvider>
    </QueryClientProvider>
  );
};

export default App;