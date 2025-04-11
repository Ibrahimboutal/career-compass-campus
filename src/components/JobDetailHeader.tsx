
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Job } from "@/data/types";
import { Briefcase, MapPin, Calendar } from "lucide-react";
import { JobApplyButton } from "@/components/JobApplyButton";
import { SaveJobButton } from "@/components/SaveJobButton";
import { ChatWithRecruiterButton } from "@/components/ChatWithRecruiterButton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface JobDetailHeaderProps {
  job: Job;
  isApplied?: boolean;
}

export function JobDetailHeader({ job, isApplied = false }: JobDetailHeaderProps) {
  const [recruiterId, setRecruiterId] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch the recruiter ID (employer's user_id) if we have an employer_id
    const fetchRecruiterId = async () => {
      if (!job.employerId) return;
      
      try {
        const { data, error } = await supabase
          .from('employers')
          .select('user_id')
          .eq('id', job.employerId)
          .single();
          
        if (error) throw error;
        setRecruiterId(data.user_id);
      } catch (error) {
        console.error('Error fetching recruiter ID:', error);
      }
    };
    
    fetchRecruiterId();
  }, [job.employerId]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Posted {new Date(job.postedDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary">{job.type}</Badge>
              {job.salary && <Badge variant="outline">{job.salary}</Badge>}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <SaveJobButton jobId={job.id} variant="outline" />
            
            {recruiterId && (
              <ChatWithRecruiterButton 
                recruiterId={recruiterId} 
                jobId={job.id}
              />
            )}
            
            <JobApplyButton jobId={job.id} isApplied={isApplied} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
