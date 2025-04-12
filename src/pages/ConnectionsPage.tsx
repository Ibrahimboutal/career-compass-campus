
import { Navbar } from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactDirectory } from "@/components/chat/ContactDirectory";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function ConnectionsPage() {
  const { user, userRole } = useAuth();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Connections</h1>
        
        {userRole === "student" ? (
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
        ) : userRole === "recruiter" ? (
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
            <p>Please complete your profile setup to connect with others.</p>
          </div>
        )}
      </main>
    </div>
  );
}
