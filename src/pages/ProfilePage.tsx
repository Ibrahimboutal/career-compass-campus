
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currentUser } from "@/data/userData";
import { User, Mail, BookOpen, Calendar, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { toast } = useToast();
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
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile photo</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="w-32 h-32 bg-job-lightgray rounded-full flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-job-blue" />
                </div>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Manage your resume and other documents</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-job-blue/10 rounded flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-job-blue" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Resume.pdf</p>
                      <p className="text-xs text-gray-500">Uploaded on Apr 2</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="major">Major</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="major"
                        value={profileData.major}
                        onChange={(e) => handleInputChange("major", e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="graduation-year">Graduation Year</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Select 
                        value={profileData.graduationYear}
                        onValueChange={(value) => handleInputChange("graduationYear", value)}
                      >
                        <SelectTrigger id="graduation-year" className="pl-8">
                          <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="about">About Me</Label>
                  <Textarea 
                    id="about" 
                    placeholder="Tell employers about yourself, your skills, and your career goals..."
                    className="min-h-32"
                    value={profileData.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Skills & Interests</CardTitle>
                <CardDescription>Add skills to highlight your expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills</Label>
                    <Textarea 
                      id="skills" 
                      placeholder="Add your skills separated by commas, e.g. JavaScript, React, Data Analysis"
                      className="min-h-24"
                      defaultValue="JavaScript, React, HTML/CSS, Python, Git, UI/UX Design"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="interests">Interests</Label>
                    <Textarea 
                      id="interests" 
                      placeholder="Add your interests separated by commas, e.g. Web Development, AI, Project Management"
                      className="min-h-24"
                      defaultValue="Web Development, Artificial Intelligence, Mobile App Development, Data Visualization"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3 border-t pt-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={() => toast({ title: "Skills Updated", description: "Your skills and interests have been updated successfully." })}>
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
