import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Calendar, Clock, Building2, User, BookMarked, MessageSquare, Users } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ name: string; major: string } | null>(null);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, major")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch applied jobs count
        const { data: appliedData, error: appliedError } = await supabase
          .from("applications")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        if (appliedError) throw appliedError;
        setAppliedJobsCount(appliedData ? appliedData.length : 0);

        // Fetch saved jobs count
        const { data: savedData, error: savedError } = await supabase
          .from("saved_jobs")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        if (savedError) throw savedError;
        setSavedJobsCount(savedData ? savedData.length : 0);
      } catch (error: any) {
        console.error("Error fetching student data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [user, toast]);

  if (isLoading) {
    return <div className="container py-8 flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Profile Name"
          value={profile?.name || "N/A"}
          description="Your display name"
          icon={<User className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Major"
          value={profile?.major || "N/A"}
          description="Your field of study"
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Jobs Applied"
          value={appliedJobsCount}
          description="Total job applications"
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="Jobs Saved"
          value={savedJobsCount}
          description="Jobs you've saved"
          icon={<BookMarked className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start h-auto py-2">
                <Link to="/jobs">
                  <Briefcase className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Browse Jobs</div>
                    <div className="text-xs text-muted-foreground mt-1">Find new opportunities</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-auto py-2">
                <Link to="/saved-jobs">
                  <BookMarked className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Saved Jobs</div>
                    <div className="text-xs text-muted-foreground mt-1">Review jobs you've saved</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-auto py-2">
                <Link to="/messages">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Messages</div>
                    <div className="text-xs text-muted-foreground mt-1">Chat with recruiters</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-auto py-2">
                <Link to="/connections">
                  <Users className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Connections</div>
                    <div className="text-xs text-muted-foreground mt-1">Find recruiters to chat with</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and manage your profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm font-medium">Name</div>
              <div className="text-muted-foreground">{profile?.name || "N/A"}</div>
              <div className="text-sm font-medium">Major</div>
              <div className="text-muted-foreground">{profile?.major || "N/A"}</div>
              <Button asChild className="mt-4">
                <Link to="/profile">Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>List of jobs you have applied for.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>List of jobs you have saved.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No saved jobs yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [isEmployer, setIsEmployer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkEmployerStatus = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("employers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setIsEmployer(!!data);
      } catch (error: any) {
        console.error("Error checking employer status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkEmployerStatus();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {isEmployer ? (
          <div>
            <Link to="/employer/dashboard">
              <Button>Go to Employer Dashboard</Button>
            </Link>
          </div>
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
