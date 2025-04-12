
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
  const { user } = useAuth();
  const { createChatRoom } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        
        if (type === "recruiters") {
          // Fetch recruiters (employers)
          const { data, error } = await supabase
            .from("employers")
            .select("user_id, company_name");
            
          if (error) throw error;
          
          const formattedContacts = data.map(employer => ({
            id: employer.user_id,
            name: employer.company_name,
            type: "recruiter" as const
          }));
          
          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);
        } else {
          // Fetch students - now from students table instead of profiles
          const { data, error } = await supabase
            .from("students")
            .select("user_id, name, major");
            
          if (error) throw error;
          
          const formattedContacts = data
            .filter(student => student.name) // Only include students with names
            .map(student => ({
              id: student.user_id,
              name: student.name || "Student",
              title: student.major,
              type: "student" as const
            }));
          
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
    
    fetchContacts();
  }, [type]);
  
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
      return;
    }
    
    try {
      // Create or get existing chat room
      let roomId: string | null;
      
      if (contactType === "recruiter") {
        // Student chatting with recruiter
        roomId = await createChatRoom(contactId);
      } else {
        // Recruiter chatting with student
        roomId = await createChatRoom(contactId);
      }
      
      if (roomId) {
        navigate("/messages");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat");
    }
  };
  
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
