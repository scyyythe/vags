import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MessageCircle, Check, AlertCircle, Calendar as CalendarIcon, Clock, Search, Eye } from "lucide-react";
import { toast } from "sonner";

// Mock exhibitions
const mockExhibitions = [
  {
    id: "ex-001",
    name: "Contemporary Masters",
    status: "live",
    startDate: new Date(Date.now() - 3600000 * 24 * 5), // 5 days ago
    endDate: new Date(Date.now() + 3600000 * 24 * 10), // 10 days from now
    roomCount: 3,
    artworkCount: 45,
    curator: {
      name: "Emma Thompson",
      avatar: ""
    },
    issues: 2,
    requiresAttention: true,
    visitorCount: 342
  },
  {
    id: "ex-002",
    name: "Digital Revolution",
    status: "upcoming",
    startDate: new Date(Date.now() + 3600000 * 24 * 3), // 3 days from now
    endDate: new Date(Date.now() + 3600000 * 24 * 18), // 18 days from now
    roomCount: 4,
    artworkCount: 52,
    curator: {
      name: "Michael Chen",
      avatar: ""
    },
    issues: 1,
    requiresAttention: true,
    visitorCount: 0
  },
  {
    id: "ex-003",
    name: "Renaissance Revisited",
    status: "completed",
    startDate: new Date(Date.now() - 3600000 * 24 * 30), // 30 days ago
    endDate: new Date(Date.now() - 3600000 * 24 * 15), // 15 days ago
    roomCount: 5,
    artworkCount: 78,
    curator: {
      name: "Sarah Johnson",
      avatar: ""
    },
    issues: 0,
    requiresAttention: false,
    visitorCount: 1245
  },
  {
    id: "ex-004",
    name: "Abstract Wonders",
    status: "upcoming",
    startDate: new Date(Date.now() + 3600000 * 24 * 15), // 15 days from now
    endDate: new Date(Date.now() + 3600000 * 24 * 30), // 30 days from now
    roomCount: 2,
    artworkCount: 30,
    curator: {
      name: "David Wilson",
      avatar: ""
    },
    issues: 0,
    requiresAttention: false,
    visitorCount: 0
  },
  {
    id: "ex-005",
    name: "Photography Masters",
    status: "live",
    startDate: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
    endDate: new Date(Date.now() + 3600000 * 24 * 12), // 12 days from now
    roomCount: 3,
    artworkCount: 65,
    curator: {
      name: "James Peterson",
      avatar: ""
    },
    issues: 3,
    requiresAttention: true,
    visitorCount: 187
  }
];

// Mock exhibition support issues
const mockIssues = [
  {
    id: "issue-001",
    exhibitionId: "ex-001",
    exhibitionName: "Contemporary Masters",
    type: "technical",
    title: "Room navigation broken",
    description: "Visitors report being unable to navigate from room 2 to room 3. The doorway interaction isn't working correctly.",
    reportedBy: {
      name: "Visitor User",
      avatar: ""
    },
    reportedAt: new Date(Date.now() - 3600000 * 12),
    status: "open",
    priority: "high",
    assignedTo: null
  },
  {
    id: "issue-002",
    exhibitionId: "ex-001",
    exhibitionName: "Contemporary Masters",
    type: "content",
    title: "Artwork description missing",
    description: "The description for 'Urban Flow' by artist Chen Wei is missing from the exhibition.",
    reportedBy: {
      name: "Chen Wei",
      avatar: ""
    },
    reportedAt: new Date(Date.now() - 3600000 * 24),
    status: "open",
    priority: "medium",
    assignedTo: null
  },
  {
    id: "issue-003",
    exhibitionId: "ex-005",
    exhibitionName: "Photography Masters",
    type: "technical",
    title: "Loading time excessive",
    description: "Multiple visitors have reported that the exhibition is taking over 30 seconds to load completely, especially in Room 2.",
    reportedBy: {
      name: "James Peterson",
      avatar: ""
    },
    reportedAt: new Date(Date.now() - 3600000 * 6),
    status: "investigating",
    priority: "high",
    assignedTo: {
      id: "mod-123",
      name: "Moderator User"
    }
  },
  {
    id: "issue-004",
    exhibitionId: "ex-002",
    exhibitionName: "Digital Revolution",
    type: "setup",
    title: "Wrong opening date",
    description: "The exhibition is showing the wrong opening date in promotional materials.",
    reportedBy: {
      name: "Michael Chen",
      avatar: ""
    },
    reportedAt: new Date(Date.now() - 3600000 * 48),
    status: "open",
    priority: "low",
    assignedTo: null
  },
  {
    id: "issue-005",
    exhibitionId: "ex-005",
    exhibitionName: "Photography Masters",
    type: "content",
    title: "Artwork displayed in wrong orientation",
    description: "My photograph 'Sunset Over Manhattan' is being displayed in landscape orientation when it should be portrait.",
    reportedBy: {
      name: "Lisa Johnson",
      avatar: ""
    },
    reportedAt: new Date(Date.now() - 3600000 * 10),
    status: "open",
    priority: "medium",
    assignedTo: null
  },
  {
    id: "issue-006",
    exhibitionId: "ex-005",
    exhibitionName: "Photography Masters",
    type: "technical",
    title: "Audio guide not working",
    description: "The audio guide feature is not working in any of the rooms in this exhibition.",
    reportedBy: {
      name: "Visitor User",
      avatar: ""
    },
    reportedAt: new Date(Date.now() - 3600000 * 5),
    status: "open",
    priority: "high",
    assignedTo: null
  }
];

const ExhibitionSupport = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedExhibition, setSelectedExhibition] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [issueResponse, setIssueResponse] = useState<string>("");

  const handleAssignIssue = (issueId: string) => {
    toast.success(`Issue #${issueId} assigned to you`);
  };

  const handleResolveIssue = (issueId: string) => {
    if (!issueResponse.trim() && selectedIssue) {
      toast.error("Please add a resolution comment");
      return;
    }
    toast.success(`Issue #${issueId} marked as resolved`);
    setSelectedIssue(null);
    setIssueResponse("");
  };

  const handleContactCurator = (exhibitionId: string) => {
    const exhibition = mockExhibitions.find(ex => ex.id === exhibitionId);
    if (exhibition) {
      toast.success(`Opening message to ${exhibition.curator.name}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "";
    }
  };

  const getIssueStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "open":
        return "outline";
      case "investigating":
        return "secondary";
      case "resolved":
        return "default";
      default:
        return "outline";
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

  const filteredExhibitions = mockExhibitions.filter(exhibition => {
    const matchesStatus = selectedStatus === "all" || exhibition.status === selectedStatus;
    const matchesSearch = 
      searchTerm === "" || 
      exhibition.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const exhibitionIssues = selectedExhibition 
    ? mockIssues.filter(issue => issue.exhibitionId === selectedExhibition)
    : mockIssues;

  const selectedExhibitionDetails = selectedExhibition 
    ? mockExhibitions.find(ex => ex.id === selectedExhibition)
    : null;

  const selectedIssueDetails = selectedIssue 
    ? mockIssues.find(issue => issue.id === selectedIssue)
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Exhibition Support</h2>
      
      <Tabs defaultValue="exhibitions" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
          <TabsTrigger value="issues">Support Issues</TabsTrigger>
        </TabsList>
        
        {/* Exhibitions Tab */}
        <TabsContent value="exhibitions">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="grid w-[180px] gap-1.5">
                <Label htmlFor="status">Exhibition Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search exhibitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="secondary" type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredExhibitions.map(exhibition => (
              <Card key={exhibition.id} className={exhibition.requiresAttention ? "border-red-300" : ""}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {exhibition.name}
                      {exhibition.requiresAttention && (
                        <AlertCircle size={16} className="text-red-500" />
                      )}
                    </CardTitle>
                    <Badge className={getStatusColor(exhibition.status)}>
                      {exhibition.status.charAt(0).toUpperCase() + exhibition.status.slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>
                    Curated by {exhibition.curator.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-1 h-4 w-4" />
                          <span>Start Date</span>
                        </div>
                        <span>{exhibition.startDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="mr-1 h-4 w-4" />
                          <span>End Date</span>
                        </div>
                        <span>{exhibition.endDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-xl font-bold">{exhibition.roomCount}</span>
                        <span className="text-xs text-muted-foreground">Rooms</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-xl font-bold">{exhibition.artworkCount}</span>
                        <span className="text-xs text-muted-foreground">Artworks</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-muted rounded-md">
                        <span className="text-xl font-bold">{exhibition.visitorCount}</span>
                        <span className="text-xs text-muted-foreground">Visitors</span>
                      </div>
                    </div>
                    
                    {exhibition.issues > 0 && (
                      <div className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-700">
                            {exhibition.issues} open issue{exhibition.issues > 1 ? 's' : ''}
                          </span>
                        </div>
                        {exhibition.requiresAttention && (
                          <Badge variant="outline" className="text-red-700 border-red-300">
                            Needs attention
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => handleContactCurator(exhibition.id)}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact Curator
                  </Button>
                  <Button 
                    variant={exhibition.issues > 0 ? "default" : "secondary"}
                    onClick={() => setSelectedExhibition(exhibition.id)}
                  >
                    View Issues
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Support Issues Tab */}
        <TabsContent value="issues">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Exhibition Issues
                    </CardTitle>
                    <CardDescription>
                      {selectedExhibitionDetails 
                        ? `Issues for ${selectedExhibitionDetails.name}` 
                        : "All exhibition support issues"}
                    </CardDescription>
                  </div>
                  {selectedExhibitionDetails && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedExhibition(null)}
                    >
                      View All Issues
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {exhibitionIssues.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Exhibition</TableHead>
                            <TableHead>Issue</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reported</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exhibitionIssues.map((issue) => (
                            <TableRow key={issue.id} className={selectedIssue === issue.id ? "bg-muted/50" : ""}>
                              <TableCell>{issue.exhibitionName}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{issue.title}</div>
                                  <div className="text-xs text-muted-foreground capitalize">{issue.type} issue</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getPriorityColor(issue.priority)}>
                                  {issue.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getIssueStatusBadgeVariant(issue.status)}>
                                  {issue.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{issue.reportedAt.toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {issue.status === "open" && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="flex items-center gap-1"
                                      onClick={() => handleAssignIssue(issue.id)}
                                    >
                                      Assign to Me
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    title="View Details"
                                    onClick={() => setSelectedIssue(issue.id)}
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
                  ) : (
                    <div className="flex h-[200px] flex-col items-center justify-center text-center">
                      <Check className="h-10 w-10 text-green-500" />
                      <h3 className="mt-4 text-lg font-medium">No Issues Found</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {selectedExhibitionDetails 
                          ? `${selectedExhibitionDetails.name} has no reported issues` 
                          : "There are currently no reported exhibition issues"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Issue Details</CardTitle>
                  <CardDescription>
                    {selectedIssueDetails 
                      ? `Issue #${selectedIssueDetails.id.slice(-3)} Details` 
                      : "Select an issue to view details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedIssueDetails ? (
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <Badge className="capitalize">
                          {selectedIssueDetails.type} issue
                        </Badge>
                        <Badge variant={getIssueStatusBadgeVariant(selectedIssueDetails.status)}>
                          {selectedIssueDetails.status}
                        </Badge>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">{selectedIssueDetails.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Exhibition: {selectedIssueDetails.exhibitionName}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                        <p className="mt-1 text-sm p-3 bg-muted rounded-md">
                          {selectedIssueDetails.description}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Reported By</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedIssueDetails.reportedBy.avatar} />
                            <AvatarFallback>{selectedIssueDetails.reportedBy.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{selectedIssueDetails.reportedBy.name}</div>
                        </div>
                      </div>
                      
                      {selectedIssueDetails.assignedTo && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Assigned To</h4>
                          <p className="mt-1">{selectedIssueDetails.assignedTo.name}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Reported On</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedIssueDetails.reportedAt.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Priority</h4>
                        <Badge className={`mt-1 ${getPriorityColor(selectedIssueDetails.priority)}`}>
                          {selectedIssueDetails.priority.charAt(0).toUpperCase() + selectedIssueDetails.priority.slice(1)}
                        </Badge>
                      </div>
                      
                      {selectedIssueDetails.status !== "resolved" && (
                        <div className="space-y-2 pt-4">
                          <Label htmlFor="resolution">Resolution Response</Label>
                          <Textarea 
                            id="resolution" 
                            placeholder="Add details about how the issue was resolved..."
                            value={issueResponse}
                            onChange={(e) => setIssueResponse(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {selectedIssueDetails.status === "open" && !selectedIssueDetails.assignedTo && (
                              <Button 
                                variant="outline"
                                className="w-full" 
                                onClick={() => handleAssignIssue(selectedIssueDetails.id)}
                              >
                                Assign to Me
                              </Button>
                            )}
                            <Button 
                              className={selectedIssueDetails.status === "open" && !selectedIssueDetails.assignedTo ? "w-full" : "col-span-2"} 
                              onClick={() => handleResolveIssue(selectedIssueDetails.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Mark as Resolved
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-[300px] flex-col items-center justify-center text-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No Issue Selected</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Select an issue from the list to view its details
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExhibitionSupport;
