
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Upload, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface DocumentsCardProps {
  resumeUrl: string | null;
  onUploadClick: () => void;
}

export function DocumentsCard({ resumeUrl, onUploadClick }: DocumentsCardProps) {
  // Use a placeholder date if we don't have a real one from the metadata
  const uploadDate = new Date();
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>Manage your resume and other documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumeUrl ? (
          <div className="bg-gray-50 p-3 rounded-lg border flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-job-blue/10 rounded flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-job-blue" />
              </div>
              <div>
                <p className="font-medium text-sm">Resume</p>
                <p className="text-xs text-gray-500">Uploaded on {format(uploadDate, 'MMM d')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" asChild>
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-lg border text-center text-gray-500">
            <p>No resume uploaded yet</p>
          </div>
        )}
        
        <Button variant="outline" className="w-full" onClick={onUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          {resumeUrl ? "Update Resume" : "Upload Resume"}
        </Button>
      </CardContent>
    </Card>
  );
}
