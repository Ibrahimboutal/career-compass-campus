
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Upload } from "lucide-react";

export function DocumentsCard() {
  return (
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
  );
}
