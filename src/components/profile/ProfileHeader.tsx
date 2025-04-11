
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Upload } from "lucide-react";

interface ProfileHeaderProps {
  name: string | null;
  major: string | null;
  graduationYear: string | null;
  onEditClick: () => void;
}

export function ProfileHeader({ name, major, graduationYear, onEditClick }: ProfileHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
        <CardDescription>Update your profile photo</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="w-32 h-32 bg-job-lightgray rounded-full flex items-center justify-center mb-4">
          <User className="w-16 h-16 text-job-blue" />
        </div>
        <Avatar className="w-24 h-24 mb-4 hidden">
          <AvatarFallback className="bg-gray-100 text-blue-500 text-2xl">
            {name ? name.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg mt-2">{name || "Your Name"}</h3>
        <p className="text-gray-600">{major || "Your Major"} Student</p>
        <p className="text-sm text-gray-500">Graduating {graduationYear || "Year"}</p>
        
        <div className="mt-4 w-full">
          <Button variant="outline" className="w-full" onClick={onEditClick}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Photo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
