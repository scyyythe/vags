import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertTriangle, Eye, MessageSquare, Search, Users } from "lucide-react";
import { toast } from "sonner";

// Mock user activity data
const mockUsers = [
  {
    id: "user-001",
    name: "Emma Thompson",
    email: "emma@example.com",
    avatar: "",
    status: "active",
    joinDate: new Date(Date.now() - 3600000 * 24 * 30),
    lastActive: new Date(Date.now() - 3600000),
    activityLevel: "high",
    recentActivities: [
      { type: "comment", text: "Amazing use of color in this piece!", timestamp: new Date(Date.now() - 3600000 * 2) },
      { type: "bid", text: "Placed a $1,200 bid on 'Ocean Dreams'", timestamp: new Date(Date.now() - 3600000 * 5) },
      { type: "view", text: "Viewed 'Abstract Emotions' exhibition", timestamp: new Date(Date.now() - 3600000 * 8) }
    ],
    flags: []
  },
  {
    id: "user-002",
    name: "Michael Chen",
    email: "michael@example.com",
    avatar: "",
    status: "active",
    joinDate: new Date(Date.now() - 3600000 * 24 * 90),
    lastActive: new Date(Date.now() - 3600000 * 12),
    activityLevel: "medium",
    recentActivities: [
      { type: "favorite", text: "Added 'Sunset Boulevard' to favorites", timestamp: new Date(Date.now() - 3600000 * 12) },
      { type: "view", text: "Viewed artist profile of David Miller", timestamp: new Date(Date.now() - 3600000 * 24) },
      { type: "bid", text: "Placed a $800 bid on 'City Lights'", timestamp: new Date(Date.now() - 3600000 * 48) }
    ],
    flags: []
  },
  {
    id: "user-003",
    name: "Sophia Rodriguez",
    email: "sophia@example.com",
    avatar: "",
    status: "flagged",
    joinDate: new Date(Date.now() - 3600000 * 24 * 15),
    lastActive: new Date(Date.now() - 3600000 * 4),
    activityLevel: "high",
    recentActivities: [
      { type: "comment", text: "Posted potentially inappropriate comment on 'Human Form'", timestamp: new Date(Date.now() - 3600000 * 4) },
      { type: "bid", text: "Placed and canceled multiple bids on 'Geometric Patterns'", timestamp: new Date(Date.now() - 3600000 * 6) },
      { type: "message", text: "Sent message to artist Jane Adams", timestamp: new Date(Date.now() - 3600000 * 7) }
    ],
    flags: ["suspicious-bidding", "inappropriate-comments"]
  },
  {
    id: "user-004",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "",
    status: "inactive",
    joinDate: new Date(Date.now() - 3600000 * 24 * 120),
    lastActive: new Date(Date.now() - 3600000 * 24 * 30),
    activityLevel: "low",
    recentActivities: [
      { type: "login", text: "Logged in after 30 days", timestamp: new Date(Date.now() - 3600000 * 24 * 30) },
      { type: "view", text: "Viewed 'Classical Sculptures' collection", timestamp: new Date(Date.now() - 3600000 * 24 * 31) },
      { type: "favorite", text: "Added 'Marble Bust' to favorites", timestamp: new Date(Date.now() - 3600000 * 24 * 32) }
    ],
    flags: []
  },
  {
    id: "user-005",
    name: "Taylor Smith",
    email: "taylor@example.com",
    avatar: "",
    status: "active",
    joinDate: new Date(Date.now() - 3600000 * 24 * 45),
    lastActive: new Date(Date.now() - 3600000 * 1.5),
    activityLevel: "high",
    recentActivities: [
      { type: "purchase", text: "Purchased 'Autumn Leaves' for $3,500", timestamp: new Date(Date.now() - 3600000 * 1.5) },
      { type: "comment", text: "Left positive review for artist Mark Williams", timestamp: new Date(Date.now() - 3600000 * 10) },
      { type: "view", text: "Viewed 15 artworks in 'Modern Art' exhibition", timestamp: new Date(Date.now() - 3600000 * 20) }
    ],
    flags: []
  }
];

const UserActivity = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"recent" | "suspicious">("recent");

  const handleFlagUser = (userId: string) => {
    toast.success("User has been flagged for review");
  };

  const handleSendWarning = (userId: string) => {
    toast.success("Warning has been sent to user");
  };

  const handleContactUser = (userId: string) => {
    toast.success("Message interface opened");
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "comment": return <MessageSquare className="h-4 w-4" />;
      case "bid": return <Activity className="h-4 w-4" />;
      case "view": return <Eye className="h-4 w-4" />;
      case "favorite": return <Activity className="h-4 w-4" />;
      case "login": return <Activity className="h-4 w-4" />;
      case "purchase": return <Activity className="h-4 w-4" />;
      case "message": return <MessageSquare className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
    const matchesSearch = 
      searchTerm === "" || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    flagged: "bg-red-100 text-red-800"
  };

  const activityLevelColors: Record<string, string> = {
    high: "bg-blue-100 text-blue-800",
    medium: "bg-purple-100 text-purple-800",
    low: "bg-gray-100 text-gray-800"
  };

  const selectedUserDetails = selectedUser ? mockUsers.find(u => u.id === selectedUser) : null;

  // Get users with suspicious activity
  const usersWithFlags = mockUsers.filter(user => user.flags.length > 0);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">User Activity Monitoring</h2>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="users">User List</TabsTrigger>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Users</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Activity Overview
              </CardTitle>
              <CardDescription>Monitor user activity and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity Level</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className={selectedUser === user.id ? "bg-muted/50" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[user.status]}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={activityLevelColors[user.activityLevel]}>
                            {user.activityLevel.charAt(0).toUpperCase() + user.activityLevel.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastActive.toLocaleDateString()}</TableCell>
                        <TableCell>{user.joinDate.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleFlagUser(user.id)}
                              title="Flag User"
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleSendWarning(user.id)}
                              title="Send Warning"
                            >
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedUser(user.id)}
                              title="View Details"
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

        {/* Activity Feed Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Feed</CardTitle>
              <CardDescription>Latest user actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {mockUsers.flatMap(user => 
                  user.recentActivities.map((activity, idx) => (
                    <div key={`${user.id}-${idx}`} className="flex items-start gap-4">
                      <Avatar className="mt-1">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <div className="flex items-center text-sm">
                          <span className="mr-2">{getActivityIcon(activity.type)}</span>
                          <span>{activity.text}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ).sort((a, b) => {
                  // Sort by timestamp (most recent first)
                  const timeA = a.key.split('-')[2];
                  const timeB = b.key.split('-')[2];
                  return parseInt(timeB) - parseInt(timeA);
                }).slice(0, 10)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flagged Users Tab */}
        <TabsContent value="flagged">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Users</CardTitle>
              <CardDescription>Users that require moderator attention</CardDescription>
            </CardHeader>
            <CardContent>
              {usersWithFlags.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Flags</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersWithFlags.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.flags.map((flag) => (
                                <Badge key={flag} variant="outline" className="capitalize">
                                  {flag.replace(/-/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{user.joinDate.toLocaleDateString()}</TableCell>
                          <TableCell>{user.lastActive.toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSendWarning(user.id)}
                              >
                                Send Warning
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleContactUser(user.id)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center text-center border rounded-md">
                  <Users className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Flagged Users</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    There are currently no users that require attention
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Modal/Card */}
      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <Button 
              variant="ghost" 
              className="absolute right-2 top-2" 
              onClick={() => setSelectedUser(null)}
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent>
            {selectedUserDetails && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={selectedUserDetails.avatar} />
                    <AvatarFallback>{selectedUserDetails.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{selectedUserDetails.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedUserDetails.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <Badge className={`mt-1 ${statusColors[selectedUserDetails.status]}`}>
                      {selectedUserDetails.status.charAt(0).toUpperCase() + selectedUserDetails.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Activity Level</h4>
                    <Badge className={`mt-1 ${activityLevelColors[selectedUserDetails.activityLevel]}`}>
                      {selectedUserDetails.activityLevel.charAt(0).toUpperCase() + selectedUserDetails.activityLevel.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Join Date</h4>
                    <p>{selectedUserDetails.joinDate.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Last Active</h4>
                    <p>{selectedUserDetails.lastActive.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={viewMode === "recent" ? "default" : "outline"}
                        className="h-7 text-xs"
                        onClick={() => setViewMode("recent")}
                      >
                        Recent
                      </Button>
                      <Button 
                        size="sm" 
                        variant={viewMode === "suspicious" ? "default" : "outline"}
                        className="h-7 text-xs"
                        onClick={() => setViewMode("suspicious")}
                      >
                        Suspicious
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3 mt-2">
                    {selectedUserDetails.recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5">{getActivityIcon(activity.type)}</span>
                        <div>
                          <p>{activity.text}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedUserDetails.flags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Flags</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedUserDetails.flags.map((flag) => (
                        <Badge key={flag} variant="outline" className="capitalize">
                          {flag.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleContactUser(selectedUserDetails.id)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact User
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => handleSendWarning(selectedUserDetails.id)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Send Warning
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserActivity;
