import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmployers } from "@/hooks/useEmployers";

interface ApplicationDetail {
  id: string;
  status: "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";
  applied_date: string;
  notes: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    resume_url: string | null;
    major: string | null;
    graduation_year: string | null;
    skills: string[] | null;
  };
  job: {
    id: string;
    title: string;
    company: string;
  };
}

export function useApplicationDetail(jobId: string | undefined, applicationId: string | undefined) {
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { getEmployerByUserId } = useEmployers();
  const navigate = useNavigate();

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      
      // First, verify the user is the employer who owns this job
      const employer = await getEmployerByUserId(user?.id || '');
      
      if (!employer) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to view this application",
          variant: "destructive",
        });
        navigate("/employer/dashboard");
        return;
      }
      
      // Get the job to verify employer owns it
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('employer_id', employer.id)
        .single();
      
      if (jobError || !jobData) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view this job's applications",
          variant: "destructive",
        });
        navigate("/employer/dashboard");
        return;
      }
      
      // First get the application
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('id, status, applied_date, notes, job_id, user_id')
        .eq('id', applicationId)
        .eq('job_id', jobId)
        .single();
      
      if (appError) {
        throw appError;
      }
      
      // Then get the student info separately
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id, name, email, resume_url, major, graduation_year, skills')
        .eq('user_id', appData.user_id)
        .single();
      
      if (studentError) {
        console.error("Error fetching student data:", studentError);
      }
      
      // Then get the job info separately
      const { data: jobInfo, error: jobInfoError } = await supabase
        .from('jobs')
        .select('id, title, company')
        .eq('id', appData.job_id)
        .single();
      
      if (jobInfoError) {
        console.error("Error fetching job data:", jobInfoError);
      }
      
      const applicationDetail: ApplicationDetail = {
        id: appData.id,
        status: appData.status as "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected",
        applied_date: appData.applied_date,
        notes: appData.notes,
        user: {
          id: studentData?.id || appData.user_id,
          name: studentData?.name || 'Unknown Student',
          email: studentData?.email || 'No email provided',
          resume_url: studentData?.resume_url,
          major: studentData?.major,
          graduation_year: studentData?.graduation_year,
          skills: studentData?.skills
        },
        job: {
          id: jobInfo?.id || appData.job_id,
          title: jobInfo?.title || 'Unknown Position',
          company: jobInfo?.company || 'Unknown Company'
        }
      };
      
      setApplication(applicationDetail);
      setStatus(applicationDetail.status);
      setNotes(applicationDetail.notes || "");
      
    } catch (error: any) {
      console.error("Error loading application details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load application details",
        variant: "destructive",
      });
      navigate(`/employer/jobs/${jobId}/applications`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!application) return;
    
    try {
      setSavingNotes(true);
      
      const { error } = await supabase
        .from('applications')
        .update({ notes: notes })
        .eq('id', application.id);
        
      if (error) throw error;
      
      toast({
        title: "Notes Saved",
        description: "Your notes have been saved successfully",
      });
      
    } catch (error: any) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save notes",
        variant: "destructive",
      });
    } finally {
      setSavingNotes(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!application || newStatus === application.status) return;
    
    try {
      setUpdatingStatus(true);
      setStatus(newStatus);
      
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus })
        .eq('id', application.id);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Application status changed to "${newStatus}"`,
      });
      
      // Update the local state
      setApplication({
        ...application,
        status: newStatus as any
      });
      
    } catch (error: any) {
      console.error("Error updating status:", error);
      // Revert status on error
      setStatus(application.status);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (user && jobId && applicationId) {
      loadApplicationDetails();
    }
  }, [user, jobId, applicationId]);

  return {
    application,
    notes,
    setNotes,
    status,
    loading,
    savingNotes,
    updatingStatus,
    handleSaveNotes,
    handleStatusChange
  };
}
