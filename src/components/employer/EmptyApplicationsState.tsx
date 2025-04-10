
import React from "react";

interface EmptyApplicationsStateProps {
  statusFilter: string | null;
}

export function EmptyApplicationsState({ statusFilter }: EmptyApplicationsStateProps) {
  return (
    <div className="text-center py-10 border rounded-md bg-muted/10">
      <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
      <p className="text-muted-foreground">
        There are no applications for this job posting{statusFilter ? ` with the "${statusFilter}" status` : ''}.
      </p>
    </div>
  );
}
