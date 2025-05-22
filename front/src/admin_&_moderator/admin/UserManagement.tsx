import React, { useState } from "react";
import { mockUsers } from "@/components/admin_&_moderator/data/mockData";
import { User } from "@/components/admin_&_moderator/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, UserCog, Flag, Ban, Eye, Search } from "lucide-react";
import { toast } from "sonner";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      filterRole === "all" || 
      user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  // User actions
  const activateUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: true } : user
    ));
    toast.success("User activated successfully");
  };

  const deactivateUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: false } : user
    ));
    toast.success("User deactivated successfully");
  };

  const banUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isBanned: true, isActive: false } : user
    ));
    toast.success("User banned successfully");
  };

  const unbanUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isBanned: false } : user
    ));
    toast.success("User unbanned successfully");
  };

  const promoteToModerator = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: "moderator" as const } : user
    ));
    toast.success("User promoted to moderator");
  };

  const demoteToUser = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: "user" as const } : user
    ));
    toast.success("Moderator demoted to user");
  };

  const viewUserDetails = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setSelectedUser(user);
      setDialogOpen(true);
    }
  };

  return (
    <div>
      <h2 className="text-sm font-semibold tracking-tight mb-1">User Management</h2>
      
      <div className="mb-6">
        <CardHeader>
          <div className="text-xs font-medium">Manage Users</div>
          <CardDescription className="text-[10px]">View and manage all user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8 rounded-full h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{fontSize: "10px"}}
              />
            </div>
            <Select 
              value={filterRole}
              onValueChange={setFilterRole}
            >
              <SelectTrigger className="w-full sm:w-[180px] rounded-full text-[10px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="z-50 absolute">
                <SelectGroup >
                  <SelectLabel className="text-[10px]">Roles</SelectLabel>
                  <SelectItem value="all" className="text-[10px]">All Roles</SelectItem>
                  <SelectItem value="admin" className="text-[10px]">Admin</SelectItem>
                  <SelectItem value="moderator" className="text-[10px]">Moderator</SelectItem>
                  <SelectItem value="user" className="text-[10px]">User</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div> 
                          <div className="font-medium text-[11px]">{user.name}</div>
                          <div className="text-[10px] text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge variant="destructive" className="text-[9px]">Banned</Badge>
                      ) : user.isActive ? (
                        <Badge variant="default" className="bg-green-500 text-[9px]">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px]">Inactive</Badge>
                      )}
                      {user.isFlagged && (
                        <Badge variant="outline" className="ml-2 text-[9px] bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Flagged
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-[9px]" variant={
                        user.role === "admin" ? "destructive" :
                        user.role === "moderator" ? "default" : "outline" 
                      }>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[10px]">{user.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!user.isActive && !user.isBanned && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-5 w-5 p-0"
                            onClick={() => activateUser(user.id)}
                            title="Activate User"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        
                        {user.isActive && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-5 w-5 p-0"
                            onClick={() => deactivateUser(user.id)}
                            title="Deactivate User"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        
                        {user.role !== "admin" && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-5 w-5 p-0"
                            onClick={() => user.role === "user" ? promoteToModerator(user.id) : demoteToUser(user.id)}
                            title={user.role === "user" ? "Promote to Moderator" : "Demote to User"}
                          >
                            <UserCog className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {user.isBanned ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-5 w-5 p-0"
                            onClick={() => unbanUser(user.id)}
                            title="Unban User"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        ) : (
                          user.role !== "admin" && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-5 w-5 p-0"
                              onClick={() => banUser(user.id)}
                              title="Ban User"
                            >
                              <Ban className="h-4 w-4 text-red-500" />
                            </Button>
                          )
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-5 w-5 p-0"
                          onClick={() => viewUserDetails(user.id)}
                          title="View User Details"
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
      </div>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about this user account.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                <AvatarFallback>{selectedUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <p>
                  {selectedUser.isBanned ? (
                    <Badge variant="destructive">Banned</Badge>
                  ) : selectedUser.isActive ? (
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Role</h4>
                <p>
                  <Badge variant={
                    selectedUser.role === "admin" ? "destructive" :
                    selectedUser.role === "moderator" ? "default" : "outline"
                  }>
                    {selectedUser.role}
                  </Badge>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Joined</h4>
                <p className="text-sm">{selectedUser.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Last Active</h4>
                <p className="text-sm">{selectedUser.lastActive?.toLocaleDateString() || "N/A"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Reported</h4>
                <p className="text-sm">{selectedUser.reportCount || 0} times</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Flagged</h4>
                <p className="text-sm">{selectedUser.isFlagged ? "Yes" : "No"}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;
