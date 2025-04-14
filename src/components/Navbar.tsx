
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Briefcase, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const isMobile = useIsMobile();
  const [showSearch, setShowSearch] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "There was an error signing out.",
        variant: "destructive"
      });
    }
  };

  // Determine profile link based on user role
  const getProfileLink = () => {
    return userRole === 'recruiter' ? "/employer/profile/edit" : "/profile";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-job-blue" />
            <span className="font-bold text-xl text-job-blue">CampusJobs</span>
          </Link>
        </div>

        {!isMobile && (
          <div className="flex items-center mx-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="w-full pl-8 bg-muted border-none focus-visible:ring-1"
              />
            </div>
          </div>
        )}

        <nav className="flex items-center gap-2">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSearch(!showSearch)}
              className="text-muted-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Link to="/jobs">
            <Button variant="ghost" className="text-muted-foreground">
              Browse Jobs
            </Button>
          </Link>

          {user ? (
            <>
              {userRole === 'recruiter' ? (
                <Link to="/employer/dashboard">
                  <Button variant="ghost" className="text-muted-foreground">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-muted-foreground">
                    Dashboard
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={getProfileLink()} className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
      
      {isMobile && showSearch && (
        <div className="border-t p-2 bg-white">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
              className="w-full pl-8 bg-muted border-none"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
