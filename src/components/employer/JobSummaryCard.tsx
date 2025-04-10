
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Job } from "@/data/types";

interface JobSummaryCardProps {
  job: Job;
  applicationsCount: number;
}

export function JobSummaryCard({ job, applicationsCount }: JobSummaryCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">{job.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Company</p>
            <p>{job.company}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Location</p>
            <p>{job.location}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Posted On</p>
            <p>{new Date(job.postedDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Applications</p>
            <p>{applicationsCount} applicant(s)</p>
          </div>
          <div>
            <Button asChild variant="outline" size="sm">
              <Link to={`/jobs/${job.id}`}>
                <Search className="mr-2 h-4 w-4" />
                View Job Post
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
