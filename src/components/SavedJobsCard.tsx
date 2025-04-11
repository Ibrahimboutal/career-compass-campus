
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function SavedJobsCard() {
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSavedJobsCount = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const { count, error } = await supabase
          .from('saved_jobs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        setSavedJobsCount(count || 0);
      } catch (error) {
        console.error('Error fetching saved jobs count:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedJobsCount();
  }, [user]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Saved Jobs</CardTitle>
        <CardDescription>Jobs you've bookmarked</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold">{loading ? '...' : savedJobsCount}</span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/saved-jobs">View all</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
