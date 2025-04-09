
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Briefcase, Building, Calendar, Clock, MapPin, Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JobApplyButton } from "@/components/JobApplyButton";
import { useAuth } from "@/contexts/AuthContext";
import { Job } from "@/data/types";
import { mapSupabaseJobToJob } from "@/utils/mappers";

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();
        
        if (jobError) throw jobError;
        
        if (jobData) {
          setJob(mapSupabaseJobToJob(jobData));
        }
        
        // Check if user has applied
        if (user) {
          const { data: applicationData, error: applicationError } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', id)
            .eq('user_id', user.id)
            .single();
            
          if (!applicationError && applicationData) {
            setIsApplied(true);
          }
        }
        
      } catch (error: any) {
        console.error("Error fetching job details:", error);
        toast({
          title: "Error",
          description: "Failed to load job details. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetail();
  }, [id, user, toast]);

  const handleApplySuccess = () => {
    setIsApplied(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p>Loading job details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
            <p className="mb-6">The job you're looking for doesn't exist or has been removed.</p>
            <Link to="/jobs">
              <Button>Browse All Jobs</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link to="/jobs" className="inline-flex items-center text-job-blue hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all jobs
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 bg-job-lightgray rounded-md flex items-center justify-center">
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} className="w-10 h-10 object-contain" />
                      ) : (
                        <Building className="h-8 w-8 text-job-blue" />
                      )}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{job.title}</h1>
                      <p className="text-gray-600">{job.company}</p>
                      <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1" />
                          {job.type}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Posted {new Date(job.postedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Job Description</h2>
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
                
                <div className="mt-6">
                  <h2 className="text-lg font-semibold mb-2">Requirements</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Apply Section */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Job Summary</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Salary</p>
                    <p className="font-medium">{job.salary || "Not specified"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <Badge variant="outline" className="mt-1">
                      {job.type}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{job.location}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Application Deadline</p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1 text-job-blue" />
                      <span>{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Open until filled"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <JobApplyButton 
                    jobId={job.id} 
                    isApplied={isApplied}
                    onApplySuccess={handleApplySuccess}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Company Information</h2>
                <p>{job.company}</p>
                <Link to="#" className="text-job-blue hover:underline block mt-2">
                  View company profile
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;
