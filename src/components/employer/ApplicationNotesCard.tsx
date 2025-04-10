
import React from "react";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ApplicationNotesCardProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSaveNotes: () => void;
  savingNotes: boolean;
}

export function ApplicationNotesCard({ 
  notes, 
  onNotesChange, 
  onSaveNotes, 
  savingNotes 
}: ApplicationNotesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Notes</CardTitle>
        <CardDescription>
          Add private notes about this applicant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Add notes about this applicant..."
          className="min-h-[150px]"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          onClick={onSaveNotes} 
          disabled={savingNotes}
        >
          {savingNotes ? "Saving..." : "Save Notes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
