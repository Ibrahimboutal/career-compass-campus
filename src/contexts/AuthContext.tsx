
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: "student" | "recruiter" | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"student" | "recruiter" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log("Initial session check:", currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await checkUserRole(currentSession.user.id);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false); // Always set loading to false when done
      }
    };

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (currentSession?.user) {
            await checkUserRole(currentSession.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUserRole(null);
        }
      }
    );
    
    // Initialize
    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      console.log("Checking user role for:", userId);
      // Check if user is a recruiter (employer)
      const { data: employer, error: employerError } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (employerError) {
        console.error("Error checking employer:", employerError);
      }
      
      if (employer) {
        console.log("User is a recruiter");
        setUserRole('recruiter');
        return;
      }
      
      // Check if user is a student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (studentError) {
        console.error("Error checking student:", studentError);
      }
      
      if (student) {
        console.log("User is a student");
        setUserRole('student');
        return;
      }
      
      // If neither, role is null
      console.log("User has no role assigned");
      setUserRole(null);
    } catch (error) {
      console.error('Error determining user role:', error);
      setUserRole(null);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
      setUserRole(null);
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  const value = {
    session,
    user,
    userRole,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
