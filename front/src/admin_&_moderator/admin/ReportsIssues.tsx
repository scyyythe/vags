import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { mockReports, mockUsers } from "@/components/admin_&_moderator/data/mockData";
import { User, Report } from "@/components/admin_&_moderator/types";
import { Check, Eye, MessageSquare, User as UserIcon, AlertTriangle, ImageIcon, Flag } from "lucide-react";
import { toast } from "sonner";

// Extended mock reports with more examples
const extendedMockReports = [
  ...mockReports,
  {
    id: "4",
    reportType: "artwork",
    reportedId: "artwork-456",
    reporter: mockUsers[2],
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    description: "This artwork appears to be plagiarized from another artist.",
    priority: "high",
  },
  {
    id: "5",
    reportType: "comment",
    reportedId: "comment-789",
    reporter: mockUsers[3],
    assignedTo: mockUsers[1],
    status: "investigating",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    description: "Spam comment promoting external website.",
    priority: "medium",
  },
  {
    id: "6",
    reportType: "user",
    reportedId: mockUsers[4].id,
    reporter: mockUsers[2],
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    description: "User is creating multiple accounts to manipulate bid prices.",
    notes: "User accounts suspended, IP banned.",
    priority: "high",
  },
];

const ReportsIssues = () => {
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [resolution, setResolution] = useState("");

  const handleAssignToMe = (reportId: string) => {
    toast.success(`Report #${reportId} assigned to you`);
  };

  const handleResolveReport = (reportId: string) => {
    if (resolution.trim() === "") {
      toast.error("Please enter resolution details");
      return;
    }
    toast.success(`Report #${reportId} marked as resolved`);
    setSelectedReport(null);
    setResolution("");
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "artwork":
        return <ImageIcon className="h-4 w-4" />;
      case "user":
        return <UserIcon className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  };

  const filteredReports = extendedMockReports.filter(report => {
    const matchesPriority = selectedPriority === "all" || report.priority === selectedPriority;
    const matchesType = selectedType === "all" || report.reportType === selectedType;
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus;
    const matchesSearch = searchTerm === "" || 
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesType && matchesStatus && matchesSearch;
  });

  const selectedReportDetails = selectedReport 
    ? extendedMockReports.find(r => r.id === selectedReport)
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Reports & Issues</h2>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="grid w-[180px] gap-1.5">
            <Label htmlFor="type">Report Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="artwork">Artwork</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-[180px] gap-1.5">
            <Label htmlFor="priority">Priority</Label>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-[180px] gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search report description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" type="submit">Search</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Reports List</CardTitle>
              <CardDescription>Reports and issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reporter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id} className={selectedReport === report.id ? "bg-muted/50" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getReportTypeIcon(report.reportType)}
                            <span className="capitalize">{report.reportType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={report.reporter.avatar} />
                              <AvatarFallback>{report.reporter.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {report.reporter.name}
                          </div>
                        </TableCell>
                        <TableCell>{report.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(report.priority)}`}>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            report.status === "pending" ? "outline" :
                            report.status === "investigating" ? "secondary" :
                            report.status === "resolved" ? "default" : "destructive"
                          }>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {report.status === "pending" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleAssignToMe(report.id)}
                              >
                                Assign to Me
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              title="View Details"
                              onClick={() => setSelectedReport(report.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Report Details</CardTitle>
              <CardDescription>
                {selectedReportDetails 
                  ? `Report #${selectedReportDetails.id} Details` 
                  : "Select a report to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedReportDetails ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Badge className="capitalize">{selectedReportDetails.reportType}</Badge>
                    <Badge variant={
                      selectedReportDetails.status === "pending" ? "outline" :
                      selectedReportDetails.status === "investigating" ? "secondary" :
                      selectedReportDetails.status === "resolved" ? "default" : "destructive"
                    }>
                      {selectedReportDetails.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Reported By</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedReportDetails.reporter.avatar} />
                        <AvatarFallback>{selectedReportDetails.reporter.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedReportDetails.reporter.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedReportDetails.reporter.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedReportDetails.assignedTo && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedReportDetails.assignedTo.avatar} />
                          <AvatarFallback>{selectedReportDetails.assignedTo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{selectedReportDetails.assignedTo.name}</div>
                          <div className="text-xs text-muted-foreground">{selectedReportDetails.assignedTo.email}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date Reported</h4>
                    <p>{selectedReportDetails.createdAt.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="mt-1 text-sm">{selectedReportDetails.description}</p>
                  </div>
                  
                  {selectedReportDetails.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Resolution Notes</h4>
                      <p className="mt-1 text-sm">{selectedReportDetails.notes}</p>
                    </div>
                  )}
                  
                  {selectedReportDetails.status !== "resolved" && (
                    <div className="space-y-2 pt-4">
                      <Label htmlFor="resolution">Resolution</Label>
                      <Textarea 
                        id="resolution" 
                        placeholder="Enter resolution details..."
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                      />
                      <Button 
                        className="w-full" 
                        onClick={() => handleResolveReport(selectedReportDetails.id)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Resolved
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Report Selected</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a report from the list to view its details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportsIssues;
