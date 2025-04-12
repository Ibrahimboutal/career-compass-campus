
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
      
      // Now get the application details with joins to students table instead of profiles
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id, 
          status, 
          applied_date,
          notes,
          students!applications_user_id_fkey (
            id, 
            name, 
            email, 
            resume_url,
            major,
            graduation_year,
            skills
          ),
          jobs!applications_job_id_fkey (
            id,
            title,
            company
          )
        `)
        .eq('id', applicationId)
        .eq('job_id', jobId)
        .single();
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        toast({
          title: "Application Not Found",
          description: "The application you're looking for doesn't exist",
          variant: "destructive",
        });
        navigate(`/employer/jobs/${jobId}/applications`);
        return;
      }
      
      const applicationDetail: ApplicationDetail = {
        id: data.id,
        status: data.status as "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected",
        applied_date: data.applied_date,
        notes: data.notes,
        user: {
          id: data.students.id,
          name: data.students.name,
          email: data.students.email,
          resume_url: data.students.resume_url,
          major: data.students.major,
          graduation_year: data.students.graduation_year,
          skills: data.students.skills
        },
        job: {
          id: data.jobs.id,
          title: data.jobs.title,
          company: data.jobs.company
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
