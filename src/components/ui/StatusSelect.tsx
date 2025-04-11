
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export type ApplicationStatusType = "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";

const STATUS_OPTIONS: ApplicationStatusType[] = [
  "Applied",
  "Under Review",
  "Interview",
  "Offered",
  "Rejected"
];

interface StatusSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function StatusSelect({ 
  value, 
  onValueChange, 
  disabled = false,
  className,
  triggerClassName
}: StatusSelectProps) {
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      disabled={disabled}
      className={className}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((status) => (
          <SelectItem key={status} value={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
