import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"student" | "employer">("student");
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Signing up as:", userType);
      
      // First create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            user_type: userType,
          },
        }
      });

      if (error) throw error;
      
      if (data.user) {
        // Then create the student record if it's a student
        if (userType === 'student') {
          console.log("Creating student record for:", data.user.id);
          const { error: studentError } = await supabase
            .from('students')
            .insert({
              user_id: data.user.id,
              name,
              email,
              major,
              graduation_year: graduationYear,
              skills: []
            });
          
          if (studentError) {
            console.error("Error creating student record:", studentError);
            throw studentError;
          }
          
          toast.success("Student account created successfully!");
          navigate("/dashboard");
        } else if (userType === 'employer') {
          // For employers, redirect to the employer registration page
          console.log("Redirecting employer to registration page");
          toast.success("Account created! Please complete your employer profile.");
          navigate("/employer/register");
        }
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      uiToast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Signing in with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success("Welcome back! You've successfully signed in.");
      
      // Check if the user is an employer
      const { data: employerData, error: employerError } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();
      
      if (!employerError && employerData) {
        console.log("User is an employer, redirecting to employer dashboard");
        navigate("/employer/dashboard");
      } else {
        // Check if the user is a student
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        if (!studentError && studentData) {
          console.log("User is a student, redirecting to dashboard");
          navigate("/dashboard");
        } else {
          // If no profile exists, but the user has signed up previously,
          // direct them to complete their profile based on user_type metadata
          const userType = data.user.user_metadata?.user_type;
          
          if (userType === 'employer') {
            console.log("User is an employer but has no profile, redirecting to registration");
            navigate("/employer/register");
          } else {
            // Default to dashboard - they'll be prompted to complete profile there
            console.log("User has no profile, redirecting to dashboard");
            navigate("/dashboard");
          }
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      uiToast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive"
      });
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full border-b bg-white py-4">
        <div className="container">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-job-blue" />
            <span className="font-bold text-xl text-job-blue">CampusJobs</span>
          </Link>
        </div>
      </header>
      
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">CampusJobs</CardTitle>
            <CardDescription>
              Connect with the best campus job opportunities
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="your.email@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-login">Password</Label>
                      <Link to="/reset-password" className="text-sm text-muted-foreground hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password-login"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-type">I am a:</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        type="button"
                        variant={userType === "student" ? "default" : "outline"}
                        onClick={() => setUserType("student")}
                        className="w-full"
                      >
                        Student
                      </Button>
                      <Button
                        type="button"
                        variant={userType === "employer" ? "default" : "outline"}
                        onClick={() => setUserType("employer")}
                        className="w-full"
                        >
                        Employer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {userType === "student" ? "Full Name" : "Contact Person Name"}
                    </Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input
                      id="email-signup"
                      type="email"
                      placeholder={userType === "student" ? "your.email@university.edu" : "contact@company.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <Input
                      id="password-signup"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  {userType === "student" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="major">Major</Label>
                        <Input
                          id="major"
                          placeholder="Computer Science"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="graduation-year">Expected Graduation Year</Label>
                        <Input
                          id="graduation-year"
                          placeholder="2026"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  
                  {userType === "employer" && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>After creating your account, you'll be prompted to provide company details.</p>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};

export default AuthPage;
