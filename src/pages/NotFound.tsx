
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-job-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="h-8 w-8 text-job-blue" />
        </div>
        <h1 className="text-4xl font-bold mb-4 text-job-blue">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! This page doesn't exist</p>
        <p className="text-gray-500 mb-8">
          The page you're looking for may have been moved or deleted.
          Let's get you back on track to find your next opportunity!
        </p>
        <Link to="/">
          <Button size="lg" className="w-full">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
