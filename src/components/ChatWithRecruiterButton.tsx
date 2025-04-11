
import { Button, ButtonProps } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatWithRecruiterButtonProps extends ButtonProps {
  recruiterId: string;
  jobId?: string;
  variant?: "default" | "outline" | "ghost";
}

export function ChatWithRecruiterButton({ 
  recruiterId, 
  jobId,
  variant = "outline",
  ...props 
}: ChatWithRecruiterButtonProps) {
  const { createChatRoom } = useChat();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleStartChat = async () => {
    if (!user) {
      toast.error("You must be logged in to start a chat");
      navigate("/auth");
      return;
    }
    
    // Don't allow recruiters to chat with themselves
    if (user.id === recruiterId) {
      toast.error("You cannot chat with yourself");
      return;
    }
    
    // Create or get existing chat room
    const roomId = await createChatRoom(recruiterId, jobId);
    
    if (roomId) {
      navigate("/messages");
    }
  };
  
  return (
    <Button 
      onClick={handleStartChat} 
      variant={variant}
      {...props}
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      Chat with Recruiter
    </Button>
  );
}
