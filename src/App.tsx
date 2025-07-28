import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Dashboard from "./pages/Dashboard";
import Checkout from "./pages/Checkout";
import Subscription from "./pages/Subscription";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import About from "./pages/About";
import FAQPage from "./pages/FAQ";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCourseEditor from "./pages/AdminCourseEditor";
import AdminUsers from "./pages/AdminUsers";
import ExamPage from "./pages/ExamPage";
import ExamResults from "./pages/ExamResults";
import CertificateView from "./pages/CertificateView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } 
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/courses/:id" element={<AdminCourseEditor />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route 
                path="/exam/:examId" 
                element={
                  <ProtectedRoute>
                    <ExamPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/exam-results/:attemptId" 
                element={
                  <ProtectedRoute>
                    <ExamResults />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/certificate/:certificateNumber" 
                element={
                  <ProtectedRoute>
                    <CertificateView />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
