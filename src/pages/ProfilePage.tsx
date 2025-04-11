
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { currentUser } from "@/data/userData";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { DocumentsCard } from "@/components/profile/DocumentsCard";
import { PersonalInfoCard } from "@/components/profile/PersonalInfoCard";
import { SkillsCard } from "@/components/profile/SkillsCard";

const ProfilePage = () => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    major: currentUser.major,
    graduationYear: currentUser.graduationYear,
    phone: "(555) 123-4567",
    about: "Computer Science student with interests in web development and artificial intelligence. Looking for internship opportunities to apply my skills in a real-world setting.",
  });
  
  const handleInputChange = (field: string, value: string) => {
    setProfileData({
      ...profileData,
      [field]: value
    });
  };
  
  const handleSaveProfile = () => {
    // In a real app, this would save the profile to an API
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully."
    });
  };

  const handleProfileUpdate = () => {
    // This would typically fetch the updated profile data
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully."
    });
    setIsEditDialogOpen(false);
  };

  const handleSaveSkills = () => {
    toast({
      title: "Skills Updated",
      description: "Your skills and interests have been updated successfully."
    });
  };
  
  const years = [
    "2025", "2026", "2027", "2028", "2029"
  ];

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
            <DocumentsCard />
          </div>
          
          <div className="md:col-span-2">
            <PersonalInfoCard 
              profileData={profileData}
              years={years}
              onInputChange={handleInputChange}
              onSaveProfile={handleSaveProfile}
              isEditDialogOpen={isEditDialogOpen}
              setIsEditDialogOpen={setIsEditDialogOpen}
              currentUser={currentUser}
              onProfileUpdate={handleProfileUpdate}
            />
            
            <SkillsCard onSaveSkills={handleSaveSkills} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
