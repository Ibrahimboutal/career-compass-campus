import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/contexts/ChatContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ContactItem {
  id: string;
  name: string;
  title?: string;
  type: "student" | "recruiter";
}

interface ContactDirectoryProps {
  type: "students" | "recruiters";
}

export function ContactDirectory({ type }: ContactDirectoryProps) {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRole } = useAuth();
  const { createChatRoom } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching ${type}...`);
        
        // Make sure we have a valid user
        if (!user) {
          console.error("No user found");
          return;
        }
        
        if (type === "recruiters") {
          // Fetch recruiters (employers)
          const { data, error } = await supabase
            .from("employers")
            .select("user_id, company_name")
            .neq('user_id', user.id); // Exclude current user
            
          if (error) {
            console.error("Error fetching recruiters:", error);
            throw error;
          }
          
          console.log("Recruiters data:", data);
          
          if (!data || data.length === 0) {
            console.log("No recruiters found");
            setContacts([]);
            setFilteredContacts([]);
            setIsLoading(false);
            return;
          }
          
          const formattedContacts = data.map(employer => ({
            id: employer.user_id,
            name: employer.company_name || "Company",
            type: "recruiter" as const
          }));
          
          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);
        } else {
          // Fetch students - fixing the issue here by using proper query
          console.log("Fetching students...");
          
          // Use a direct query without filters initially to see all students
          const { data, error } = await supabase
            .from("students")
            .select("*");
            
          if (error) {
            console.error("Error fetching students:", error);
            throw error;
          }
          
          console.log("All students data:", data);
          
          // Now properly fetch students excluding current user
          const { data: studentData, error: studentError } = await supabase
            .from("students")
            .select("user_id, name, major")
            .neq('user_id', user.id); // Exclude current user
            
          if (studentError) {
            console.error("Error fetching students:", studentError);
            throw studentError;
          }
          
          console.log("Filtered students data:", studentData);
          
          if (!studentData || studentData.length === 0) {
            console.log("No students found after filtering");
            setContacts([]);
            setFilteredContacts([]);
            setIsLoading(false);
            return;
          }
          
          const formattedContacts = studentData
            .filter(student => student.user_id) // Make sure user_id exists
            .map(student => ({
              id: student.user_id,
              name: student.name || "Student",
              title: student.major,
              type: "student" as const
            }));
          
          console.log("Formatted student contacts:", formattedContacts);
          
          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);
        }
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        toast.error(`Failed to load ${type}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchContacts();
    } else {
      setIsLoading(false);
    }
  }, [type, user]);
  
  useEffect(() => {
    // Filter contacts based on search term
    if (!searchTerm.trim()) {
      setFilteredContacts(contacts);
      return;
    }
    
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.title && contact.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);
  
  const handleStartChat = async (contactId: string, contactType: "student" | "recruiter") => {
    if (!user) {
      toast.error("You must be logged in to start a chat");
      navigate("/auth");
      return;
    }
    
    // Don't allow recruiters to chat with themselves
    if (user.id === contactId) {
      toast.error("You cannot chat with yourself");
      return;
    }
    
    try {
      // Create or get existing chat room
      const roomId = await createChatRoom(contactId);
      
      if (roomId) {
        toast.success("Chat started");
        navigate("/messages");
      } else {
        toast.error("Failed to start chat");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat");
    }
  };
  
  // Determine what type of contacts this user should be looking for
  const shouldFetchRecruiters = userRole === "student";
  const correctDirectoryType = shouldFetchRecruiters ? "recruiters" : "students";
  
  // If user is viewing the wrong directory for their role, show a message
  if (type !== correctDirectoryType && user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available {type === "recruiters" ? "Recruiters" : "Students"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              {userRole === "student" 
                ? "As a student, you can connect with recruiters." 
                : "As a recruiter, you can connect with students."}
            </p>
            <Button 
              className="mt-4" 
              onClick={() => navigate(`/connections`)}
            >
              Go to Connections
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Available {type === "recruiters" ? "Recruiters" : "Students"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${type}...`}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No {type} found</p>
            {contacts.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                There are currently no {type} available for chat
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div 
                key={contact.id} 
                className="flex justify-between items-center p-3 rounded-md border hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{contact.name}</p>
                  {contact.title && (
                    <p className="text-sm text-muted-foreground">{contact.title}</p>
                  )}
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStartChat(contact.id, contact.type)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
