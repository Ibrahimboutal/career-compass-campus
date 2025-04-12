
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
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await checkUserRole(currentSession.user.id);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Get the initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await checkUserRole(currentSession.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      // Check if user is a recruiter (employer)
      const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (employer) {
        setUserRole('recruiter');
        return;
      }
      
      // Check if user is a student
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (student) {
        setUserRole('student');
        return;
      }
      
      // If neither, role is null
      setUserRole(null);
    } catch (error) {
      console.error('Error determining user role:', error);
      setUserRole(null);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, userRole, signOut, loading }}>
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
