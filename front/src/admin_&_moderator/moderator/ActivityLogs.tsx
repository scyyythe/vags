import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Download, Filter, List, Search } from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format, subDays } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Mock activity log data
const mockActivityLogs = [
  {
    id: "log-001",
    user: {
      id: "mod-001",
      name: "Moderator User",
      avatar: ""
    },
    action: "approved_artwork",
    targetType: "artwork",
    targetId: "art-123",
    targetName: "Urban Flow",
    details: "Approved artwork 'Urban Flow' by Emma Thompson",
    createdAt: new Date(Date.now() - 3600000 * 1), // 1 hour ago
  },
  {
    id: "log-002",
    user: {
      id: "mod-001",
      name: "Moderator User",
      avatar: ""
    },
    action: "resolved_report",
    targetType: "report",
    targetId: "rep-456",
    targetName: "Harassment Report",
    details: "Resolved report from John Smith about harassing comments",
    createdAt: new Date(Date.now() - 3600000 * 3), // 3 hours ago
  },
  {
    id: "log-003",
    user: {
      id: "mod-001",
      name: "Moderator User",
      avatar: ""
    },
    action: "rejected_artwork",
    targetType: "artwork",
    targetId: "art-789",
    targetName: "Explicit Content",
    details: "Rejected artwork submission due to explicit content policy violation",
    createdAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
  },
  {
    id: "log-004",
    user: {
      id: "mod-002",
      name: "Sarah Williams",
      avatar: ""
    },
    action: "warned_user",
    targetType: "user",
    targetId: "user-123",
    targetName: "James Wilson",
    details: "Issued warning to user for repeated policy violations",
    createdAt: new Date(Date.now() - 3600000 * 10), // 10 hours ago
  },
  {
    id: "log-005",
    user: {
      id: "mod-001",
      name: "Moderator User",
      avatar: ""
    },
    action: "assigned_report",
    targetType: "report",
    targetId: "rep-789",
    targetName: "Content Report",
    details: "Self-assigned report for review",
    createdAt: new Date(Date.now() - 3600000 * 24), // 1 day ago
  },
  {
    id: "log-006",
    user: {
      id: "mod-003",
      name: "Michael Chen",
      avatar: ""
    },
    action: "rejected_bid",
    targetType: "bid",
    targetId: "bid-456",
    targetName: "$3,500 bid on 'Urban Flow'",
    details: "Rejected suspicious bid from new account with no verification",
    createdAt: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
  },
  {
    id: "log-007",
    user: {
      id: "mod-001",
      name: "Moderator User",
      avatar: ""
    },
    action: "fixed_exhibition",
    targetType: "exhibition",
    targetId: "ex-123",
    targetName: "Digital Revolution",
    details: "Fixed navigation issue in Room 3 of the exhibition",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3), // 3 days ago
  },
  {
    id: "log-008",
    user: {
      id: "mod-002",
      name: "Sarah Williams",
      avatar: ""
    },
    action: "approved_artwork",
    targetType: "artwork",
    targetId: "art-234",
    targetName: "Mountain Sunrise",
    details: "Approved artwork 'Mountain Sunrise' by David Chen",
    createdAt: new Date(Date.now() - 3600000 * 24 * 4), // 4 days ago
  },
  {
    id: "log-009",
    user: {
      id: "mod-001",
      name: "Moderator User",
      avatar: ""
    },
    action: "removed_comment",
    targetType: "comment",
    targetId: "com-567",
    targetName: "Comment on 'Abstract Dreams'",
    details: "Removed comment containing hate speech",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5), // 5 days ago
  },
  {
    id: "log-010",
    user: {
      id: "mod-003",
      name: "Michael Chen",
      avatar: ""
    },
    action: "modified_content",
    targetType: "artwork",
    targetId: "art-345",
    targetName: "Urban Landscape",
    details: "Modified content warning level from none to moderate",
    createdAt: new Date(Date.now() - 3600000 * 24 * 6), // 6 days ago
  }
];

// Summary stats for moderator user's activity
const moderatorStats = {
  totalActions: 157,
  todayActions: 12,
  approvalRate: 78,
  averageResponseTime: "2.3 hours",
  commonActions: [
    { name: "Approved Artwork", count: 45 },
    { name: "Resolved Report", count: 32 },
    { name: "Rejected Content", count: 18 }
  ]
};

const ActivityLogs = () => {
  const [actionType, setActionType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedModeratorFilter, setSelectedModeratorFilter] = useState<string>("mine");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });

  // Filter logs based on selected criteria
  const filteredLogs = mockActivityLogs.filter(log => {
    // Filter by date range
    const createdDate = log.createdAt;
    const isInDateRange = (!date?.from || createdDate >= date.from) && 
                         (!date?.to || createdDate <= date.to);
    
    // Filter by action type
    const matchesAction = actionType === "all" || log.action === actionType;
    
    // Filter by search term
    const matchesSearch = searchTerm === "" ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by moderator
    const matchesModerator = selectedModeratorFilter === "all" || 
                           (selectedModeratorFilter === "mine" && log.user.id === "mod-001");
    
    return isInDateRange && matchesAction && matchesSearch && matchesModerator;
  });

  // Get the action name for display
  const getActionLabel = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get appropriate badge color for action type
  const getActionBadgeVariant = (action: string) => {
    if (action.includes("approved") || action.includes("resolved") || action.includes("fixed")) {
      return "default";
    } else if (action.includes("rejected") || action.includes("warned") || action.includes("removed")) {
      return "destructive";
    } else if (action.includes("assigned") || action.includes("modified")) {
      return "secondary";
    } else {
      return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Activity Logs</h2>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderatorStats.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              All time moderation activity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Actions</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderatorStats.todayActions}</div>
            <p className="text-xs text-muted-foreground">
              +3 from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderatorStats.approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              Content approval rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moderatorStats.averageResponseTime}</div>
            <p className="text-xs text-muted-foreground">
              Time to resolve issues
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="grid w-[180px] gap-1.5">
            <Select value={selectedModeratorFilter} onValueChange={setSelectedModeratorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by moderator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moderators</SelectItem>
                <SelectItem value="mine">My Activities</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-[180px] gap-1.5">
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="approved_artwork">Approved Artwork</SelectItem>
                <SelectItem value="rejected_artwork">Rejected Artwork</SelectItem>
                <SelectItem value="resolved_report">Resolved Report</SelectItem>
                <SelectItem value="assigned_report">Assigned Report</SelectItem>
                <SelectItem value="warned_user">Warned User</SelectItem>
                <SelectItem value="removed_comment">Removed Comment</SelectItem>
                <SelectItem value="rejected_bid">Rejected Bid</SelectItem>
                <SelectItem value="fixed_exhibition">Fixed Exhibition</SelectItem>
                <SelectItem value="modified_content">Modified Content</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DatePickerWithRange
            date={date}
            setDate={setDate}
            className="w-[280px]"
          />
        </div>
        
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search activity logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>Complete log of moderation activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Moderator</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={log.user.avatar} />
                            <AvatarFallback>{log.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {log.user.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="capitalize">{log.targetType}</span>{" "}
                          <span className="text-muted-foreground">{log.targetName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.details}
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-auto p-0 font-normal">
                              {format(log.createdAt, 'MMM d, yyyy')}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2" align="start">
                            <div className="text-sm">
                              {format(log.createdAt, 'MMMM d, yyyy h:mm a')}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No activity logs found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Most Common Actions</CardTitle>
          <CardDescription>Your frequently performed moderation activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moderatorStats.commonActions.map((action, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {action.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {action.count} times
                  </p>
                </div>
                <div
                  className="h-2 w-[100px]"
                  style={{
                    background: `linear-gradient(to right, 
                      var(--primary) ${(action.count / moderatorStats.commonActions[0].count) * 100}%, 
                      var(--muted) ${(action.count / moderatorStats.commonActions[0].count) * 100}%)`
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
