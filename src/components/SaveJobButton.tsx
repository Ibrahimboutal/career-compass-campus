
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface SaveJobButtonProps {
  jobId: string;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  onSaveStatusChange?: (isSaved: boolean) => void;
}

export function SaveJobButton({ 
  jobId, 
  className, 
  variant = "outline", 
  size = "sm",
  onSaveStatusChange
}: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check if job is already saved when component mounts
    const checkSavedStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('job_id', jobId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        
        setIsSaved(!!data);
      } catch (error: any) {
        console.error('Error checking saved status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSavedStatus();
  }, [jobId, user]);

  const toggleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save jobs",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (isSaved) {
        // Unsave the job
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', jobId)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setIsSaved(false);
        toast({
          title: "Job removed",
          description: "Job has been removed from your saved list",
        });
      } else {
        // Save the job
        const { error } = await supabase
          .from('saved_jobs')
          .insert([{ job_id: jobId, user_id: user.id }]);
          
        if (error) throw error;
        
        setIsSaved(true);
        toast({
          title: "Job saved",
          description: "Job has been added to your saved list",
        });
      }
      
      // Notify parent component about the change
      if (onSaveStatusChange) {
        onSaveStatusChange(!isSaved);
      }
    } catch (error: any) {
      console.error('Error saving/unsaving job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update saved status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={toggleSave}
      disabled={loading}
    >
      {isSaved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      <span className="sr-only">{isSaved ? "Unsave" : "Save"} job</span>
    </Button>
  );
}
