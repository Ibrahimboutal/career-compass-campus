import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployers } from "@/hooks/useEmployers";

const employerFormSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  companyDescription: z.string().optional(),
});

type EmployerFormValues = z.infer<typeof employerFormSchema>;

export function EmployerRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { createEmployer } = useEmployers();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

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

  const onSubmit = async (values: EmployerFormValues) => {
    if (!user) {
      uiToast({
        title: "Error",
        description: "You must be logged in to register as an employer",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Creating employer profile with user_id:", user.id);
      
      const result = await createEmployer({
        user_id: user.id,
        company_name: values.companyName,
        industry: values.industry || null,
        company_size: values.companySize || null,
        website: values.website || null,
        company_description: values.companyDescription || null,
        logo_url: null
      });

      if (!result) throw new Error("Failed to create employer profile");

      // Use both toast systems to ensure the user sees the notification
      uiToast({
        title: "Success",
        description: "Your employer account has been created",
      });
      
      toast.success("Your employer account has been created");
      
      // Force reload to update user role
      window.location.href = "/employer/dashboard";
    } catch (error: any) {
      console.error("Error creating employer:", error);
      
      uiToast({
        title: "Error",
        description: error.message || "Failed to register as an employer",
        variant: "destructive",
      });
      
      toast.error(error.message || "Failed to register as an employer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register as an Employer</CardTitle>
        <CardDescription>
          Create an employer profile to post job listings
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
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register as Employer"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
