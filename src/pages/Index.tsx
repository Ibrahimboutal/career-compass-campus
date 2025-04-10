
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Search, GraduationCap, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function Index() {
  const { user } = useAuth();
  const [isEmployer, setIsEmployer] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkIfEmployer();
    }
  }, [user]);
  
  const checkIfEmployer = async () => {
    const { data } = await supabase
      .from('employers')
      .select('id')
      .eq('user_id', user?.id);
      
    setIsEmployer(!!data && data.length > 0);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="w-full border-b bg-white py-4">
        <div className="container flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-job-blue" />
            <span className="font-bold text-xl text-job-blue">CampusJobs</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-gray-600 hover:text-gray-900">Browse Jobs</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
                {isEmployer ? (
                  <Link to="/employer/dashboard" className="text-gray-600 hover:text-gray-900">
                    Employer Dashboard
                  </Link>
                ) : (
                  <Link to="/employer/register" className="text-gray-600 hover:text-gray-900">
                    For Employers
                  </Link>
                )}
              </>
            ) : (
              <Link to="/auth" className="text-gray-600 hover:text-gray-900">For Employers</Link>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button>My Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                  Find Your Perfect Campus Job
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Connect with the best employment opportunities at your university.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/jobs">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Search className="mr-2 h-5 w-5" />
                      Browse Jobs
                    </Button>
                  </Link>
                  {!user && (
                    <Link to="/auth">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        Sign Up
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="/placeholder.svg" 
                  alt="Campus Jobs" 
                  className="w-full h-auto rounded-lg shadow-xl"
                  style={{ maxWidth: "500px" }}
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Search className="h-8 w-8 text-job-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Find Opportunities</h3>
                <p className="text-gray-600">
                  Browse through a curated list of on-campus job opportunities.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <GraduationCap className="h-8 w-8 text-job-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Apply with Ease</h3>
                <p className="text-gray-600">
                  Submit your applications directly through our platform.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <Building className="h-8 w-8 text-job-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">For Employers</h3>
                <p className="text-gray-600">
                  Post job opportunities and find talented students for your positions.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">
                  Are you an employer looking to hire students?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Post your job opportunities and connect with talented students on campus.
                </p>
                {user ? (
                  isEmployer ? (
                    <Link to="/employer/dashboard">
                      <Button size="lg">
                        Go to Employer Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/employer/register">
                      <Button size="lg">
                        Register as an Employer
                      </Button>
                    </Link>
                  )
                ) : (
                  <Link to="/auth">
                    <Button size="lg">
                      Sign Up as an Employer
                    </Button>
                  </Link>
                )}
              </div>
              <div className="md:w-5/12">
                <img 
                  src="/placeholder.svg"
                  alt="For Employers" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-white" />
                <span className="font-bold text-xl text-white">CampusJobs</span>
              </Link>
              <p className="text-gray-400 max-w-md">
                Connecting students with quality employment opportunities on campus.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">For Students</h3>
                <ul className="space-y-2">
                  <li><Link to="/jobs" className="text-gray-400 hover:text-white">Browse Jobs</Link></li>
                  <li><Link to="/dashboard" className="text-gray-400 hover:text-white">Your Applications</Link></li>
                  <li><Link to="/profile" className="text-gray-400 hover:text-white">Profile</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">For Employers</h3>
                <ul className="space-y-2">
                  <li><Link to="/employer/register" className="text-gray-400 hover:text-white">Post a Job</Link></li>
                  <li><Link to="/employer/dashboard" className="text-gray-400 hover:text-white">Manage Listings</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CampusJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
