import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Employer } from "@/data/types";
import { useEmployers } from "@/hooks/useEmployers";

const employerFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  companyDescription: z.string().optional(),
});

type EmployerFormValues = z.infer<typeof employerFormSchema>;

export default function EmployerProfileEditPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employer, setEmployer] = useState<Employer | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getEmployerByUserId, updateEmployer } = useEmployers();
  
  const form = useForm<EmployerFormValues>({
    resolver: zodResolver(employerFormSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      companySize: "",
      website: "",
      companyDescription: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchEmployerData();
    }
  }, [user]);

  const fetchEmployerData = async () => {
    try {
      setIsLoading(true);
      
      const employerData = await getEmployerByUserId(user?.id || '');
      
      if (!employerData) {
        // No employer profile found, redirect to registration
        navigate("/employer/register");
        return;
      }
      
      setEmployer(employerData);
      
      // Set form values
      form.reset({
        companyName: employerData.company_name,
        industry: employerData.industry || "",
        companySize: employerData.company_size || "",
        website: employerData.website || "",
        companyDescription: employerData.company_description || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load employer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: EmployerFormValues) => {
    if (!employer) {
      toast({
        title: "Error",
        description: "Employer profile not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateEmployer(employer.id, {
        company_name: values.companyName,
        industry: values.industry || null,
        company_size: values.companySize || null,
        website: values.website || null,
        company_description: values.companyDescription || null,
      });

      if (!result) throw new Error("Failed to update employer profile");

      toast({
        title: "Success",
        description: "Your employer profile has been updated",
      });

      navigate("/employer/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update employer profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Employer Profile</CardTitle>
          <CardDescription>
            Update your company information
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Technology, Education" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 1-10, 11-50, 51-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your company"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/employer/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
