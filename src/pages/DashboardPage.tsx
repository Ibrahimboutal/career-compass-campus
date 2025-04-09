
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { JobCard } from "@/components/JobCard";
import { Briefcase, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@/data/types";
import { mapSupabaseJobToJob, mapApplicationStatus, mapSupabaseJobsToJobs } from "@/utils/mappers";

// Define application type
interface Application {
  id: string;
  jobId: string;
  status: "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";
  appliedDate: string;
  job: Job;
}

// Define user profile type
interface Profile {
  id: string;
  name: string;
  email: string;
  major: string;
  graduation_year: string;
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        
        if (profileData) {
          setProfile(profileData);
        }
        
        // Fetch user's applications with job details
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select(`
            id,
            job_id,
            status,
            applied_date,
            jobs (*)
          `)
          .eq('user_id', user.id)
          .order('applied_date', { ascending: false });
          
        if (applicationsError) throw applicationsError;
        
        if (applicationsData) {
          const formattedApplications = applicationsData.map(app => ({
            id: app.id,
            jobId: app.job_id,
            status: mapApplicationStatus(app.status),
            appliedDate: app.applied_date,
            job: mapSupabaseJobToJob(app.jobs)
          }));
          
          setApplications(formattedApplications);
        }
        
        // Fetch recommended jobs (jobs user hasn't applied to)
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .order('posted_date', { ascending: false })
          .limit(4);
          
        if (jobsError) throw jobsError;
        
        if (jobsData) {
          // Filter out jobs the user has already applied to
          const appliedJobIds = applications.map(app => app.jobId);
          const filteredJobs = jobsData.filter(job => !appliedJobIds.includes(job.id));
          setRecommendedJobs(mapSupabaseJobsToJobs(filteredJobs.slice(0, 2)));
        }
        
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-10">
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
            <p className="text-gray-600">Manage your job applications and profile</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link to="/jobs">
              <Button>
                <Briefcase className="mr-2 h-4 w-4" />
                Browse Jobs
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Applications</CardTitle>
                  <CardDescription>Your job applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{applications.length}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/dashboard" onClick={() => setActiveTab("applications")}>View all</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                  <CardDescription>Enhance your job prospects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">75%</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/dashboard" onClick={() => setActiveTab("profile")}>Complete</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Saved Jobs</CardTitle>
                  <CardDescription>Jobs you've bookmarked</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">0</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/saved-jobs">View all</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Your most recent job applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                      <Link to="/jobs">
                        <Button>Browse Jobs</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 3).map(application => (
                        <div key={application.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-job-lightgray rounded-md flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-job-blue" />
                            </div>
                            <div>
                              <h3 className="font-medium">{application.job.title}</h3>
                              <p className="text-sm text-gray-600">{application.job.company}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Applied on {new Date(application.appliedDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <ApplicationStatusBadge status={application.status} />
                            <Link to={`/jobs/${application.jobId}`} className="text-xs text-job-blue mt-2 hover:underline">
                              View Job
                            </Link>
                          </div>
                        </div>
                      ))}
                      
                      {applications.length > 3 && (
                        <div className="text-center pt-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to="/dashboard" onClick={() => setActiveTab("applications")}>
                              View all applications
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Jobs</CardTitle>
                  <CardDescription>Based on your profile and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  {recommendedJobs.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No recommended jobs at the moment</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendedJobs.map(job => (
                        <JobCard key={job.id} job={job} isApplied={false} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track all your job applications</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">You haven't applied to any jobs yet</p>
                    <Link to="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map(application => (
                      <div key={application.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-start gap-3 mb-3 md:mb-0">
                          <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-job-blue" />
                          </div>
                          <div>
                            <h3 className="font-medium">{application.job.title}</h3>
                            <p className="text-sm text-gray-600">{application.job.company} • {application.job.location}</p>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>Applied on {new Date(application.appliedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-3 md:gap-2">
                          <ApplicationStatusBadge status={application.status} />
                          <Link to={`/jobs/${application.jobId}`}>
                            <Button variant="outline" size="sm">View Details</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
                <CardDescription>Your personal and academic information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3 flex flex-col items-center">
                    <div className="w-24 h-24 bg-job-lightgray rounded-full flex items-center justify-center mb-4">
                      <User className="w-12 h-12 text-job-blue" />
                    </div>
                    <h3 className="font-semibold text-lg">{profile?.name || "Your Name"}</h3>
                    <p className="text-gray-600">{profile?.major || "Your Major"} Student</p>
                    <p className="text-sm text-gray-500">Graduating {profile?.graduation_year || "Year"}</p>
                    
                    <div className="mt-4 w-full">
                      <Button variant="outline" className="w-full">Edit Profile</Button>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p>{profile?.name || "Not set"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Email</p>
                            <p>{profile?.email || user?.email || "Not set"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Major</p>
                            <p>{profile?.major || "Not set"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">Graduation Year</p>
                            <p>{profile?.graduation_year || "Not set"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <h3 className="font-medium mb-2">Resume & Documents</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <p className="font-medium">No resume uploaded</p>
                            <p className="text-sm text-gray-500">Upload your resume to apply more easily</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm">Upload Resume</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <h3 className="font-medium mb-2">Skills & Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" className="h-6">+ Add Skills</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;
