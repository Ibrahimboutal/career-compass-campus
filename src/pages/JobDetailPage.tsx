
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { jobsData } from "@/data/jobsData";
import { currentUser } from "@/data/userData";
import { Calendar, Briefcase, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  
  const job = jobsData.find(job => job.id === id);
  
  // Check if the user has already applied for this job
  const hasApplied = currentUser.applications.some(app => app.jobId === id);
  
  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Job Not Found</CardTitle>
              <CardDescription>The job you're looking for doesn't exist or has been removed.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => navigate("/jobs")} className="w-full">
                Browse All Jobs
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }
  
  const handleApply = () => {
    // In a real app, this would submit the application to an API
    toast({
      title: "Application Submitted!",
      description: `Your application for ${job.title} at ${job.company} has been submitted successfully.`,
    });
    setIsDialogOpen(false);
    // Redirect to dashboard after successful application
    setTimeout(() => navigate("/dashboard"), 1500);
  };
  
  const formattedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const deadlineDate = new Date(job.deadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/jobs" className="text-job-blue hover:underline flex items-center gap-1 mb-4">
            ← Back to Jobs
          </Link>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="flex gap-4 mb-4 md:mb-0">
                <div className="w-14 h-14 bg-job-lightgray rounded-md flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-job-blue" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <p className="text-gray-600">{job.company}</p>
                    <span className="text-gray-400">•</span>
                    <p className="text-gray-600">{job.location}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Badge variant={job.type === "Internship" ? "secondary" : job.type === "Part-time" ? "outline" : "default"} className="self-start">
                  {job.type}
                </Badge>
                
                {job.salary && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Posted {formattedDate}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Tabs defaultValue="description">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="pt-4">
                    <p className="whitespace-pre-line">{job.description}</p>
                    
                    <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h3 className="font-medium mb-2">Application Deadline</h3>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4" />
                        <span>{deadlineDate}</span>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="requirements" className="pt-4">
                    <ul className="list-disc pl-5 space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </div>
              
              <div className="md:w-1/3">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-job-lightgray rounded-md flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-job-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{job.company}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    
                    <Button variant="outline" className="w-full" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        Visit Website
                      </a>
                    </Button>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col gap-3 border-t pt-4">
                    {hasApplied ? (
                      <>
                        <Badge className="bg-green-50 text-green-600 border-green-200 mb-2">
                          Already Applied
                        </Badge>
                        <Button variant="outline" onClick={() => navigate("/dashboard")}>
                          View My Application
                        </Button>
                      </>
                    ) : (
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">Apply Now</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Apply for {job.title}</DialogTitle>
                            <DialogDescription>
                              Submit your application for this position at {job.company}.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="resume">Resume</Label>
                              <Input id="resume" type="file" />
                              <p className="text-xs text-gray-500">Upload your resume in PDF format (Max 5MB)</p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cover-letter">Cover Letter (Optional)</Label>
                              <Textarea 
                                id="cover-letter" 
                                placeholder="Tell us why you're interested in this position..."
                                className="min-h-32"
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleApply}>Submit Application</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    <div className="w-full border-t pt-3 text-xs text-center text-gray-500">
                      This job was posted on {formattedDate}
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailPage;
