import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { TimerProvider } from "@/components/Timer/TimerContext";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import Tracking from "./pages/Tracking";
import Events from "./pages/Events";
import Timeline from "./pages/Timeline";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Auth from "./pages/Auth";
import { useState } from "react";

const SignOutButton = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <Button 
      variant="ghost"
      size="icon"
      className="fixed md:top-4 md:right-4 top-2 right-2 z-50"
      onClick={handleSignOut}
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
};

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TimerProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <SignOutButton />
                    <Tracking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events"
                element={
                  <ProtectedRoute>
                    <SignOutButton />
                    <Events />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute>
                    <SignOutButton />
                    <Timeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <SignOutButton />
                    <Goals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/habits"
                element={
                  <ProtectedRoute>
                    <SignOutButton />
                    <Habits />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Navigation />
            <Sonner position="top-center" />
          </BrowserRouter>
        </TimerProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;