
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { DocumentsCard } from "@/components/profile/DocumentsCard";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { SkillsCard } from "@/components/profile/SkillsCard";
import { ResumeUploader } from "@/components/ResumeUploader";
import { SkillsManager } from "@/components/SkillsManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ProfilePage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    major: "",
    graduationYear: "",
    phone: "(555) 123-4567",
    about: "Computer Science student with interests in web development and artificial intelligence. Looking for internship opportunities to apply my skills in a real-world setting.",
    resumeUrl: null,
    skills: [] as string[]
  });
  
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      
      setProfileData({
        name: data.name || "",
        email: data.email || "",
        major: data.major || "",
        graduationYear: data.graduation_year || "",
        phone: "(555) 123-4567", // Assuming this is not stored in the DB yet
        about: "Computer Science student with interests in web development and artificial intelligence.",
        resumeUrl: data.resume_url,
        skills: data.skills || []
      });
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };
  
  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          email: profileData.email,
          major: profileData.major,
          graduation_year: profileData.graduationYear
        })
        .eq('id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleProfileUpdate = () => {
    fetchUserProfile();
    setIsEditDialogOpen(false);
  };

  const handleResumeUpload = (resumeUrl: string) => {
    setProfileData(prev => ({
      ...prev,
      resumeUrl
    }));
    setIsResumeDialogOpen(false);
    toast({
      title: "Resume Uploaded",
      description: "Your resume has been successfully uploaded."
    });
  };

  const handleSkillsUpdate = (skills: string[]) => {
    setProfileData(prev => ({
      ...prev,
      skills
    }));
  };
  
  const years = [
    "2025", "2026", "2027", "2028", "2029"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileHeader 
              name={profileData.name}
              major={profileData.major}
              graduationYear={profileData.graduationYear}
              onEditClick={() => setIsEditDialogOpen(true)}
            />
            <DocumentsCard 
              resumeUrl={profileData.resumeUrl}
              onUploadClick={() => setIsResumeDialogOpen(true)}
            />
          </div>
          
          <div className="md:col-span-2">
            <PersonalInfoCard 
              profileData={profileData}
              years={years}
              onInputChange={handleInputChange}
              onSaveProfile={handleSaveProfile}
              isEditDialogOpen={isEditDialogOpen}
              setIsEditDialogOpen={setIsEditDialogOpen}
              currentUser={user}
              onProfileUpdate={handleProfileUpdate}
            />
            
            <SkillsCard 
              skills={profileData.skills}
              onSaveSkills={() => setIsSkillsDialogOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Resume Upload Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
            <DialogDescription>
              Upload your resume to share with employers. Accepted formats: PDF, DOC, DOCX.
            </DialogDescription>
          </DialogHeader>
          {user && (
            <ResumeUploader 
              userId={user.id}
              existingResume={profileData.resumeUrl}
              onUploadComplete={handleResumeUpload}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Skills Management Dialog */}
      <Dialog open={isSkillsDialogOpen} onOpenChange={setIsSkillsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Skills</DialogTitle>
            <DialogDescription>
              Add or remove skills to highlight your expertise.
            </DialogDescription>
          </DialogHeader>
          {user && (
            <SkillsManager 
              userId={user.id}
              initialSkills={profileData.skills}
              onUpdate={handleSkillsUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
