
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ApplicationStatusBadge } from "@/components/ApplicationStatusBadge";
import { InfoField } from "@/components/ui/InfoField";
import { StatusSelect } from "@/components/ui/StatusSelect";
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
          <StatusSelect 
            value={status} 
            onValueChange={onStatusChange}
            disabled={updatingStatus}
          />
        </div>
        
        <Separator className="my-4" />
        
        <InfoField
          icon={Building}
          label="Job"
          value={
            <div>
              <p>{jobInfo.title}</p>
              <p className="text-sm text-muted-foreground">{jobInfo.company}</p>
            </div>
          }
        />
        
        <InfoField
          icon={Clock}
          label="Applied On"
          value={new Date(appliedDate).toLocaleDateString()}
        />
      </CardContent>
    </Card>
  );
}
