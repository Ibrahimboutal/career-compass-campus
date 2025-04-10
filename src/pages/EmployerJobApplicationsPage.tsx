
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ArrowLeft, UserRound, FileText, Search } from "lucide-react";
import { Job } from "@/data/types";
import { useEmployers } from "@/hooks/useEmployers";
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

export default function EmployerJobApplicationsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const { toast } = useToast();
  const { getEmployerByUserId } = useEmployers();
  const applicationsPerPage = 10;
  
  useEffect(() => {
    if (user && jobId) {
      loadJobAndApplications();
    }
  }, [user, jobId, page, statusFilter]);
  
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
  
  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <p>Loading applications...</p>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Job Not Found</h1>
        <p>The job you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild className="mt-4">
          <Link to="/employer/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link to="/employer/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Applications for {job.title}</h1>
      </div>
      
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
              <p>{applications.length} applicant(s)</p>
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
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-auto">
          <Select value={statusFilter || "all"} onValueChange={(value) => {
            setStatusFilter(value === "all" ? null : value);
            setPage(1); // Reset to first page when filter changes
          }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Offered">Offered</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {applications.length > 0 ? (
        <>
          <div className="rounded-md border overflow-hidden mb-6">
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
                        <Select
                          value={application.status}
                          onValueChange={(value) => updateApplicationStatus(application.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Applied">Applied</SelectItem>
                            <SelectItem value="Under Review">Under Review</SelectItem>
                            <SelectItem value="Interview">Interview</SelectItem>
                            <SelectItem value="Offered">Offered</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => Math.abs(p - page) < 2 || p === 1 || p === totalPages)
                  .map((p, i, arr) => {
                    // Add ellipsis
                    if (i > 0 && p > arr[i - 1] + 1) {
                      return (
                        <PaginationItem key={`ellipsis-${p}`}>
                          <span className="flex h-9 w-9 items-center justify-center">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }
                    
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                          isActive={page === p}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="text-center py-10 border rounded-md bg-muted/10">
          <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground">
            There are no applications for this job posting{statusFilter ? ` with the "${statusFilter}" status` : ''}.
          </p>
        </div>
      )}
    </div>
  );
}
