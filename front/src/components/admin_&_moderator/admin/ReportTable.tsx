import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export type Report = {
  id: string;
  reportType: "offensive" | "fraud" | "spam" | "plagiarism" | "other";
  reportedId: string;
  reportedType: "artwork" | "user" | "comment" | "bid";
  reportedBy: string;
  status: "pending" | "investigating" | "resolved" | "dismissed";
  dateReported: string;
  description: string;
};

interface ReportTableProps {
  initialReports: Report[];
  onInvestigateReport?: (id: string) => void;
  onResolveReport?: (id: string) => void;
  onDismissReport?: (id: string) => void;
  onEscalateReport?: (id: string) => void;
}

export function ReportTable({
  initialReports,
  onInvestigateReport,
  onResolveReport,
  onDismissReport,
  onEscalateReport,
}: ReportTableProps) {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Report["status"] | "all">("all");
  const [typeFilter, setTypeFilter] = useState<Report["reportType"] | "all">("all");

  const filteredReports = reports.filter(
    (report) => {
      const matchesSearch = report.reportedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportType.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      const matchesType = typeFilter === "all" || report.reportType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    }
  );

  const handleExportReports = () => {
    toast.success("Reports exported successfully");
  };

  const getStatusBadge = (status: Report["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-3xs">Pending</Badge>;
      case "investigating":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-3xs">Investigating</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-3xs">Resolved</Badge>;
      case "dismissed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-3xs">Dismissed</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: Report["reportType"]) => {
    switch (type) {
      case "offensive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-3xs">Offensive</Badge>;
      case "fraud":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-3xs">Fraud</Badge>;
      case "spam":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 text-3xs">Spam</Badge>;
      case "plagiarism":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-3xs">Plagiarism</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-3xs">Other</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search reports..."
            className="pl-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as Report["status"] | "all")}
        >
          <SelectTrigger className="w-[140px] text-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Status</SelectItem>
            <SelectItem value="pending" className="text-xs">Pending</SelectItem>
            <SelectItem value="investigating" className="text-xs">Investigating</SelectItem>
            <SelectItem value="resolved" className="text-xs">Resolved</SelectItem>
            <SelectItem value="dismissed" className="text-xs">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as Report["reportType"] | "all")}
        >
          <SelectTrigger className="w-[140px] text-xs">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Types</SelectItem>
            <SelectItem value="offensive" className="text-xs">Offensive</SelectItem>
            <SelectItem value="fraud" className="text-xs">Fraud</SelectItem>
            <SelectItem value="spam" className="text-xs">Spam</SelectItem>
            <SelectItem value="plagiarism" className="text-xs">Plagiarism</SelectItem>
            <SelectItem value="other" className="text-xs">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Content Type</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="text-2xs">
                    {getTypeBadge(report.reportType)}
                  </TableCell>
                  <TableCell className="text-2xs">
                    <div>
                      <div className="font-medium text-2xs capitalize">{report.reportedType}</div>
                      <div className="text-3xs text-gray-500">ID: {report.reportedId.substring(0, 8)}...</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-2xs">{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-2xs">{report.dateReported}</TableCell>
                  <TableCell className="text-2xs text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 text-2xs">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-xs">Report Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {report.status === "pending" && (
                          <DropdownMenuItem 
                            className="text-xs"
                            onClick={() => onInvestigateReport && onInvestigateReport(report.id)}
                          >
                            Investigate
                          </DropdownMenuItem>
                        )}
                        {(report.status === "pending" || report.status === "investigating") && (
                          <>
                            <DropdownMenuItem 
                              className="text-xs"
                              onClick={() => onResolveReport && onResolveReport(report.id)}
                            >
                              Resolve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-xs"
                              onClick={() => onDismissReport && onDismissReport(report.id)}
                            >
                              Dismiss
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          className="text-xs"
                          onClick={() => onEscalateReport && onEscalateReport(report.id)}
                        >
                          Escalate to Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs">
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setTypeFilter("all");
          }}
        >
          Clear Filters
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs flex items-center gap-1"
          onClick={handleExportReports}
        >
          <Download className="h-3 w-3" />
          Export Reports
        </Button>
      </div>
    </div>
  );
}
