
import { EmployerRegistrationForm } from "@/components/EmployerRegistrationForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function EmployerRegistrationPage() {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user already has a recruiter role, redirect to employer dashboard
  if (userRole === "recruiter") {
    return <Navigate to="/employer/dashboard" replace />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-center mb-6">Register as an Employer</h1>
      <div className="max-w-2xl mx-auto">
        <EmployerRegistrationForm />
      </div>
    </div>
  );
}
