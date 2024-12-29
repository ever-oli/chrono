import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Timeline from "./pages/Timeline";
import Events from "./pages/Events";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Statement from "./pages/Statement";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <Routes>
          <Route path="/" element={<Timeline />} />
          <Route path="/events" element={<Events />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/statement" element={<Statement />} />
        </Routes>
      </div>
    </Router>
  );
}