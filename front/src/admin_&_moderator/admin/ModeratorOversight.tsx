import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockUsers, mockActivityLogs } from "@/components/admin_&_moderator/data/mockData";
import { User, ActivityLog } from "@/components/admin_&_moderator/types";
import { ClipboardCheck, Eye, AlertTriangle, XCircle, CheckCircle, Shield } from "lucide-react";
import { toast } from "sonner";

const ModeratorOversight = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get moderators from mock data
  const moderators = mockUsers.filter(user => user.role === "moderator");
  
  // Filter activity logs to show only moderator actions
  const moderatorLogs = mockActivityLogs.filter(log => 
    moderators.some(mod => mod.id === log.user.id)
  );

  const handleToggleStatus = (userId: string, isActive: boolean) => {
    toast.success(`Moderator status ${isActive ? 'activated' : 'deactivated'}`);
  };

  const handleReassign = (userId: string) => {
    toast.success("Tasks reassigned successfully");
  };

  const handleSendWarning = (userId: string) => {
    toast.success("Warning sent to moderator");
  };

  // Custom performance metrics for moderators
  const moderatorPerformance = [
    {
      id: "2",
      name: "Moderator User",
      email: "mod@artgallery.com",
      artworksReviewed: 145,
      reportsHandled: 32,
      avgResponseTime: 4.5, // hours
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      performanceScore: 92,
      pendingTasks: 5,
    },
    {
      id: "mod-2",
      name: "Sarah Johnson",
      email: "sarah@artgallery.com",
      artworksReviewed: 98,
      reportsHandled: 45,
      avgResponseTime: 3.2, // hours
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      performanceScore: 89,
      pendingTasks: 8,
    },
    {
      id: "mod-3",
      name: "Michael Chen",
      email: "michael@artgallery.com",
      artworksReviewed: 215,
      reportsHandled: 27,
      avgResponseTime: 5.8, // hours
      lastActive: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      performanceScore: 94,
      pendingTasks: 3,
    },
  ];

  const getActionLabel = (action: string) => {
    switch (action) {
      case "approved_artwork":
        return "Approved Artwork";
      case "rejected_artwork":
        return "Rejected Artwork";
      case "resolved_report":
        return "Resolved Report";
      case "featured_artwork":
        return "Featured Artwork";
      case "rejected_bid":
        return "Rejected Bid";
      case "warned_user":
        return "Warned User";
      default:
        return action.replace(/_/g, " ");
    }
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("approved") || action.includes("resolved") || action.includes("featured")) {
      return "default";
    } else if (action.includes("rejected") || action.includes("warned") || action.includes("banned")) {
      return "destructive";
    } else {
      return "outline";
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Moderator Oversight</h2>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            Add New Moderator
          </Button>
        </div>
        
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search moderators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" type="submit">Search</Button>
        </div>
      </div>

      <Tabs defaultValue="moderators" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="moderators">Moderators</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="moderators">
          <Card>
            <CardHeader>
              <CardTitle>Moderator Management</CardTitle>
              <CardDescription>View and manage your moderator team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Moderator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderators.map((moderator) => (
                      <TableRow key={moderator.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={moderator.avatar} />
                              <AvatarFallback>{moderator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{moderator.name}</div>
                              <div className="text-sm text-muted-foreground">{moderator.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={moderator.isActive ? "default" : "outline"}>
                            {moderator.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {moderator.lastActive ? moderator.lastActive.toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          <Switch 
                            checked={moderator.isActive} 
                            onCheckedChange={(checked) => handleToggleStatus(moderator.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReassign(moderator.id)}
                            >
                              Reassign Tasks
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendWarning(moderator.id)}
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
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
        </TabsContent>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Moderator Performance</CardTitle>
              <CardDescription>Track productivity and response times</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Moderator</TableHead>
                      <TableHead>Artworks Reviewed</TableHead>
                      <TableHead>Reports Handled</TableHead>
                      <TableHead>Avg. Response Time</TableHead>
                      <TableHead>Performance Score</TableHead>
                      <TableHead>Pending Tasks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderatorPerformance.map((mod) => (
                      <TableRow key={mod.id}>
                        <TableCell>
                          <div className="font-medium">{mod.name}</div>
                          <div className="text-sm text-muted-foreground">{mod.email}</div>
                        </TableCell>
                        <TableCell>{mod.artworksReviewed}</TableCell>
                        <TableCell>{mod.reportsHandled}</TableCell>
                        <TableCell>{mod.avgResponseTime} hrs</TableCell>
                        <TableCell>
                          <div className={`font-medium ${getPerformanceColor(mod.performanceScore)}`}>
                            {mod.performanceScore}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={mod.pendingTasks > 5 ? "secondary" : "outline"}>
                            {mod.pendingTasks}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Moderator Activity Log</CardTitle>
              <CardDescription>Recent actions taken by moderators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Moderator</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {moderatorLogs.map((log) => (
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
                            {log.targetType}{" "}
                            <span className="text-muted-foreground">#{log.targetId.substring(0, 6)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{log.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModeratorOversight;
