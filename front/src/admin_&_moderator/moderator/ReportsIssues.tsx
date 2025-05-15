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
import { Flag, AlertTriangle, Eye, CheckCircle, Search, ImageIcon, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";

// Mock report data for moderator view
const mockReports = [
  {
    id: "rep-001",
    reportType: "artwork",
    reportedItemId: "art-123",
    reportedItemTitle: "Naked Sculpture",
    reportedItemImage: "https://placehold.co/100x100",
    reporterName: "John Smith",
    reporterAvatar: "",
    reportedUserName: "Artist Name",
    reportedUserAvatar: "",
    description: "This artwork contains explicit content that should be age-restricted.",
    createdAt: new Date(Date.now() - 3600000 * 2),
    status: "pending",
    priority: "medium",
    assignedTo: null,
  },
  {
    id: "rep-002",
    reportType: "comment",
    reportedItemId: "comment-456",
    reportedItemTitle: "Comment on 'Abstract Emotions'",
    reportedItemImage: null,
    reporterName: "Lisa Jones",
    reporterAvatar: "",
    reportedUserName: "Michael Peterson",
    reportedUserAvatar: "",
    description: "Comment contains spam links to external websites. User has posted similar comments on multiple artworks.",
    createdAt: new Date(Date.now() - 3600000 * 5),
    status: "pending",
    priority: "low",
    assignedTo: null,
  },
  {
    id: "rep-003",
    reportType: "user",
    reportedItemId: "user-789",
    reportedItemTitle: "User Profile: James Wilson",
    reportedItemImage: null,
    reporterName: "Emma Thompson",
    reporterAvatar: "",
    reportedUserName: "James Wilson",
    reportedUserAvatar: "",
    description: "User is sending harassing messages to multiple artists about their work.",
    createdAt: new Date(Date.now() - 3600000 * 12),
    status: "investigating",
    priority: "high",
    assignedTo: {
      id: "mod-456",
      name: "Moderator User",
    },
  },
  {
    id: "rep-004",
    reportType: "artwork",
    reportedItemId: "art-789",
    reportedItemTitle: "Digital Abstract",
    reportedItemImage: "https://placehold.co/100x100",
    reporterName: "Robert Chen",
    reporterAvatar: "",
    reportedUserName: "Sarah Johnson",
    reportedUserAvatar: "",
    description: "This artwork appears to be plagiarized from another artist I follow.",
    createdAt: new Date(Date.now() - 3600000 * 24),
    status: "pending",
    priority: "high",
    assignedTo: null,
  },
  {
    id: "rep-005",
    reportType: "comment",
    reportedItemId: "comment-123",
    reportedItemTitle: "Comment on 'Renaissance Portrait'",
    reportedItemImage: null,
    reporterName: "David Miller",
    reporterAvatar: "",
    reportedUserName: "Alex Johnson",
    reportedUserAvatar: "",
    description: "Offensive language in this comment that violates community guidelines.",
    createdAt: new Date(Date.now() - 3600000 * 36),
    status: "resolved",
    priority: "medium",
    assignedTo: {
      id: "mod-789",
      name: "Sophia Williams",
    },
    resolution: "Comment removed and user issued a warning."
  }
];

const ModeratorReportsIssues = () => {
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
        return <User className="h-4 w-4" />;
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "investigating":
        return "secondary";
      case "resolved":
        return "default";
      default:
        return "outline";
    }
  };

  const filteredReports = mockReports.filter(report => {
    const matchesPriority = selectedPriority === "all" || report.priority === selectedPriority;
    const matchesType = selectedType === "all" || report.reportType === selectedType;
    const matchesStatus = selectedStatus === "all" || report.status === selectedStatus;
    const matchesSearch = searchTerm === "" || 
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.reportedItemTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesType && matchesStatus && matchesSearch;
  });

  const selectedReportDetails = selectedReport ? mockReports.find(r => r.id === selectedReport) : null;

  // Count reports by priority for the overview
  const highPriorityCount = mockReports.filter(r => r.priority === "high").length;
  const pendingCount = mockReports.filter(r => r.status === "pending").length;
  const assignedToMeCount = mockReports.filter(r => r.assignedTo && r.assignedTo.id === "mod-456").length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Reports & Issues</h2>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Flag className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Waiting for moderator review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned to Me</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedToMeCount}</div>
            <p className="text-xs text-muted-foreground">
              Currently under your review
            </p>
          </CardContent>
        </Card>
      </div>
      
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
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flag className="mr-2 h-5 w-5" />
                Reports List
              </CardTitle>
              <CardDescription>Reports and issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Reported Item</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
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
                            {report.reportedItemImage ? (
                              <div className="h-8 w-8 rounded bg-secondary overflow-hidden">
                                <img src={report.reportedItemImage} alt="" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded bg-secondary flex items-center justify-center">
                                {getReportTypeIcon(report.reportType)}
                              </div>
                            )}
                            <span className="truncate max-w-[150px]">{report.reportedItemTitle}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(report.status)}>
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {report.status === "pending" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex items-center gap-1"
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
                  ? `Report #${selectedReportDetails.id.slice(-3)} Details` 
                  : "Select a report to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedReportDetails ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Badge className="capitalize">{selectedReportDetails.reportType}</Badge>
                    <Badge variant={getStatusBadgeVariant(selectedReportDetails.status)}>
                      {selectedReportDetails.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Reported Item</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedReportDetails.reportedItemImage ? (
                        <div className="h-10 w-10 rounded bg-secondary overflow-hidden">
                          <img src={selectedReportDetails.reportedItemImage} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
                          {getReportTypeIcon(selectedReportDetails.reportType)}
                        </div>
                      )}
                      <div className="font-medium">{selectedReportDetails.reportedItemTitle}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Reported By</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedReportDetails.reporterAvatar} />
                        <AvatarFallback>{selectedReportDetails.reporterName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedReportDetails.reporterName}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Reported User</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedReportDetails.reportedUserAvatar} />
                        <AvatarFallback>{selectedReportDetails.reportedUserName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedReportDetails.reportedUserName}</div>
                      </div>
                    </div>
                  </div>
                  
                  {selectedReportDetails.assignedTo && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                      <p className="mt-1">{selectedReportDetails.assignedTo.name}</p>
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
                  
                  {selectedReportDetails.resolution && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Resolution</h4>
                      <p className="mt-1 text-sm">{selectedReportDetails.resolution}</p>
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
                        <CheckCircle className="mr-2 h-4 w-4" />
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

export default ModeratorReportsIssues;
