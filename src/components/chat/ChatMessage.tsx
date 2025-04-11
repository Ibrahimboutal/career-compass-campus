
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  content: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

export function ChatMessage({ content, senderId, timestamp, isRead }: ChatMessageProps) {
  const { user } = useAuth();
  const isMine = user?.id === senderId;
  
  return (
    <div className={`flex mb-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`relative max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
          isMine 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <div>{content}</div>
        <div className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
          {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          {isMine && (
            <span className="ml-2">
              {isRead ? 'Read' : 'Sent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
