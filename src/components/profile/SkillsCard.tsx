
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SkillsCardProps {
  onSaveSkills: () => void;
}

export function SkillsCard({ onSaveSkills }: SkillsCardProps) {
  return (
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
        <Button onClick={onSaveSkills}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}
