import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface LogsFilterProps {
  filter: {
    severity: "all" | "info" | "warning" | "error";
    role: "all" | "admin" | "moderator" | "system";
  };
  onChange: (filter: {
    severity: "all" | "info" | "warning" | "error";
    role: "all" | "admin" | "moderator" | "system";
  }) => void;
  onSearch?: (query: string) => void;
}

export function LogsFilter({ filter, onChange, onSearch }: LogsFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Default search behavior
      toast.success(`Searching logs for: ${searchQuery}`);
      console.log("Searching logs for:", searchQuery);
    }
  };
  
  const handleExportLogs = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      console.log("Exporting logs with filters:", filter);
      const fileName = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
      
      toast.success(`Logs exported successfully as ${fileName}`);
      setIsExporting(false);
    }, 1000);
  };

  const handleClearFilters = () => {
    onChange({ severity: "all", role: "all" });
    setSearchQuery("");
    toast.info("All filters cleared");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
            <Input
              placeholder="Search logs..."
              className="pl-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{fontSize:"10px"}}
            />
          </form>
        </div>
        <Select
          value={filter.severity}
          onValueChange={(value) => {
            onChange({ ...filter, severity: value as "all" | "info" | "warning" | "error" });
            toast.info(`Severity filter set to: ${value}`);
          }}
        >
          <SelectTrigger className="w-[140px] text-xs">
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Severities</SelectItem>
            <SelectItem value="info" className="text-xs">Info</SelectItem>
            <SelectItem value="warning" className="text-xs">Warning</SelectItem>
            <SelectItem value="error" className="text-xs">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filter.role}
          onValueChange={(value) => {
            onChange({ ...filter, role: value as "all" | "admin" | "moderator" | "system" });
            toast.info(`Role filter set to: ${value}`);
          }}
        >
          <SelectTrigger className="w-[140px] text-xs">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Roles</SelectItem>
            <SelectItem value="admin" className="text-xs">Admin</SelectItem>
            <SelectItem value="moderator" className="text-xs">Moderator</SelectItem>
            <SelectItem value="system" className="text-xs">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1"
          onClick={handleClearFilters}
        >
          <RefreshCw className="h-3 w-3" />
          Clear Filters
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1"
          onClick={handleExportLogs}
          disabled={isExporting}
        >
          <Download className="h-3 w-3" />
          {isExporting ? "Exporting..." : "Export Logs"}
        </Button>
      </div>
    </div>
  );
}
