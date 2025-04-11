
import React from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { StatusSelect } from "@/components/ui/StatusSelect";
import { UserRound, FileText } from "lucide-react";

interface Application {
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

interface ApplicationsTableProps {
  applications: Application[];
  jobId: string;
  onStatusChange: (applicationId: string, newStatus: string) => void;
}

export function ApplicationsTable({ applications, jobId, onStatusChange }: ApplicationsTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Applied On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{application.user.name}</p>
                    <p className="text-sm text-muted-foreground">{application.user.email}</p>
                    {application.user.major && (
                      <p className="text-sm text-muted-foreground">
                        {application.user.major}
                        {application.user.graduation_year ? ` (${application.user.graduation_year})` : ''}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {new Date(application.applied_date).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <ApplicationStatusBadge status={application.status} />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <Link to={`/employer/jobs/${jobId}/applications/${application.id}`}>
                      View Details
                    </Link>
                  </Button>
                  {application.user.resume_url && (
                    <Button asChild variant="outline" size="sm" className="h-8">
                      <a href={application.user.resume_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-1 h-4 w-4" />
                        Resume
                      </a>
                    </Button>
                  )}
                  <StatusSelect
                    value={application.status}
                    onValueChange={(value) => onStatusChange(application.id, value)}
                    triggerClassName="h-8 w-[140px]"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
