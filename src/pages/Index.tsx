
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Search, Briefcase, GraduationCap, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-job-blue to-job-lightblue text-white py-16 md:py-24">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Find Your Perfect Campus Job
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                Connect with employers looking for university talent. Kickstart your career journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/jobs">
                  <Button size="lg" className="bg-white text-job-blue hover:bg-gray-100">
                    Browse Jobs
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Student Dashboard
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Students finding jobs" 
                className="max-w-md w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-job-lightgray">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-job-blue/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-7 w-7 text-job-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Search Jobs</h3>
                <p className="text-gray-600">
                  Browse through opportunities tailored for university students across various industries and roles.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-job-blue/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-7 w-7 text-job-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Apply with Ease</h3>
                <p className="text-gray-600">
                  Simple application process that lets you apply to multiple positions with just a few clicks.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-job-blue/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-7 w-7 text-job-blue" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Track Applications</h3>
                <p className="text-gray-600">
                  Monitor the status of your applications and receive updates throughout the hiring process.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Job Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Popular Job Categories</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Discover opportunities across various fields and industries that match your interests and skills
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/jobs?category=tech" className="bg-blue-50 p-6 rounded-lg hover:bg-blue-100 transition-colors flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <GraduationCap className="h-6 w-6 text-job-blue" />
                </div>
                <h3 className="font-medium">Technology</h3>
                <p className="text-sm text-gray-600 mt-1">24 Jobs</p>
              </Link>
              
              <Link to="/jobs?category=business" className="bg-green-50 p-6 rounded-lg hover:bg-green-100 transition-colors flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium">Business</h3>
                <p className="text-sm text-gray-600 mt-1">18 Jobs</p>
              </Link>
              
              <Link to="/jobs?category=research" className="bg-purple-50 p-6 rounded-lg hover:bg-purple-100 transition-colors flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium">Research</h3>
                <p className="text-sm text-gray-600 mt-1">15 Jobs</p>
              </Link>
              
              <Link to="/jobs?category=creative" className="bg-yellow-50 p-6 rounded-lg hover:bg-yellow-100 transition-colors flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-medium">Creative</h3>
                <p className="text-sm text-gray-600 mt-1">12 Jobs</p>
              </Link>
            </div>
            
            <div className="text-center mt-10">
              <Link to="/jobs">
                <Button variant="outline" size="lg">
                  View All Categories
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-job-blue text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Briefcase className="h-6 w-6 mr-2" />
              <span className="font-bold text-xl">CampusJobs</span>
            </div>
            <div className="flex gap-6">
              <Link to="/" className="hover:underline">Home</Link>
              <Link to="/jobs" className="hover:underline">Browse Jobs</Link>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <Link to="/profile" className="hover:underline">Profile</Link>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-sm text-white/70">
            <p>© {new Date().getFullYear()} CampusJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
