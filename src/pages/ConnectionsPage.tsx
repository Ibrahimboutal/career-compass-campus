
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactDirectory } from "@/components/chat/ContactDirectory";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const [userType, setUserType] = useState<"student" | "recruiter" | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    const checkUserType = async () => {
      // Check if user is a recruiter
      const { data: employer } = await supabase
        .from("employers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (employer) {
        setUserType("recruiter");
      } else {
        setUserType("student");
      }
    };
    
    checkUserType();
  }, [user]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Connections</h1>
        
        {userType === "student" ? (
          <Tabs defaultValue="recruiters">
            <TabsList className="mb-6">
              <TabsTrigger value="recruiters">Find Recruiters</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recruiters">
              <ContactDirectory type="recruiters" />
            </TabsContent>
            
            <TabsContent value="messages">
              <div className="text-center py-6">
                <p>Go to your messages to see your current conversations.</p>
                <a href="/messages" className="text-primary hover:underline mt-2 inline-block">
                  View Messages
                </a>
              </div>
            </TabsContent>
          </Tabs>
        ) : userType === "recruiter" ? (
          <Tabs defaultValue="students">
            <TabsList className="mb-6">
              <TabsTrigger value="students">Find Students</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students">
              <ContactDirectory type="students" />
            </TabsContent>
            
            <TabsContent value="messages">
              <div className="text-center py-6">
                <p>Go to your messages to see your current conversations.</p>
                <a href="/messages" className="text-primary hover:underline mt-2 inline-block">
                  View Messages
                </a>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-10">
            <p>Loading...</p>
          </div>
        )}
      </main>
    </div>
  );
}
