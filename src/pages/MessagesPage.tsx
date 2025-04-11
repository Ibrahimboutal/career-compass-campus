
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatRoomItem } from "@/components/chat/ChatRoomItem";
import { ChatInputBox } from "@/components/chat/ChatInputBox";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MessagesPage = () => {
  const { 
    chatRooms, 
    currentRoom, 
    messages, 
    loadingRooms, 
    loadingMessages, 
    setCurrentRoom, 
    sendMessage 
  } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Count unread messages for each room
  useEffect(() => {
    if (!user || chatRooms.length === 0) return;
    
    const fetchUnreadCounts = async () => {
      const counts: Record<string, number> = {};
      
      for (const room of chatRooms) {
        try {
          const { count, error } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .eq('is_read', false)
            .neq('sender_id', user.id);
            
          if (!error) {
            counts[room.id] = count || 0;
          }
        } catch (error) {
          console.error('Error counting unread messages:', error);
        }
      }
      
      setUnreadCounts(counts);
    };
    
    fetchUnreadCounts();
  }, [chatRooms, user]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden flex min-h-[600px]">
          {/* Chat list */}
          <div className="w-full md:w-1/3 border-r">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            
            {loadingRooms ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/60" />
                <h3 className="mt-4 text-lg font-medium">No conversations yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your conversations with recruiters will appear here
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[calc(600px-65px)]">
                {chatRooms.map(room => (
                  <ChatRoomItem
                    key={room.id}
                    id={room.id}
                    studentId={room.student_id}
                    recruiterId={room.recruiter_id}
                    updatedAt={room.updated_at}
                    isActive={currentRoom?.id === room.id}
                    onClick={() => setCurrentRoom(room)}
                    unreadCount={unreadCounts[room.id] || 0}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Chat messages */}
          <div className="hidden md:flex flex-col w-2/3 bg-white">
            {!currentRoom ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/60" />
                <h3 className="mt-4 text-xl font-medium">Select a conversation</h3>
                <p className="mt-2 text-muted-foreground">
                  Choose a conversation from the sidebar to start chatting
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">
                    {user?.id === currentRoom.student_id ? "Recruiter" : "Student"}
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <p className="text-muted-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground">Start the conversation by sending a message</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map(message => (
                        <ChatMessage
                          key={message.id}
                          content={message.content}
                          senderId={message.sender_id}
                          timestamp={message.created_at}
                          isRead={message.is_read}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                
                <ChatInputBox onSendMessage={sendMessage} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
