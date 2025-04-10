import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { JobForm } from "@/components/JobForm";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Job } from "@/data/types";
import { ArrowLeft } from "lucide-react";
import { useEmployers } from "@/hooks/useEmployers";
import { mapSupabaseJobToJob } from "@/utils/mappers";

export default function JobEditPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [employer, setEmployer] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getEmployerByUserId } = useEmployers();

  useEffect(() => {
    if (user && id) {
      fetchJobData();
    }
  }, [user, id]);

  const fetchJobData = async () => {
    try {
      setIsLoading(true);
      
      // First get the employer id
      const employerData = await getEmployerByUserId(user?.id || '');
      
      if (!employerData) {
        // No employer profile found
        toast({
          title: "Access Denied",
          description: "You need to register as an employer first",
          variant: "destructive",
        });
        navigate("/employer/register");
        return;
      }
      
      setEmployer({ id: employerData.id });
      
      // Now fetch the job data
      const { data: jobData, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("employer_id", employerData.id)
        .single();
      
      if (jobError) {
        if (jobError.code === "PGRST116") {
          toast({
            title: "Not Found",
            description: "Job not found or you don't have permission to edit it",
            variant: "destructive",
          });
          navigate("/employer/dashboard");
          return;
        }
        throw jobError;
      }
      
      setJob(mapSupabaseJobToJob(jobData));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load job data",
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

  if (!job || !employer) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Job not found</h1>
        <Button asChild>
          <ArrowLeft className="mr-2 h-4 w-4" />
          <a href="/employer/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/employer/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Job</CardTitle>
            <CardDescription>
              Update your job listing details
            </CardDescription>
          </CardHeader>
          <JobForm 
            job={job} 
            employerId={employer.id}
            onSuccess={() => {
              navigate("/employer/dashboard");
            }}
          />
        </Card>
      </div>
    </div>
  );
}
