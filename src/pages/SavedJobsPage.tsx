
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { JobCard } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Job } from "@/data/types";
import { mapSupabaseJobToJob } from "@/utils/mappers";

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('saved_jobs')
          .select(`
            job_id,
            jobs (*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          const mappedJobs = data.map(item => mapSupabaseJobToJob(item.jobs));
          setSavedJobs(mappedJobs);
        }
      } catch (error: any) {
        console.error('Error fetching saved jobs:', error);
        toast({
          title: "Error",
          description: "Failed to load saved jobs. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedJobs();
  }, [user, toast]);

  const handleUnsaveJob = (jobId: string) => {
    setSavedJobs(savedJobs.filter(job => job.id !== jobId));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/dashboard" className="inline-flex items-center text-job-blue hover:underline mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to dashboard
          </Link>
          <h1 className="text-3xl font-bold">Saved Jobs</h1>
          <p className="text-gray-600">Jobs you've bookmarked for later</p>
        </div>
        
        {loading ? (
          <div className="text-center py-10 bg-white rounded-lg border">
            <p className="text-gray-600">Loading saved jobs...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg border">
            <h3 className="text-lg font-medium mb-2">No saved jobs yet</h3>
            <p className="text-gray-600 mb-4">Browse and bookmark jobs you're interested in</p>
            <Link to="/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                isSaved={true}
                onUnsave={() => handleUnsaveJob(job.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SavedJobsPage;
