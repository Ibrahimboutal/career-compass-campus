
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SavedJobsPage from "./pages/SavedJobsPage";
import MessagesPage from "./pages/MessagesPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import JobEditPage from "./pages/JobEditPage";
import EmployerJobApplicationsPage from "./pages/EmployerJobApplicationsPage";
import EmployerApplicationDetailPage from "./pages/EmployerApplicationDetailPage";
import NotFound from "./pages/NotFound";
import { Skeleton } from "./components/ui/skeleton";
import { Progress } from "./components/ui/progress";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component with progress bar
const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen p-4">
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2">Loading CampusJobs</h2>
        <p className="text-muted-foreground mb-4">Please wait while we set things up...</p>
      </div>
      <Progress value={75} className="h-2 w-full" />
      <div className="space-y-4 mt-8">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:id" element={<JobDetailPage />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/saved-jobs" 
        element={
          <ProtectedRoute>
            <SavedJobsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/connections" 
        element={
          <ProtectedRoute>
            <ConnectionsPage />
          </ProtectedRoute>
        } 
      />
      {/* Job Management Routes */}
      <Route 
        path="/jobs/:id/edit" 
        element={
          <ProtectedRoute>
            <JobEditPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs/:id/applications" 
        element={
          <ProtectedRoute>
            <EmployerJobApplicationsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/jobs/:jobId/applications/:applicationId" 
        element={
          <ProtectedRoute>
            <EmployerApplicationDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ChatProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ChatProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
