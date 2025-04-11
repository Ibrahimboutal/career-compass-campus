
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface ChatRoomItemProps {
  id: string;
  studentId: string;
  recruiterId: string;
  updatedAt: string;
  isActive: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function ChatRoomItem({
  id,
  studentId,
  recruiterId,
  updatedAt,
  isActive,
  onClick,
  unreadCount = 0
}: ChatRoomItemProps) {
  const { user } = useAuth();
  const [partnerName, setPartnerName] = useState<string>("Loading...");
  const isStudent = user?.id === studentId;
  const partnerId = isStudent ? recruiterId : studentId;
  
  useEffect(() => {
    const fetchPartnerInfo = async () => {
      try {
        if (isStudent) {
          // Get recruiter info (employer)
          const { data, error } = await supabase
            .from('employers')
            .select('company_name')
            .eq('user_id', partnerId)
            .single();
            
          if (error) throw error;
          setPartnerName(data.company_name);
        } else {
          // Get student info (profile)
          const { data, error } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', partnerId)
            .single();
            
          if (error) throw error;
          setPartnerName(data.name || 'Student');
        }
      } catch (error) {
        console.error('Error fetching partner info:', error);
        setPartnerName(isStudent ? 'Recruiter' : 'Student');
      }
    };
    
    fetchPartnerInfo();
  }, [partnerId, isStudent]);
  
  return (
    <div 
      className={`p-4 cursor-pointer rounded-md hover:bg-muted/50 transition-colors ${
        isActive ? 'bg-muted' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium">{partnerName}</div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-1">
        <div className="text-sm text-muted-foreground truncate">
          {isStudent ? "Recruiter" : "Student"}
        </div>
        
        {unreadCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-0.5">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
