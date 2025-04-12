
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { JobForm } from "@/components/JobForm";
import { Briefcase, PlusCircle, Building, UserRound, MessageSquare, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Job, Employer } from "@/data/types";
import { useEmployers } from "@/hooks/useEmployers";
import { mapSupabaseJobsToJobs } from "@/utils/mappers";

export default function EmployerDashboardPage() {
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
        // No employer profile found, redirect to registration
        window.location.href = "/employer/register";
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
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Employer Dashboard</h1>
        <p>No employer profile found. Please create one to continue.</p>
        <Button asChild className="mt-4">
          <Link to="/employer/register">Register as Employer</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
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
            <UserRound className="h-4 w-4 text-muted-foreground" />
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
}
