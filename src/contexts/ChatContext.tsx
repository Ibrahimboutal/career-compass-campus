
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatRoom {
  id: string;
  student_id: string;
  recruiter_id: string;
  job_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  loadingRooms: boolean;
  loadingMessages: boolean;
  setCurrentRoom: (room: ChatRoom | null) => void;
  sendMessage: (content: string) => Promise<void>;
  createChatRoom: (partnerId: string, jobId?: string) => Promise<string | null>;
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, userRole } = useAuth();

  // Fetch chat rooms
  useEffect(() => {
    if (!user) {
      setChatRooms([]);
      setLoadingRooms(false);
      return;
    }

    const fetchChatRooms = async () => {
      try {
        setLoadingRooms(true);
        
        // Query using filters based on user role
        const query = supabase
          .from('chat_rooms')
          .select('*');
        
        if (userRole === 'student') {
          query.eq('student_id', user.id);
        } else if (userRole === 'recruiter') {
          query.eq('recruiter_id', user.id);
        } else {
          // If role is not determined yet, try both
          query.or(`student_id.eq.${user.id},recruiter_id.eq.${user.id}`);
        }
        
        // Add sorting
        query.order('updated_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching chat rooms:', error);
          throw error;
        }
        
        console.log('Chat rooms fetched:', data);
        setChatRooms(data || []);
        
        // Calculate unread count
        const countUnread = async () => {
          if (!data || data.length === 0) return;
          
          const roomIds = data.map(room => room.id);
          const { count, error } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .in('room_id', roomIds)
            .eq('is_read', false)
            .neq('sender_id', user.id);
            
          if (error) {
            console.error('Error counting unread messages:', error);
            return;
          }
          
          setUnreadCount(count || 0);
        };
        
        countUnread();
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        toast.error("Failed to load chat rooms");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchChatRooms();

    // Set up realtime subscription for chat rooms
    const roomsSubscription = supabase
      .channel('chat_rooms_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chat_rooms' }, 
        (payload) => {
          console.log('Chat rooms change received:', payload);
          fetchChatRooms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomsSubscription);
    };
  }, [user, userRole]);

  // Fetch messages for current room
  useEffect(() => {
    if (!currentRoom) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoadingMessages(true);
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', currentRoom.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        console.log('Messages fetched:', data);
        setMessages(data || []);
        
        // Mark messages as read
        if (user && data && data.length > 0) {
          const unreadMessages = data.filter(msg => 
            !msg.is_read && msg.sender_id !== user.id
          );
          
          if (unreadMessages.length > 0) {
            const unreadIds = unreadMessages.map(msg => msg.id);
            await supabase
              .from('chat_messages')
              .update({ is_read: true })
              .in('id', unreadIds);
              
            console.log('Marked messages as read:', unreadIds);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Set up realtime subscription for messages
    const messagesSubscription = supabase
      .channel('chat_messages_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${currentRoom.id}` }, 
        async (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as ChatMessage;
          
          // Add the new message to the list
          setMessages(prevMessages => [...prevMessages, newMessage]);
          
          // Mark message as read if it's not from the current user
          if (user && newMessage.sender_id !== user.id) {
            await supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [currentRoom, user]);

  // Create a new chat room
  const createChatRoom = async (partnerId: string, jobId?: string) => {
    if (!user) {
      toast.error("You must be logged in to start a chat");
      return null;
    }
    
    if (!userRole) {
      toast.error("Your account type isn't set up yet");
      return null;
    }

    try {
      console.log('Creating chat room with partner:', partnerId);
      console.log('Current user role:', userRole);
      
      let studentId: string;
      let recruiterId: string;
      
      if (userRole === 'student') {
        studentId = user.id;
        recruiterId = partnerId;
      } else if (userRole === 'recruiter') {
        recruiterId = user.id;
        studentId = partnerId;
      } else {
        toast.error("Your role must be either student or recruiter");
        return null;
      }

      // Check if room already exists
      const { data: existingRooms, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('student_id', studentId)
        .eq('recruiter_id', recruiterId);

      if (fetchError) {
        console.error('Error checking existing rooms:', fetchError);
        throw fetchError;
      }

      // If room exists, return its ID
      if (existingRooms && existingRooms.length > 0) {
        const existingRoom = existingRooms[0];
        console.log('Found existing room:', existingRoom);
        setCurrentRoom(existingRoom);
        return existingRoom.id;
      }

      // Create new room
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          student_id: studentId,
          recruiter_id: recruiterId,
          job_id: jobId || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat room:', error);
        throw error;
      }

      console.log('Created new room:', data);
      
      // Add the new room to the list and set as current
      setChatRooms(prevRooms => [data, ...prevRooms]);
      setCurrentRoom(data);
      
      return data.id;
    } catch (error) {
      console.error('Error creating chat room:', error);
      toast.error("Failed to create chat room");
      return null;
    }
  };

  // Send a message
  const sendMessage = async (content: string) => {
    if (!user || !currentRoom) {
      toast.error("Cannot send message");
      return;
    }

    try {
      console.log('Sending message:', content);
      console.log('To room:', currentRoom.id);
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoom.id,
          sender_id: user.id,
          content
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
      
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  return (
    <ChatContext.Provider value={{
      chatRooms,
      currentRoom,
      messages,
      loadingRooms,
      loadingMessages,
      setCurrentRoom,
      sendMessage,
      createChatRoom,
      unreadCount
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
