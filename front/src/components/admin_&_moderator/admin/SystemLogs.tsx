import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Filter } from "lucide-react";
import { LogsFilter } from "./LogsFilter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type SystemLog = {
  id: string;
  timestamp: string;
  action: string;
  performedBy: {
    id: string;
    name: string;
    role: "admin" | "moderator" | "system";
  };
  details: string;
  severity: "info" | "warning" | "error";
};

interface SystemLogsProps {
  logs: SystemLog[];
}

export function SystemLogs({ logs: initialLogs }: SystemLogsProps) {
  const [logs, setLogs] = useState<SystemLog[]>(initialLogs);
  const [filter, setFilter] = useState<{
    severity: "all" | "info" | "warning" | "error";
    role: "all" | "admin" | "moderator" | "system";
  }>({
    severity: "all",
    role: "all",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Apply filters whenever they change
  const filteredLogs = logs.filter((log) => {
    const matchesSeverity = filter.severity === "all" || log.severity === filter.severity;
    const matchesRole = filter.role === "all" || log.performedBy.role === filter.role;
    const matchesSearch = !searchQuery || 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSeverity && matchesRole && matchesSearch;
  });

  const getSeverityBadge = (severity: SystemLog["severity"]) => {
    switch (severity) {
      case "info":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-3xs">Info</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-3xs">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-3xs">Error</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: SystemLog["performedBy"]["role"]) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-3xs">Admin</Badge>;
      case "moderator":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-3xs">Moderator</Badge>;
      case "system":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-3xs">System</Badge>;
      default:
        return null;
    }
  };

  const handleExportLogs = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      const fileName = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
      toast.success(`Logs exported successfully as ${fileName}`);
      setIsExporting(false);
    }, 1000);
  };

  const handleViewLogDetails = (log: SystemLog) => {
    setSelectedLog(log);
    setIsDialogOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast.info(query ? `Searching for: "${query}"` : "Search cleared");
  };

  return (
    <div className="space-y-4">
      <LogsFilter
        filter={filter}
        onChange={(newFilter) => setFilter(newFilter)}
        onSearch={handleSearch}
      />

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Timestamp</TableHead>
              <TableHead className="text-xs">Action</TableHead>
              <TableHead className="text-xs">Performer</TableHead>
              <TableHead className="text-xs">Severity</TableHead>
              <TableHead className="text-xs">Details</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-[10px]">{log.timestamp}</TableCell>
                  <TableCell className="text-[10px]">{log.action}</TableCell>
                  <TableCell className="text-[10px]">
                    <div className="flex flex-col space-y-1">
                      <div className="text-[10px]">{log.performedBy.name}</div>
                      <div>{getRoleBadge(log.performedBy.role)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px]">{getSeverityBadge(log.severity)}</TableCell>
                  <TableCell className="text-[10px] max-w-xs truncate">{log.details}</TableCell>
                  <TableCell className="text-[10px] text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px]"
                      onClick={() => handleViewLogDetails(log)}
                    >
                      <FileText className="h-2 w-2 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs">
                  No logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[10px] flex items-center gap-1"
          onClick={handleExportLogs}
          disabled={isExporting}
        >
          <Download className="h-3 w-3" />
          {isExporting ? "Exporting..." : "Export Logs"}
        </Button>
      </div> */}

      {/* Log Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Log Details</DialogTitle>
            <DialogDescription className="text-[11px]">
              Complete information about this system log.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="font-medium">Log ID:</div>
                <div className="text-[10px]">{selectedLog.id}</div>
                
                <div className="font-medium">Timestamp:</div>
                <div className="text-[10px]">{selectedLog.timestamp}</div>
                
                <div className="font-medium">Action:</div>
                <div className="text-[10px]">{selectedLog.action}</div>
                
                <div className="font-medium">Performed By:</div>
                <div className="text-[10px]">{selectedLog.performedBy.name} ({selectedLog.performedBy.role})</div>
                
                <div className="font-medium">Severity:</div>
                <div className="text-[10px]">{getSeverityBadge(selectedLog.severity)}</div>
              </div>
              
              <div>
                <div className="font-medium text-[11px] mb-2">Details:</div>
                <div className="text-[10px] bg-gray-50 p-3 rounded">{selectedLog.details}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
