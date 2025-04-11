
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import { Button } from "@/components/ui/button";

export function ChatNavItem() {
  const { unreadCount } = useChat();
  
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/messages" className="relative">
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="sr-only">Messages</span>
      </Link>
    </Button>
  );
}
