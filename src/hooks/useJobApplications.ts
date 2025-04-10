
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmployers } from "@/hooks/useEmployers";
import { Job } from "@/data/types";
import { mapSupabaseJobToJob } from "@/utils/mappers";

interface ApplicationData {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    resume_url: string | null;
    major: string | null;
    graduation_year: string | null;
  };
  status: "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";
  applied_date: string;
}

export function useJobApplications(jobId: string | undefined) {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const { getEmployerByUserId } = useEmployers();
  const navigate = useNavigate();
  const applicationsPerPage = 10;

  const loadJobAndApplications = async () => {
    try {
      setLoading(true);
      
      // First, verify the user is the employer who owns this job
      const employer = await getEmployerByUserId(user?.id || '');
      
      if (!employer) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to view this job's applications",
          variant: "destructive",
        });
        return;
      }
      
      // Get the job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('employer_id', employer.id)
        .single();
      
      if (jobError) {
        toast({
          title: "Error",
          description: "Failed to load job details",
          variant: "destructive",
        });
        return;
      }
      
      if (!jobData) {
        toast({
          title: "Job Not Found",
          description: "The job was not found or you don't have permission to view it",
          variant: "destructive",
        });
        return;
      }
      
      setJob(mapSupabaseJobToJob(jobData));
      
      // Calculate range for pagination
      const from = (page - 1) * applicationsPerPage;
      const to = from + applicationsPerPage - 1;
      
      // Build the applications query with filters
      let query = supabase
        .from('applications')
        .select(`
          id, 
          status, 
          applied_date,
          profiles!applications_user_id_fkey (
            id, 
            name, 
            email, 
            resume_url,
            major,
            graduation_year
          )
        `)
        .eq('job_id', jobId)
        .range(from, to);
      
      // Add status filter if selected
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      // Order by applied date (most recent first)
      query = query.order('applied_date', { ascending: false });
      
      const { data: applicationsData, error: applicationsError } = await query;
      
      if (applicationsError) {
        throw applicationsError;
      }
      
      // Get total count for pagination
      let countQuery = supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .eq('job_id', jobId);
        
      if (statusFilter) {
        countQuery = countQuery.eq('status', statusFilter);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        throw countError;
      }
      
      setTotalPages(Math.ceil((count || 0) / applicationsPerPage));
      
      // Transform the data to match our interface
      const transformedData: ApplicationData[] = applicationsData
        .filter(app => app.profiles) // Filter out any null profiles
        .map(app => ({
          id: app.id,
          user: {
            id: app.profiles.id,
            name: app.profiles.name || 'Unnamed Applicant',
            email: app.profiles.email || 'No email provided',
            resume_url: app.profiles.resume_url,
            major: app.profiles.major,
            graduation_year: app.profiles.graduation_year
          },
          status: app.status as "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected",
          applied_date: app.applied_date
        }));
      
      setApplications(transformedData);
      
    } catch (error: any) {
      console.error("Error loading applications:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: "Application status has been updated"
      });
      
      // Refresh the applications list
      loadJobAndApplications();
      
    } catch (error: any) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && jobId) {
      loadJobAndApplications();
    }
  }, [user, jobId, page, statusFilter]);

  return {
    applications,
    job,
    loading,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    updateApplicationStatus
  };
}
