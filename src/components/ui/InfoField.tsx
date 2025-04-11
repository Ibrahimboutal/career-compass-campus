
import React from "react";
import { LucideIcon } from "lucide-react";

interface InfoFieldProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function InfoField({ icon: Icon, label, value, className }: InfoFieldProps) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-foreground">{value || "Not provided"}</p>
    </div>
  );
}
