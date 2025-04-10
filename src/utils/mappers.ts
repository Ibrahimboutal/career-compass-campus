
import { Job, Application, Employer } from "@/data/types";

// Map Supabase job structure to our application Job type
export const mapSupabaseJobToJob = (supabaseJob: any): Job => {
  return {
    id: supabaseJob.id,
    title: supabaseJob.title,
    company: supabaseJob.company,
    location: supabaseJob.location,
    type: supabaseJob.type as "Full-time" | "Part-time" | "Internship" | "Contract",
    description: supabaseJob.description,
    requirements: supabaseJob.requirements,
    postedDate: supabaseJob.posted_date,
    deadline: supabaseJob.deadline,
    salary: supabaseJob.salary,
    logo: supabaseJob.logo,
    employerId: supabaseJob.employer_id
  };
};

// Map array of Supabase jobs to array of our Job type
export const mapSupabaseJobsToJobs = (supabaseJobs: any[]): Job[] => {
  return supabaseJobs.map(mapSupabaseJobToJob);
};

// Map Supabase application to our Application type
export const mapSupabaseApplicationToApplication = (supabaseApp: any, job: Job): Application => {
  return {
    id: supabaseApp.id,
    jobId: supabaseApp.job_id,
    status: mapApplicationStatus(supabaseApp.status),
    appliedDate: supabaseApp.applied_date
  };
};

// Map Supabase application status to our ApplicationStatus type
export const mapApplicationStatus = (status: string): "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected" => {
  const validStatuses = ["Applied", "Under Review", "Interview", "Offered", "Rejected"];
  
  // Ensure the status is one of the valid options
  if (validStatuses.includes(status)) {
    return status as "Applied" | "Under Review" | "Interview" | "Offered" | "Rejected";
  }
  
  // Default to "Applied" if the status is not valid
  return "Applied";
};

// Map Supabase employer to our Employer type
export const mapSupabaseEmployerToEmployer = (supabaseEmployer: any): Employer => {
  return {
    id: supabaseEmployer.id,
    user_id: supabaseEmployer.user_id,
    company_name: supabaseEmployer.company_name,
    industry: supabaseEmployer.industry,
    company_size: supabaseEmployer.company_size,
    website: supabaseEmployer.website,
    company_description: supabaseEmployer.company_description,
    logo_url: supabaseEmployer.logo_url,
    created_at: supabaseEmployer.created_at,
    updated_at: supabaseEmployer.updated_at
  };
};
