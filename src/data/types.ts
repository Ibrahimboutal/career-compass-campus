
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Internship" | "Contract";
  description: string;
  requirements: string[];
  postedDate: string;
  deadline: string;
  salary?: string;
  logo?: string;
}

export interface Application {
  id: string;
  jobId: string;
  status: "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";
  appliedDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  major: string;
  graduationYear: string;
  applications: Application[];
}
