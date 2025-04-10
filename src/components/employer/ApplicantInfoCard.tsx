
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, GraduationCap, Calendar, FileText } from "lucide-react";

interface ApplicantInfo {
  name: string | null;
  email: string | null;
  major: string | null;
  graduation_year: string | null;
  skills: string[] | null;
  resume_url: string | null;
}

interface ApplicantInfoCardProps {
  applicantInfo: ApplicantInfo;
}

export function ApplicantInfoCard({ applicantInfo }: ApplicantInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold">Applicant Information</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Name</span>
            </div>
            <p>{applicantInfo.name || "Not provided"}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email</span>
            </div>
            <p>{applicantInfo.email || "Not provided"}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Major</span>
            </div>
            <p>{applicantInfo.major || "Not provided"}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Graduation Year</span>
            </div>
            <p>{applicantInfo.graduation_year || "Not provided"}</p>
          </div>
        </div>
        
        {applicantInfo.skills && applicantInfo.skills.length > 0 && (
          <div className="pt-2">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {applicantInfo.skills.map((skill, index) => (
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
        
        {applicantInfo.resume_url && (
          <div className="pt-4">
            <Button asChild variant="outline">
              <a 
                href={applicantInfo.resume_url} 
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
  );
}
