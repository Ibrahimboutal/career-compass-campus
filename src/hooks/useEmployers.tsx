
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
      
      // We need to use rpc to query the employers table as it's not in the type definitions
      const { data, error } = await supabase
        .rpc('get_employer_by_user_id', { user_id_param: userId });
      
      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      return mapSupabaseEmployerToEmployer(data[0]);
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
      
      // We need to use rpc to insert into the employers table
      const { data, error } = await supabase
        .rpc('create_employer', { 
          user_id_param: employerData.user_id,
          company_name_param: employerData.company_name,
          industry_param: employerData.industry,
          company_size_param: employerData.company_size,
          website_param: employerData.website,
          company_description_param: employerData.company_description,
          logo_url_param: employerData.logo_url
        });
      
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
      
      // We need to use rpc to update the employers table
      const { data, error } = await supabase
        .rpc('update_employer', { 
          employer_id_param: id,
          company_name_param: employerData.company_name,
          industry_param: employerData.industry,
          company_size_param: employerData.company_size,
          website_param: employerData.website,
          company_description_param: employerData.company_description,
          logo_url_param: employerData.logo_url
        });
      
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

  return {
    isLoading,
    getEmployerByUserId,
    createEmployer,
    updateEmployer
  };
};
