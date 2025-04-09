
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { JobCard } from "@/components/JobCard";
import { JobFilter, FilterOptions } from "@/components/JobFilter";
import { jobsData } from "@/data/jobsData";
import { currentUser } from "@/data/userData";
import { Job } from "@/data/types";
import { useToast } from "@/hooks/use-toast";

const JobsPage = () => {
  const [jobs, setJobs] = useState<Job[]>(jobsData);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>(jobsData);
  const { toast } = useToast();

  // Check if user has applied to a job
  const hasApplied = (jobId: string) => {
    return currentUser.applications.some(app => app.jobId === jobId);
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
            
            {filteredJobs.length === 0 ? (
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
                    isApplied={hasApplied(job.id)}
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
