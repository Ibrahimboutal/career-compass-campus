
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { JobForm } from "@/components/JobForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Calendar, Clock, Building2, User, BookMarked, MessageSquare, Users, PlusCircle, Building } from "lucide-react";
import { Job, Employer } from "@/data/types";
import { useEmployers } from "@/hooks/useEmployers";
import { mapSupabaseJobsToJobs } from "@/utils/mappers";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

// Student Dashboard Component
const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name: string; major: string } | null>(null);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, major")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch applied jobs count
        const { data: appliedData, error: appliedError } = await supabase
          .from("applications")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        if (appliedError) throw appliedError;
        setAppliedJobsCount(appliedData ? appliedData.length : 0);

        // Fetch saved jobs count
        const { data: savedData, error: savedError } = await supabase
          .from("saved_jobs")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        if (savedError) throw savedError;
        setSavedJobsCount(savedData ? savedData.length : 0);
      } catch (error: any) {
        console.error("Error fetching student data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [user, toast]);

  if (isLoading) {
    return <div className="py-8 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Profile Name"
          value={profile?.name || "N/A"}
          description="Your display name"
          icon={<User className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Major"
          value={profile?.major || "N/A"}
          description="Your field of study"
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Jobs Applied"
          value={appliedJobsCount}
          description="Total job applications"
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Jobs Saved"
          value={savedJobsCount}
          description="Jobs you've saved"
          icon={<BookMarked className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start h-auto py-2">
                <Link to="/jobs">
                  <Briefcase className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Browse Jobs</div>
                    <div className="text-xs text-muted-foreground mt-1">Find new opportunities</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-auto py-2">
                <Link to="/saved-jobs">
                  <BookMarked className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Saved Jobs</div>
                    <div className="text-xs text-muted-foreground mt-1">Review jobs you've saved</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-auto py-2">
                <Link to="/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Messages</div>
                    <div className="text-xs text-muted-foreground mt-1">Chat with recruiters</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-auto py-2">
                <Link to="/connections">
                  <Users className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Connections</div>
                    <div className="text-xs text-muted-foreground mt-1">Find recruiters to chat with</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and manage your profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm font-medium">Name</div>
              <div className="text-muted-foreground">{profile?.name || "N/A"}</div>
              <div className="text-sm font-medium">Major</div>
              <div className="text-muted-foreground">{profile?.major || "N/A"}</div>
              <Button asChild className="mt-4">
                <Link to="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>List of jobs you have applied for.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>List of jobs you have saved.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No saved jobs yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Employer Dashboard Component
const EmployerDashboard = () => {
  const { user } = useAuth();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationsCount, setApplicationsCount] = useState<Record<string, number>>({});
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const { toast } = useToast();
  const { getEmployerByUserId } = useEmployers();

  useEffect(() => {
    if (user) {
      fetchEmployerData();
    }
  }, [user]);

  const fetchEmployerData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch employer profile
      const employerData = await getEmployerByUserId(user?.id || '');
      
      if (!employerData) {
        // Show registration option instead of redirecting
        setIsLoading(false);
        return;
      }
      
      setEmployer(employerData);
      
      // Fetch jobs posted by this employer
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", employerData.id)
        .order("posted_date", { ascending: false });
      
      if (jobsError) throw jobsError;
      
      setJobs(mapSupabaseJobsToJobs(jobsData || []));
      
      // Fetch application counts for each job
      const jobIds = jobsData?.map(job => job.id) || [];
      if (jobIds.length > 0) {
        const { data: applicationsData, error: applicationsError } = await supabase
          .from("applications")
          .select("job_id, count")
          .in("job_id", jobIds)
          .select("job_id");
        
        if (!applicationsError && applicationsData) {
          const counts: Record<string, number> = {};
          jobIds.forEach(id => {
            counts[id] = applicationsData.filter(app => app.job_id === id).length;
          });
          setApplicationsCount(counts);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load employer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="py-8 flex items-center justify-center">Loading...</div>;
  }

  if (!employer) {
    return (
      <div className="py-8">
        <Card>
          <CardHeader>
            <CardTitle>Become an Employer</CardTitle>
            <CardDescription>Create an employer profile to post jobs and connect with students.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/employer/register">Register as Employer</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Employer Dashboard</h2>
        <div className="flex gap-2">
          <Link to="/messages">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </Link>
          <Link to="/connections">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Find Students
            </Button>
          </Link>
          <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
                <DialogDescription>
                  Fill in the details to post a new job opening.
                </DialogDescription>
              </DialogHeader>
              <JobForm 
                employerId={employer.id} 
                onSuccess={() => {
                  setIsJobDialogOpen(false);
                  fetchEmployerData();
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Company
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employer.company_name}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {employer.industry || "No industry specified"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jobs Posted
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active job listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applicants
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(applicationsCount).reduce((acc, count) => acc + count, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all job listings
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="jobs">Posted Jobs</TabsTrigger>
          <TabsTrigger value="company">Company Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {job.location} • Posted on {new Date(job.postedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{job.type}</Badge>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm line-clamp-2">{job.description}</p>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/jobs/${job.id}`}>View Listing</Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/employer/jobs/${job.id}/applications`}>
                          View Applications ({applicationsCount[job.id] || 0})
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/employer/jobs/${job.id}/edit`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No jobs posted yet</h3>
              <p className="text-muted-foreground mt-1">Click "Post New Job" to create your first job listing.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Company Name</h3>
                <p>{employer.company_name}</p>
              </div>
              
              {employer.industry && (
                <div>
                  <h3 className="font-medium">Industry</h3>
                  <p>{employer.industry}</p>
                </div>
              )}
              
              {employer.company_size && (
                <div>
                  <h3 className="font-medium">Company Size</h3>
                  <p>{employer.company_size}</p>
                </div>
              )}
              
              {employer.website && (
                <div>
                  <h3 className="font-medium">Website</h3>
                  <a 
                    href={employer.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {employer.website}
                  </a>
                </div>
              )}
              
              {employer.company_description && (
                <div>
                  <h3 className="font-medium">About</h3>
                  <p>{employer.company_description}</p>
                </div>
              )}
              
              <div className="pt-4">
                <Button asChild>
                  <Link to="/employer/profile/edit">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Main Dashboard Page
const DashboardPage = () => {
  const { user, userRole, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Show appropriate dashboard based on user role
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        
        {userRole === 'recruiter' ? (
          <EmployerDashboard />
        ) : userRole === 'student' ? (
          <StudentDashboard />
        ) : (
          <div className="text-center py-12">
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>
                  Tell us whether you're a student or an employer to continue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Please complete your profile to access the dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild>
                    <Link to="/profile">Set Up Student Profile</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/employer/register">Register as Employer</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
