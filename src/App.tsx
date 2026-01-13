import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Search from "./pages/Search";
import LawyerDetail from "./pages/LawyerDetail";
import Booking from "./pages/Booking";
import WaitingRoom from "./pages/WaitingRoom";
import Chat from "./pages/Chat";
import AIAssistant from "./pages/AIAssistant";
import Consultations from "./pages/Consultations";
import ConsultationHistory from "./pages/ConsultationHistory";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Notifications from "./pages/Notifications";
import TransactionHistory from "./pages/TransactionHistory";
import Auth from "./pages/Auth";
import LawyerDashboard from "./pages/LawyerDashboard";
import LawyerChat from "./pages/LawyerChat";
import LawyerProfile from "./pages/LawyerProfile";
import LawyerPricing from "./pages/LawyerPricing";
import LawyerDocuments from "./pages/LawyerDocuments";
import LawyerQuiz from "./pages/LawyerQuiz";
import LawyerConsultationDetail from "./pages/LawyerConsultationDetail";
import LegalAssistance from "./pages/LegalAssistance";
import LegalAssistanceDetail from "./pages/LegalAssistanceDetail";
import LegalAssistanceChat from "./pages/LegalAssistanceChat";
import LawyerAssistanceChat from "./pages/LawyerAssistanceChat";
import DocumentTemplates from "./pages/DocumentTemplates";
import LegalCalculator from "./pages/LegalCalculator";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminLawyerDetail from "./pages/SuperAdminLawyerDetail";
import SuperAdminConsultationDetail from "./pages/SuperAdminConsultationDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<Search />} />
            <Route path="/lawyer/:id" element={<LawyerDetail />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/waiting/:id" element={<WaitingRoom />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/consultation/:id" element={<ConsultationHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/profile/notifications" element={<Notifications />} />
            <Route path="/profile/transactions" element={<TransactionHistory />} />
            <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
            <Route path="/lawyer/profile" element={<LawyerProfile />} />
            <Route path="/lawyer/pricing" element={<LawyerPricing />} />
            <Route path="/lawyer/documents" element={<LawyerDocuments />} />
            <Route path="/lawyer/quiz" element={<LawyerQuiz />} />
            <Route path="/lawyer/chat/:id" element={<LawyerChat />} />
            <Route path="/lawyer/consultation/:id" element={<LawyerConsultationDetail />} />
            <Route path="/legal-assistance" element={<LegalAssistance />} />
            <Route path="/legal-assistance/:id" element={<LegalAssistanceDetail />} />
            <Route path="/legal-assistance/chat/:id" element={<LegalAssistanceChat />} />
            <Route path="/lawyer/assistance/:id" element={<LawyerAssistanceChat />} />
            <Route path="/document-templates" element={<DocumentTemplates />} />
            <Route path="/legal-calculator" element={<LegalCalculator />} />
            {/* Super Admin Routes */}
            <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
            <Route path="/admin/lawyer/:id" element={<SuperAdminLawyerDetail />} />
            <Route path="/admin/consultation/:id" element={<SuperAdminConsultationDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
