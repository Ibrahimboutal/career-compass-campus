
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Employer } from "@/data/types";
import { mapSupabaseEmployerToEmployer } from "@/utils/mappers";

export const useEmployers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getEmployerByUserId = async (userId: string): Promise<Employer | null> => {
    try {
      setIsLoading(true);
      
      // Use raw SQL query instead of RPC to avoid TypeScript issues
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return mapSupabaseEmployerToEmployer(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch employer data",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createEmployer = async (employerData: Omit<Employer, "id" | "created_at" | "updated_at">): Promise<Employer | null> => {
    try {
      setIsLoading(true);
      
      // Insert directly into employers table instead of using RPC
      const { data, error } = await supabase
        .from('employers')
        .insert({
          user_id: employerData.user_id,
          company_name: employerData.company_name,
          industry: employerData.industry,
          company_size: employerData.company_size,
          website: employerData.website,
          company_description: employerData.company_description,
          logo_url: employerData.logo_url
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return mapSupabaseEmployerToEmployer(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create employer",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEmployer = async (id: string, employerData: Partial<Omit<Employer, "id" | "user_id" | "created_at" | "updated_at">>): Promise<Employer | null> => {
    try {
      setIsLoading(true);
      
      // Update directly instead of using RPC
      const { data, error } = await supabase
        .from('employers')
        .update({
          company_name: employerData.company_name,
          industry: employerData.industry,
          company_size: employerData.company_size,
          website: employerData.website,
          company_description: employerData.company_description,
          logo_url: employerData.logo_url
        })
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return mapSupabaseEmployerToEmployer(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update employer",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getEmployerById = async (employerId: string): Promise<Employer | null> => {
    try {
      setIsLoading(true);
      
      // Use direct query instead of RPC
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .eq('id', employerId)
        .single();
      
      if (error) throw error;
      
      if (!data) return null;
      
      return mapSupabaseEmployerToEmployer(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch employer data",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    getEmployerByUserId,
    createEmployer,
    updateEmployer,
    getEmployerById
  };
};
