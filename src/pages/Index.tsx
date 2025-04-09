
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Find Your Perfect Campus Job
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mb-10">
              Connecting university students with the best job opportunities on and around campus.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    Sign Up Now
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
              <Link to="/jobs">
                <Button variant="outline" size="lg">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-job-blue/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-job-blue font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
                <p className="text-muted-foreground">Sign up with your university email to get started and complete your profile.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-job-blue/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-job-blue font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse Opportunities</h3>
                <p className="text-muted-foreground">Explore job listings tailored for university students on and around campus.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-job-blue/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-job-blue font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Apply and Track</h3>
                <p className="text-muted-foreground">Submit applications directly through the platform and track your application status.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">Find Jobs That Fit Your Schedule</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Balance your studies with work opportunities that accommodate your class schedule. 
                  From part-time roles to internships, find positions that help you gain valuable experience.
                </p>
                <Link to="/jobs">
                  <Button className="gap-2">
                    Explore Jobs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="md:w-1/2 bg-white p-6 rounded-lg border">
                <div className="space-y-4">
                  <div className="p-4 bg-job-blue/5 rounded-lg border border-job-blue/10">
                    <h3 className="font-semibold mb-1">Research Assistant</h3>
                    <p className="text-sm text-muted-foreground">Computer Science Department • Part-time</p>
                  </div>
                  
                  <div className="p-4 bg-job-blue/5 rounded-lg border border-job-blue/10">
                    <h3 className="font-semibold mb-1">Campus Tour Guide</h3>
                    <p className="text-sm text-muted-foreground">Admissions Office • Flexible Hours</p>
                  </div>
                  
                  <div className="p-4 bg-job-blue/5 rounded-lg border border-job-blue/10">
                    <h3 className="font-semibold mb-1">Marketing Intern</h3>
                    <p className="text-sm text-muted-foreground">University Communications • Internship</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Opportunity?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of students who have found valuable work experience through CampusJobs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg">Get Started</Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="h-5 w-5 text-white" />
                <span className="font-bold text-xl text-white">CampusJobs</span>
              </div>
              <p className="text-gray-400 mb-4">
                Connecting university students with meaningful employment opportunities.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link to="/auth" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/auth?tab=signup" className="hover:text-white transition-colors">Create Account</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resume Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Interview Prep</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} CampusJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
