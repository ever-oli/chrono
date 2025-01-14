import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "./Auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <span className="hidden font-bold sm:inline-block">Timey</span>
          </Link>
          <div className="flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Home
            </Link>
            <Link
              to="/tracking"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/tracking"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Tracking
            </Link>
            <Link
              to="/habits"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/habits"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Habits
            </Link>
            <Link
              to="/timeline"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/timeline"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Timeline
            </Link>
            <Link
              to="/goals"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/goals"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Goals
            </Link>
            <Link
              to="/events"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/events"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Events
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button variant="ghost" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}