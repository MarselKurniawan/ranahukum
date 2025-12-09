import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Search from "./pages/Search";
import LawyerDetail from "./pages/LawyerDetail";
import Booking from "./pages/Booking";
import WaitingRoom from "./pages/WaitingRoom";
import Chat from "./pages/Chat";
import AIAssistant from "./pages/AIAssistant";
import Consultations from "./pages/Consultations";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/lawyer/:id" element={<LawyerDetail />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/waiting/:id" element={<WaitingRoom />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
