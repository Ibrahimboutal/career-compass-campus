
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface JobFilterProps {
  onFilter: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  jobType: string[];
  searchTerm: string;
  location: string;
}

export function JobFilter({ onFilter }: JobFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<string[]>([]);

  const handleJobTypeChange = (type: string) => {
    if (jobType.includes(type)) {
      setJobType(jobType.filter((t) => t !== type));
    } else {
      setJobType([...jobType, type]);
    }
  };

  const applyFilters = () => {
    onFilter({
      jobType,
      searchTerm,
      location
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setLocation("");
    setJobType([]);
    onFilter({
      jobType: [],
      searchTerm: "",
      location: ""
    });
  };

  return (
    <div className="bg-white rounded-lg border p-5 space-y-5">
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search job title or keywords"
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Input
          type="text"
          placeholder="Location (city, state, or remote)"
          className="w-full"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-sm">Job Type</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="fulltime" 
              checked={jobType.includes("Full-time")} 
              onCheckedChange={() => handleJobTypeChange("Full-time")}
            />
            <label
              htmlFor="fulltime"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Full-time
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="parttime" 
              checked={jobType.includes("Part-time")} 
              onCheckedChange={() => handleJobTypeChange("Part-time")}
            />
            <label
              htmlFor="parttime"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Part-time
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="internship" 
              checked={jobType.includes("Internship")} 
              onCheckedChange={() => handleJobTypeChange("Internship")}
            />
            <label
              htmlFor="internship"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Internship
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="contract" 
              checked={jobType.includes("Contract")} 
              onCheckedChange={() => handleJobTypeChange("Contract")}
            />
            <label
              htmlFor="contract"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Contract
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-2">
        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
