import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Job } from "@/data/types";
import { useEmployers } from "@/hooks/useEmployers";

const jobFormSchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  type: z.enum(["Full-time", "Part-time", "Internship", "Contract"]),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  salary: z.string().optional(),
  deadline: z.string()
    .refine(date => new Date(date) > new Date(), {
      message: "Deadline must be in the future",
    }),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobFormProps {
  job?: Job;
  employerId: string;
  onSuccess?: () => void;
}

export function JobForm({ job, employerId, onSuccess }: JobFormProps) {
  const [requirements, setRequirements] = useState<string[]>(job?.requirements || []);
  const [newRequirement, setNewRequirement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getEmployerById } = useEmployers();

  useEffect(() => {
    if (employerId) {
      getEmployerDetails(employerId);
    }
  }, [employerId]);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: job?.title || "",
      type: (job?.type as any) || "Full-time",
      location: job?.location || "",
      description: job?.description || "",
      salary: job?.salary || "",
      deadline: job?.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
    },
  });

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: JobFormValues) => {
    if (!employerId) {
      toast({
        title: "Error",
        description: "Employer information is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const jobData = {
        title: values.title,
        type: values.type,
        location: values.location,
        description: values.description,
        salary: values.salary || null,
        requirements: requirements,
        deadline: new Date(values.deadline).toISOString(),
        employer_id: employerId,
        company: companyName || "Unknown Company",
      };

      if (job) {
        // Update existing job
        const { error } = await supabase
          .from("jobs")
          .update(jobData)
          .eq("id", job.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job has been updated",
        });
      } else {
        // Create new job
        const { error } = await supabase
          .from("jobs")
          .insert(jobData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job has been created",
        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/employer/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEmployerDetails = async (employerId: string) => {
    try {
      const employer = await getEmployerById(employerId);
      
      if (employer) {
        setCompanyName(employer.company_name);
      }
    } catch (error) {
      console.error("Failed to fetch employer details:", error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{job ? "Edit Job" : "Create New Job"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Type*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location*</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Remote, New York, NY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. $60,000 - $80,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description*</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the job role and responsibilities"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Requirements</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddRequirement}>
                  Add
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span>{req}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRequirement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application Deadline*</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? job
                  ? "Updating Job..."
                  : "Creating Job..."
                : job
                ? "Update Job"
                : "Create Job"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
