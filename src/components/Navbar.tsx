
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Briefcase } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export function Navbar() {
  const isMobile = useIsMobile();
  const [showSearch, setShowSearch] = useState(false);

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
          <Link to="/dashboard">
            <Button variant="ghost" className="text-muted-foreground">
              Dashboard
            </Button>
          </Link>
          <Link to="/jobs">
            <Button variant="ghost" className="text-muted-foreground">
              Browse Jobs
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <User className="h-5 w-5" />
            </Button>
          </Link>
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
