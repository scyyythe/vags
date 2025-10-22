import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { toast } from "sonner";
import useUserManagement, { useUserAction, ModUser } from "@/hooks/moderator/useUserManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";


const ModeratorUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ModUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ModUser["status"] | "all">("all");
  const [userNotes, setUserNotes] = useState("");

  // Fetch users from backend
  const { data: usersData, isLoading, error } = useUserManagement();
  const userActionMutation = useUserAction();

  // Handle error state
  if (error) {
    console.error("Failed to load users:", error);
  }

  const users = usersData?.users || [];

  const handleViewUser = (user: ModUser) => {
    setSelectedUser(user);
    setUserNotes(user.notes || "");
    setDialogOpen(true);
  };

  const handleWarnUser = (id: string) => {
    userActionMutation.mutate(
      {
        action: "warn",
        user_id: id,
        notes: userNotes || undefined
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to warn user", { closeButton: true });
        }
      }
    );
  };

  const handleMuteUser = (id: string) => {
    userActionMutation.mutate(
      {
        action: "mute",
        user_id: id,
        notes: userNotes || undefined
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to mute user", { closeButton: true });
        }
      }
    );
  };

  const handleSuspendUser = (id: string) => {
    userActionMutation.mutate(
      {
        action: "suspend",
        user_id: id,
        notes: userNotes || undefined
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to suspend user", { closeButton: true });
        }
      }
    );
  };

  const handleRestoreUser = (id: string) => {
    userActionMutation.mutate(
      {
        action: "restore",
        user_id: id,
        notes: userNotes || undefined
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to restore user", { closeButton: true });
        }
      }
    );
  };

  const handleSaveNotes = () => {
    if (selectedUser) {
      userActionMutation.mutate(
        {
          action: "update_notes",
          user_id: selectedUser.id,
          notes: userNotes
        },
        {
          onSuccess: (data) => {
            toast.success(data.message, { closeButton: true });
            setDialogOpen(false);
          },
          onError: () => {
            toast.error("Failed to update notes", { closeButton: true });
          }
        }
      );
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ModUser["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-[10px] px-1.5 py-0.5">Active</Badge>;
      case "warned":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-[10px] px-1.5 py-0.5">Warned</Badge>;
      case "muted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-[10px] px-1.5 py-0.5">Muted</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-[10px] px-1.5 py-0.5">Suspended</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-md font-bold">User Moderation</h1>
        <p className="text-[10px] text-muted-foreground">
          Monitor and manage user activity and enforce community guidelines
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-4 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-8 rounded-full h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{fontSize:"10px"}}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ModUser["status"] | "all")}
        >
          <SelectTrigger className="w-[180px] text-[10px] rounded-full h-8">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
            <SelectItem value="active" className="text-xs">Active</SelectItem>
            <SelectItem value="warned" className="text-xs">Warned</SelectItem>
            <SelectItem value="muted" className="text-xs">Muted</SelectItem>
            <SelectItem value="suspended" className="text-xs">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Users</CardTitle>
          <CardDescription className="text-[10px]">
            {statusFilter === "all" ? "All users" : `Users with ${statusFilter} status`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-[350px] overflow-auto">
              <table className="w-full table-fixed">
                <thead className="sticky top-0 bg-muted/50">
                  <tr>
                    <th className="w-[40%] text-left p-2 text-xs font-medium">User</th>
                    <th className="w-[15%] text-center p-2 text-xs font-medium">Status</th>
                    <th className="w-[10%] text-center p-2 text-xs font-medium">Reports</th>
                    <th className="w-[20%] text-center p-2 text-xs font-medium">Last Active</th>
                    <th className="w-[15%] text-right p-2 text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-t animate-pulse">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                          <div>
                            <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
                            <div className="h-2 bg-gray-300 rounded w-32"></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="h-5 bg-gray-300 rounded w-16 mx-auto"></div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="h-4 bg-gray-300 rounded w-8 mx-auto"></div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="h-3 bg-gray-300 rounded w-20 mx-auto"></div>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <div className="h-6 bg-gray-300 rounded w-12"></div>
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-xs">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[11px] truncate">{user.username}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(user.status)}
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <div className="text-xs">
                          {user.reportCount}
                          {user.reportCount > 5 && (
                            <span className="ml-1 text-[11px] text-red-600">(High)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-center text-[11px]">{user.lastActive}</td>
                      <td className="p-2 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() => handleViewUser(user)}
                          >
                            View
                          </Button>
                          {user.status === "active" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px]"
                              onClick={() => handleWarnUser(user.id)}
                              disabled={userActionMutation.isPending}
                            >
                              Warn
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px]"
                              onClick={() => handleRestoreUser(user.id)}
                              disabled={userActionMutation.isPending}
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-xs text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-sm">User Profile</DialogTitle>
            <DialogDescription className="text-[11px]">
              View and manage user details
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="text-[10px]">Overview</TabsTrigger>
                <TabsTrigger value="actions" className="text-[10px]">Actions</TabsTrigger>
                <TabsTrigger value="notes" className="text-[10px]">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-center space-x-4 pt-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback className="text-sm">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xs font-semibold">{selectedUser.username}</h3>
                    <p className="text-[11px] text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex items-center mt-1 space-x-2 text-[10px]">
                      {getStatusBadge(selectedUser.status)}
                      <span className="text-[10px]">
                        Member since {selectedUser.dateJoined}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-[11px] font-medium">Report Count</h4>
                    <p className="text-[11px]">
                      {selectedUser.reportCount}
                      {selectedUser.reportCount > 5 && (
                        <span className="ml-1 text-red-600">(High)</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-medium">Last Active</h4>
                    <p className="text-[11px]">{selectedUser.lastActive}</p>
                  </div>
                </div>

                {selectedUser.notes && (
                  <div>
                    <h4 className="text-[11px] font-medium">Moderator Notes</h4>
                    <p className="text-[10px] border p-2 rounded-md mt-1 bg-gray-50">
                      {selectedUser.notes}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium">Moderation Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleWarnUser(selectedUser.id)}
                      disabled={selectedUser.status === "warned" || userActionMutation.isPending}
                    >
                      Issue Warning
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleMuteUser(selectedUser.id)}
                      disabled={selectedUser.status === "muted" || userActionMutation.isPending}
                    >
                      Mute (24 Hours)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleSuspendUser(selectedUser.id)}
                      disabled={selectedUser.status === "suspended" || userActionMutation.isPending}
                    >
                      Suspend Account
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        toast.success("Report sent to admin", { closeButton: true });
                        setDialogOpen(false);
                      }}
                    >
                      Escalate to Admin
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium">Restore Actions</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => handleRestoreUser(selectedUser.id)}
                    disabled={selectedUser.status === "active" || userActionMutation.isPending}
                  >
                    Restore to Active Status
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4 pt-2">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium">Moderator Notes</h4>
                  <p className="text-3xs text-muted-foreground">
                    Add notes about this user for other moderators to see
                  </p>
                  <Textarea
                    className="w-full h-32 p-2 text-xs"
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    placeholder="Add notes about this user..."
                  />
                  <Button
                    size="sm"
                    className="text-xs"
                    onClick={handleSaveNotes}
                    disabled={userActionMutation.isPending}
                  >
                    Save Notes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModeratorUsers;

