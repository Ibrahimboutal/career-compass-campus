
import { User } from "./types";

export const currentUser: User = {
  id: "user1",
  name: "Alex Johnson",
  email: "alex.johnson@university.edu",
  major: "Computer Science",
  graduationYear: "2026",
  applications: [
    {
      id: "app1",
      jobId: "1",
      status: "Applied",
      appliedDate: "2025-04-05"
    },
    {
      id: "app2",
      jobId: "3",
      status: "Under Review",
      appliedDate: "2025-03-20"
    }
  ]
};
