import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { ArrowLeft, User, Mail, GraduationCap, Calendar, FileText, Building, Clock } from "lucide-react";
import { useEmployers } from "@/hooks/useEmployers";
import { mapSupabaseJobToJob } from "@/utils/mappers";

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

export default function EmployerApplicationDetailPage() {
  const { jobId, applicationId } = useParams<{ jobId: string; applicationId: string }>();
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
  
  useEffect(() => {
    if (user && jobId && applicationId) {
      // First check if notes column exists, if not create it
      checkAndAddNotesColumn().then(() => {
        loadApplicationDetails();
      });
    }
  }, [user, jobId, applicationId]);
  
  // Function to check if notes column exists and add it if it doesn't
  const checkAndAddNotesColumn = async () => {
    try {
      // Try to select the notes column to see if it exists
      const { error } = await supabase
        .from('applications')
        .select('notes')
        .limit(1);
      
      // If there's an error about the column not existing, add it
      if (error && error.message.includes("column 'notes' does not exist")) {
        console.log("Notes column doesn't exist. Adding it...");
        
        // Use SQL to add the notes column
        // This requires admin privileges, so it might not work in all environments
        // If this doesn't work, you would need to add the column through the Supabase dashboard
        const { error: alterError } = await supabase.rpc('add_notes_column_to_applications');
        
        if (alterError) {
          console.error("Failed to add notes column:", alterError);
          // Proceed anyway, as we'll handle missing column case
        }
      }
    } catch (error) {
      console.error("Error checking for notes column:", error);
      // Continue anyway as we'll handle the missing column in the code
    }
  };
  
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
      
      // Now get the application details with joins, but handle the case where notes column might not exist
      const { data, error } = await supabase
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
      
      // Try to get the notes separately to handle if the column doesn't exist
      let notesData = null;
      try {
        const { data: notesResult, error: notesError } = await supabase
          .from('applications')
          .select('notes')
          .eq('id', applicationId)
          .single();
          
        if (!notesError && notesResult) {
          notesData = notesResult.notes;
        }
      } catch (noteErr) {
        console.error("Error fetching notes:", noteErr);
        // Continue without notes
      }
      
      const applicationDetail: ApplicationDetail = {
        id: data.id,
        status: data.status as "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected",
        applied_date: data.applied_date,
        notes: notesData, // Set notes from separate query or null if not available
        user: {
          id: data.profiles.id,
          name: data.profiles.name,
          email: data.profiles.email,
          resume_url: data.profiles.resume_url,
          major: data.profiles.major,
          graduation_year: data.profiles.graduation_year,
          skills: data.profiles.skills
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
      
      // First check if the notes column exists
      try {
        // Try updating without notes first to see if there's an error
        const { error } = await supabase
          .from('applications')
          .update({ status: application.status })
          .eq('id', application.id);
          
        if (!error) {
          // Now try to update with notes
          try {
            const { error: notesError } = await supabase
              .from('applications')
              .update({ 
                notes: notes 
              })
              .eq('id', application.id);
              
            if (notesError) {
              // If there's an error, it might be because the notes column doesn't exist
              console.error("Failed to save notes:", notesError);
              // Notify the user that notes couldn't be saved
              toast({
                title: "Notes Not Saved",
                description: "The notes feature is currently unavailable. Please contact support.",
                variant: "destructive",
              });
              return;
            }
          } catch (err) {
            console.error("Error saving notes:", err);
          }
        }
      } catch (err) {
        console.error("Error checking applications table:", err);
      }
      
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
          {/* Applicant Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name</span>
                  </div>
                  <p>{application.user.name || "Not provided"}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p>{application.user.email || "Not provided"}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Major</span>
                  </div>
                  <p>{application.user.major || "Not provided"}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Graduation Year</span>
                  </div>
                  <p>{application.user.graduation_year || "Not provided"}</p>
                </div>
              </div>
              
              {application.user.skills && application.user.skills.length > 0 && (
                <div className="pt-2">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {application.user.skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {application.user.resume_url && (
                <div className="pt-4">
                  <Button asChild variant="outline">
                    <a 
                      href={application.user.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Resume
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Application Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Notes</CardTitle>
              <CardDescription>
                Add private notes about this applicant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this applicant..."
                className="min-h-[150px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                onClick={handleSaveNotes} 
                disabled={savingNotes}
              >
                {savingNotes ? "Saving..." : "Save Notes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Application Status Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Status</Label>
                <div className="py-2">
                  <ApplicationStatusBadge status={application.status} />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select 
                  value={status} 
                  onValueChange={handleStatusChange}
                  disabled={updatingStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Job</span>
                </div>
                <p>{application.job.title}</p>
                <p className="text-sm text-muted-foreground">{application.job.company}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Applied On</span>
                </div>
                <p>{new Date(application.applied_date).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
          
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
