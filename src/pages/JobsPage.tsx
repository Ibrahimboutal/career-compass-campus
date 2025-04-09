
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { JobCard } from "@/components/JobCard";
import { JobFilter, FilterOptions } from "@/components/JobFilter";
import { Job } from "@/data/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { mapSupabaseJobsToJobs } from "@/utils/mappers";

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch jobs from Supabase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .order('posted_date', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const mappedJobs = mapSupabaseJobsToJobs(data);
          setJobs(mappedJobs);
          setFilteredJobs(mappedJobs);
        }
      } catch (error: any) {
        console.error('Error fetching jobs:', error);
        toast({
          title: "Error",
          description: "Failed to load jobs. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [toast]);

  // Check if user has applied to a job
  const hasApplied = async (jobId: string) => {
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('user_id', user.id)
      .single();
      
    return !!data && !error;
  };

  const handleFilter = (filters: FilterOptions) => {
    const { jobType, searchTerm, location } = filters;
    
    let filtered = [...jobs];
    
    // Filter by job type
    if (jobType.length > 0) {
      filtered = filtered.filter(job => jobType.includes(job.type));
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        job => 
          job.title.toLowerCase().includes(term) || 
          job.company.toLowerCase().includes(term) || 
          job.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by location
    if (location) {
      const loc = location.toLowerCase();
      filtered = filtered.filter(job => job.location.toLowerCase().includes(loc));
    }
    
    setFilteredJobs(filtered);
    
    toast({
      title: "Filters applied",
      description: `Showing ${filtered.length} job${filtered.length !== 1 ? 's' : ''}`
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <JobFilter onFilter={handleFilter} />
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white p-4 rounded-lg border mb-6 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredJobs.length}</span> jobs
              </p>
              <select className="text-sm border rounded p-1">
                <option>Most Recent</option>
                <option>Oldest First</option>
                <option>A-Z</option>
              </select>
            </div>
            
            {loading ? (
              <div className="text-center py-10 bg-white rounded-lg border">
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-lg border">
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    isApplied={false} // We'll update this with real data
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobsPage;
