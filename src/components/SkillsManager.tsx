
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SkillsManagerProps {
  userId: string;
  initialSkills: string[];
  onUpdate: (skills: string[]) => void;
}

export function SkillsManager({ userId, initialSkills, onUpdate }: SkillsManagerProps) {
  const [skills, setSkills] = useState<string[]>(initialSkills || []);
  const [newSkill, setNewSkill] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    // Check if skill already exists
    if (skills.includes(newSkill.trim())) {
      toast({
        title: "Duplicate skill",
        description: "This skill is already in your list.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedSkills = [...skills, newSkill.trim()];
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          skills: updatedSkills 
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      setSkills(updatedSkills);
      setNewSkill("");
      onUpdate(updatedSkills);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add skill",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          skills: updatedSkills 
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      setSkills(updatedSkills);
      onUpdate(updatedSkills);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove skill",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Add a skill (e.g. JavaScript, Communication)"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
        />
        <Button 
          onClick={handleAddSkill} 
          disabled={!newSkill.trim() || isSubmitting}
        >
          Add
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map(skill => (
            <Badge key={skill} variant="secondary" className="px-3 py-1">
              {skill}
              <button 
                onClick={() => handleRemoveSkill(skill)} 
                className="ml-2 text-muted-foreground hover:text-foreground"
                disabled={isSubmitting}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        )}
      </div>
    </div>
  );
}
