import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";

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
import AdminCourseManager from "./pages/AdminCourseManager";
import AdminCourseEditor from "./pages/AdminCourseEditorNew";
import AdminUsers from "./pages/AdminUsers";
import AdminPlans from "./pages/AdminPlans";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import ExamPage from "./pages/ExamPage";
import ExamResults from "./pages/ExamResults";
import CertificateView from "./pages/CertificateView";
import LessonViewer from "./pages/LessonViewer";
import DatabaseValidator from "./pages/DatabaseValidator";
import CheckoutDemo from "./pages/CheckoutDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log('🎯 App component rendering');
  return (
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
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/courses/:courseId/lesson/:lessonId" element={<LessonViewer />} />
              <Route path="/courses/:courseId/exam/:lessonId" element={<ExamPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route 
                path="/dashboard" 
                element={<Dashboard />} 
              />
              <Route 
                path="/profile" 
                element={<Profile />} 
              />
              <Route 
                path="/checkout" 
                element={<Checkout />} 
              />
              <Route 
                path="/checkout-demo" 
                element={<CheckoutDemo />} 
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminCourseManager />} />
              <Route path="/admin-dashboard" element={<AdminCourseManager />} />
              <Route path="/admin/dashboard" element={<AdminCourseManager />} />
              <Route path="/admin/courses" element={<AdminCourseManager />} />
              <Route path="/admin/courses/:courseId" element={<AdminCourseEditor />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/plans" element={<AdminPlans />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/admin/database" element={<DatabaseValidator />} />
              <Route
                path="/exam/:examId"
                element={<ExamPage />}
              />
              <Route 
                path="/exam-results/:attemptId" 
                element={<ExamResults />} 
              />
              <Route 
                path="/certificate/:certificateNumber" 
                element={<CertificateView />} 
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
};

export default App;
