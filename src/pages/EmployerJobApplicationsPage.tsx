
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { JobSummaryCard } from "@/components/employer/JobSummaryCard";
import { ApplicationsFilter } from "@/components/employer/ApplicationsFilter";
import { ApplicationsTable } from "@/components/employer/ApplicationsTable";
import { EmptyApplicationsState } from "@/components/employer/EmptyApplicationsState";
import { PaginationControls } from "@/components/ui/PaginationControls";
import { useJobApplications } from "@/hooks/useJobApplications";

export default function EmployerJobApplicationsPage() {
  const { id: jobId } = useParams<{ id: string }>();
  const {
    applications,
    job,
    loading,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    updateApplicationStatus
  } = useJobApplications(jobId);
  
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
      
      <JobSummaryCard job={job} applicationsCount={applications.length} />
      
      <ApplicationsFilter 
        statusFilter={statusFilter} 
        onFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1); // Reset to first page when filter changes
        }}
      />
      
      {applications.length > 0 ? (
        <>
          <div className="mb-6">
            <ApplicationsTable 
              applications={applications} 
              jobId={job.id}
              onStatusChange={updateApplicationStatus}
            />
          </div>
          
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyApplicationsState statusFilter={statusFilter} />
      )}
    </div>
  );
}
