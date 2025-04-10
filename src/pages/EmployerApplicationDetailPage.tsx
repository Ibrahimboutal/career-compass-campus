
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ApplicantInfoCard } from "@/components/employer/ApplicantInfoCard";
import { ApplicationNotesCard } from "@/components/employer/ApplicationNotesCard";
import { ApplicationStatusCard } from "@/components/employer/ApplicationStatusCard";
import { useApplicationDetail } from "@/hooks/useApplicationDetail";

export default function EmployerApplicationDetailPage() {
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
  const {
    application,
    notes,
    setNotes,
    status,
    loading,
    savingNotes,
    updatingStatus,
    handleSaveNotes,
    handleStatusChange
  } = useApplicationDetail(jobId, applicationId);
  
  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <p>Loading application details...</p>
      </div>
    );
  }
  
  if (!application) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Application Not Found</h1>
        <p>The application you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild className="mt-4">
          <Link to={`/employer/jobs/${jobId}/applications`}>Back to Applications</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" asChild className="mr-4">
          <Link to={`/employer/jobs/${jobId}/applications`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Applications
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Application Details</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ApplicantInfoCard applicantInfo={application.user} />
          
          <ApplicationNotesCard 
            notes={notes}
            onNotesChange={setNotes}
            onSaveNotes={handleSaveNotes}
            savingNotes={savingNotes}
          />
        </div>
        
        <div className="space-y-6">
          <ApplicationStatusCard 
            status={status}
            onStatusChange={handleStatusChange}
            updatingStatus={updatingStatus}
            jobInfo={application.job}
            appliedDate={application.applied_date}
          />
          
          <Button 
            variant="outline" 
            className="w-full"
            asChild
          >
            <Link to={`/jobs/${jobId}`}>
              View Job Posting
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
