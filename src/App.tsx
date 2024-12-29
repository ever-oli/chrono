import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import { TimerProvider } from "@/components/Timer/TimerContext";
import Events from "@/pages/Events";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" attribute="class">
        <TimerProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background text-foreground">
              <Events />
              <Navigation />
              <Toaster />
            </div>
          </BrowserRouter>
        </TimerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;