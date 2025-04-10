
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, File, CheckCircle2, AlertCircle } from "lucide-react";

interface ResumeUploaderProps {
  userId: string;
  existingResume?: string | null;
  onUploadComplete: (resumeUrl: string) => void;
}

export function ResumeUploader({ userId, existingResume, onUploadComplete }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type (PDF, DOC, DOCX)
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setUploadError("Please upload a PDF, DOC, or DOCX file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        return;
      }
      
      setResumeFile(file);
      setUploadError(null);
    }
  };

  const uploadResume = async () => {
    if (!resumeFile) return;
    
    try {
      setIsUploading(true);
      
      // Upload file to Supabase Storage
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${userId}-resume-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      // Get the public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);
      
      // Update the profile with the resume URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          resume_url: publicUrl 
        })
        .eq('id', userId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Resume uploaded",
        description: "Your resume has been successfully uploaded.",
      });
      
      onUploadComplete(publicUrl);
      setResumeFile(null);
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading your resume.",
        variant: "destructive",
      });
      setUploadError(error.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {existingResume && (
        <div className="flex items-center gap-2 text-sm">
          <File className="h-4 w-4" />
          <span>Current resume:</span>
          <a 
            href={existingResume} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View Resume
          </a>
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById('resume-upload')?.click()}
            type="button"
          >
            <Upload className="mr-2 h-4 w-4" />
            Select File
          </Button>
          <input 
            type="file" 
            id="resume-upload" 
            className="hidden" 
            accept=".pdf,.doc,.docx" 
            onChange={handleFileChange}
          />
          
          {resumeFile && (
            <Button 
              onClick={uploadResume} 
              disabled={isUploading}
              type="button"
            >
              {isUploading ? "Uploading..." : "Upload Resume"}
            </Button>
          )}
        </div>
        
        {resumeFile && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Selected: {resumeFile.name}</span>
          </div>
        )}
        
        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{uploadError}</span>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          Accepted formats: PDF, DOC, DOCX (Max size: 5MB)
        </p>
      </div>
    </div>
  );
}
