
import { Job } from "@/data/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SaveJobButton } from "./SaveJobButton";

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
  isSaved?: boolean;
  className?: string;
  onUnsave?: () => void;
}

export function JobCard({ job, isApplied = false, isSaved = false, className, onUnsave }: JobCardProps) {
  const formattedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const daysAgo = Math.floor((new Date().getTime() - new Date(job.postedDate).getTime()) / (1000 * 3600 * 24));

  const handleSaveStatusChange = (newSavedStatus: boolean) => {
    // If job was saved and is now unsaved, and we have an onUnsave callback, call it
    if (!newSavedStatus && isSaved && onUnsave) {
      onUnsave();
    }
  };

  return (
    <Card className={cn("job-card-shadow", className)}>
      <CardContent className="pt-6">
        <div className="flex justify-between mb-2 items-start">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 bg-job-lightgray rounded-md flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-job-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{job.title}</h3>
              <p className="text-sm text-muted-foreground">{job.company}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <SaveJobButton jobId={job.id} onSaveStatusChange={handleSaveStatusChange} />
            <Badge variant={job.type === "Internship" ? "secondary" : job.type === "Part-time" ? "outline" : "default"}>
              {job.type}
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {job.location} {job.salary && `• ${job.salary}`}
          </p>
          
          <p className="text-sm line-clamp-2">
            {job.description}
          </p>
          
          <div className="flex items-center text-xs text-muted-foreground gap-2">
            <Calendar className="h-3 w-3" />
            <span>Posted {daysAgo} days ago • Apply by {new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex gap-2">
        {isApplied ? (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Applied
          </Badge>
        ) : (
          <Link to={`/jobs/${job.id}`} className="w-full">
            <Button className="w-full" variant="default">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
