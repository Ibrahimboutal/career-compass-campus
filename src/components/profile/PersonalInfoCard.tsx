
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, BookOpen, Calendar } from "lucide-react";
import { InfoField } from "@/components/ui/InfoField";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileForm } from "@/components/ProfileForm";
import { useState } from "react";

interface PersonalInfoCardProps {
  profileData: {
    name: string;
    email: string;
    major: string;
    graduationYear: string;
    phone: string;
    about: string;
  };
  years: string[];
  onInputChange: (field: string, value: string) => void;
  onSaveProfile: () => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  currentUser: any;
  onProfileUpdate: () => void;
}

export function PersonalInfoCard({ 
  profileData, 
  years, 
  onInputChange, 
  onSaveProfile,
  isEditDialogOpen,
  setIsEditDialogOpen,
  currentUser,
  onProfileUpdate
}: PersonalInfoCardProps) {
  const { user } = useAuth();

  return (
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
                onChange={(e) => onInputChange("name", e.target.value)}
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
                onChange={(e) => onInputChange("email", e.target.value)}
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
              onChange={(e) => onInputChange("phone", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="major">Major</Label>
            <div className="relative">
              <BookOpen className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="major"
                value={profileData.major}
                onChange={(e) => onInputChange("major", e.target.value)}
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
                onValueChange={(value) => onInputChange("graduationYear", value)}
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
            onChange={(e) => onInputChange("about", e.target.value)}
          />
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal and academic information.
              </DialogDescription>
            </DialogHeader>
            <ProfileForm 
              initialData={{ 
                id: user?.id,
                name: profileData.name, 
                email: profileData.email, 
                major: profileData.major, 
                graduation_year: profileData.graduationYear
              }} 
              onSuccess={onProfileUpdate} 
            />
          </DialogContent>
        </Dialog>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 border-t pt-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={onSaveProfile}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
