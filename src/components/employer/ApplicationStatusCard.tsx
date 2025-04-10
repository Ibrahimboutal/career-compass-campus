
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { Building, Clock } from "lucide-react";

interface JobInfo {
  title: string;
  company: string;
}

interface ApplicationStatusCardProps {
  status: string;
  onStatusChange: (status: string) => void;
  updatingStatus: boolean;
  jobInfo: JobInfo;
  appliedDate: string;
}

export function ApplicationStatusCard({
  status,
  onStatusChange,
  updatingStatus,
  jobInfo,
  appliedDate
}: ApplicationStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Application Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Current Status</Label>
          <div className="py-2">
            <ApplicationStatusBadge status={status as any} />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Update Status</Label>
          <Select 
            value={status} 
            onValueChange={onStatusChange}
            disabled={updatingStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Offered">Offered</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Job</span>
          </div>
          <p>{jobInfo.title}</p>
          <p className="text-sm text-muted-foreground">{jobInfo.company}</p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Applied On</span>
          </div>
          <p>{new Date(appliedDate).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
