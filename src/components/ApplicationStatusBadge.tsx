
import { Badge } from "@/components/ui/badge";

type ApplicationStatus = "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case "Applied":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "Under Review":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "Interview":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "Offered":
        return "bg-green-50 text-green-600 border-green-200";
      case "Rejected":
        return "bg-red-50 text-red-600 border-red-200";
      default:
        return "";
    }
  };

  return (
    <Badge variant="outline" className={getVariant()}>
      {status}
    </Badge>
  );
}
