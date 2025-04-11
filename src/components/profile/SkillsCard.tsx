
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillsCardProps {
  skills: string[];
  onSaveSkills: () => void;
}

export function SkillsCard({ skills, onSaveSkills }: SkillsCardProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Skills & Interests</CardTitle>
        <CardDescription>Add skills to highlight your expertise</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Your Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills && skills.length > 0 ? (
                skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills added yet. Click "Manage Skills" to add some.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3 border-t pt-4">
        <Button onClick={onSaveSkills}>Manage Skills</Button>
      </CardFooter>
    </Card>
  );
}
