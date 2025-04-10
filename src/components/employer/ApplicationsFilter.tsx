
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApplicationsFilterProps {
  statusFilter: string | null;
  onFilterChange: (value: string | null) => void;
}

export function ApplicationsFilter({ statusFilter, onFilterChange }: ApplicationsFilterProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="w-full md:w-auto">
        <Select 
          value={statusFilter || "all"} 
          onValueChange={(value) => onFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Under Review">Under Review</SelectItem>
            <SelectItem value="Interview">Interview</SelectItem>
            <SelectItem value="Offered">Offered</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
