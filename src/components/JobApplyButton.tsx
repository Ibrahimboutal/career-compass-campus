
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface JobApplyButtonProps {
  jobId: string;
  isApplied: boolean;
  onApplySuccess?: () => void;
}

export function JobApplyButton({ jobId, isApplied, onApplySuccess }: JobApplyButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for jobs",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: user.id,
          status: 'Applied'
        });
      
      if (error) throw error;
      
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully"
      });
      
      if (onApplySuccess) {
        onApplySuccess();
      }
      
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (isApplied) {
    return (
      <Button disabled className="w-full">
        Already Applied
      </Button>
    );
  }

  return (
    <Button onClick={handleApply} disabled={loading} className="w-full">
      {loading ? "Submitting..." : "Apply Now"}
    </Button>
  );
}
