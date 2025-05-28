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
          <Search className="absolute left-2 top-4 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Search reports..."
            className="pl-8 rounded-full h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: "10px" }}
          />
        </div>
        
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as Report["status"] | "all")}
        >
          <SelectTrigger className="w-[140px] text-[10px] rounded-full h-8">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[10px]">All Status</SelectItem>
            <SelectItem value="pending" className="text-[10px]">Pending</SelectItem>
            <SelectItem value="investigating" className="text-[10px]">Investigating</SelectItem>
            <SelectItem value="resolved" className="text-[10px]">Resolved</SelectItem>
            <SelectItem value="dismissed" className="text-[10px]">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as Report["reportType"] | "all")}
        >
          <SelectTrigger className="w-[140px] text-[10px] rounded-full h-8">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[10px]">All Types</SelectItem>
            <SelectItem value="offensive" className="text-[10px]">Offensive</SelectItem>
            <SelectItem value="fraud" className="text-[10px]">Fraud</SelectItem>
            <SelectItem value="spam" className="text-[10px]">Spam</SelectItem>
            <SelectItem value="plagiarism" className="text-[10px]">Plagiarism</SelectItem>
            <SelectItem value="other" className="text-[10px]">Other</SelectItem>
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
                  <TableCell className="text-[10px]">
                    {getTypeBadge(report.reportType)}
                  </TableCell>
                  <TableCell className="text-[11px]">
                    <div>
                      <div className="font-medium text-[11px] capitalize">{report.reportedType}</div>
                      <div className="text-[10px] text-gray-500">ID: {report.reportedId.substring(0, 8)}...</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px]">{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-[11px]">{report.dateReported}</TableCell>
                  <TableCell className="text-[10px] text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 text-2xs">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-[11px]">Report Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {report.status === "pending" && (
                          <DropdownMenuItem 
                            className="text-[10px]"
                            onClick={() => onInvestigateReport && onInvestigateReport(report.id)}
                          >
                            Investigate
                          </DropdownMenuItem>
                        )}
                        {(report.status === "pending" || report.status === "investigating") && (
                          <>
                            <DropdownMenuItem 
                              className="text-[10px]"
                              onClick={() => onResolveReport && onResolveReport(report.id)}
                            >
                              Resolve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-[10px]"
                              onClick={() => onDismissReport && onDismissReport(report.id)}
                            >
                              Dismiss
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem 
                          className="text-[10px]"
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
        {/* <Button 
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
        </Button> */}
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[11px] flex items-center gap-1 h-8"
          onClick={handleExportReports}
        > 
          <Download className="h-3 w-3" />
          Export Reports
        </Button>
      </div>
    </div>
  );
}
