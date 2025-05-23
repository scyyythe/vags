import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { toast } from "sonner";
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

interface ModUser {
  id: string;
  username: string;
  email: string;
  dateJoined: string;
  status: "active" | "warned" | "muted" | "suspended";
  reportCount: number;
  lastActive: string;
  avatar?: string;
  notes?: string;
}

const mockUsers: ModUser[] = [
  {
    id: "user123",
    username: "artmaster2000",
    email: "artmaster@example.com",
    dateJoined: "2023-01-15",
    status: "warned",
    reportCount: 4,
    lastActive: "2023-06-20",
    notes: "Has received multiple warnings for inappropriate comments",
  },
  {
    id: "user456",
    username: "creativemind",
    email: "creative@example.com",
    dateJoined: "2023-02-10",
    status: "muted",
    reportCount: 7,
    lastActive: "2023-06-18",
    notes: "Muted for 48 hours due to harassing behavior in comments",
  },
  {
    id: "user789",
    username: "digitalartist",
    email: "digital@example.com",
    dateJoined: "2023-03-05",
    status: "active",
    reportCount: 1,
    lastActive: "2023-06-22",
  },
  {
    id: "user101",
    username: "sculpturpro",
    email: "sculptor@example.com",
    dateJoined: "2023-04-12",
    status: "active",
    reportCount: 0,
    lastActive: "2023-06-21",
  },
  {
    id: "user202",
    username: "paintingexpert",
    email: "painter@example.com",
    dateJoined: "2023-05-20",
    status: "suspended",
    reportCount: 12,
    lastActive: "2023-06-15",
    notes: "Suspended for plagiarizing multiple artworks",
  },
];

const ModeratorUsers = () => {
  const [users, setUsers] = useState<ModUser[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<ModUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ModUser["status"] | "all">("all");
  const [userNotes, setUserNotes] = useState("");

  const handleViewUser = (user: ModUser) => {
    setSelectedUser(user);
    setUserNotes(user.notes || "");
    setDialogOpen(true);
  };

  const handleWarnUser = (id: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return { ...user, status: "warned" as const };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success("Warning issued to user");
  };

  const handleMuteUser = (id: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return { ...user, status: "muted" as const };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success("User muted for 24 hours");
  };

  const handleSuspendUser = (id: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return { ...user, status: "suspended" as const };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success("User suspended");
  };

  const handleRestoreUser = (id: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return { ...user, status: "active" as const };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success("User restored to active status");
  };

  const handleSaveNotes = () => {
    if (selectedUser) {
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, notes: userNotes };
        }
        return user;
      });
      setUsers(updatedUsers);
      toast.success("User notes updated");
      setDialogOpen(false);
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
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-3xs">Active</Badge>;
      case "warned":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-3xs">Warned</Badge>;
      case "muted":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-3xs">Muted</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-3xs">Suspended</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">User Moderation</h1>
        <p className="text-xs text-muted-foreground">
          Monitor and manage user activity and enforce community guidelines
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users..."
            className="pl-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as ModUser["status"] | "all")}
        >
          <SelectTrigger className="w-[180px] text-xs">
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
          <CardDescription className="text-xs">
            {statusFilter === "all" ? "All users" : `Users with ${statusFilter} status`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 text-xs font-medium">User</th>
                  <th className="text-left p-2 text-xs font-medium">Status</th>
                  <th className="text-left p-2 text-xs font-medium">Reports</th>
                  <th className="text-left p-2 text-xs font-medium">Last Active</th>
                  <th className="text-right p-2 text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="text-2xs">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-xs">{user.username}</div>
                            <div className="text-3xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{getStatusBadge(user.status)}</td>
                      <td className="p-2">
                        <div className="text-xs">
                          {user.reportCount}
                          {user.reportCount > 5 && (
                            <span className="ml-1 text-3xs text-red-600">(High)</span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-xs">{user.lastActive}</td>
                      <td className="p-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleViewUser(user)}
                        >
                          View
                        </Button>
                        {user.status === "active" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleWarnUser(user.id)}
                          >
                            Warn
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleRestoreUser(user.id)}
                          >
                            Restore
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-sm text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-sm">User Profile</DialogTitle>
            <DialogDescription className="text-xs">
              View and manage user details
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="actions" className="text-xs">Actions</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="flex items-center space-x-4 pt-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedUser.avatar} />
                    <AvatarFallback className="text-lg">
                      {selectedUser.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-semibold">{selectedUser.username}</h3>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      {getStatusBadge(selectedUser.status)}
                      <span className="text-3xs">
                        Member since {selectedUser.dateJoined}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium">Report Count</h4>
                    <p className="text-2xs">
                      {selectedUser.reportCount}
                      {selectedUser.reportCount > 5 && (
                        <span className="ml-1 text-red-600">(High)</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium">Last Active</h4>
                    <p className="text-2xs">{selectedUser.lastActive}</p>
                  </div>
                </div>

                {selectedUser.notes && (
                  <div>
                    <h4 className="text-xs font-medium">Moderator Notes</h4>
                    <p className="text-2xs border p-2 rounded-md mt-1 bg-gray-50">
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
                      disabled={selectedUser.status === "warned"}
                    >
                      Issue Warning
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleMuteUser(selectedUser.id)}
                      disabled={selectedUser.status === "muted"}
                    >
                      Mute (24 Hours)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleSuspendUser(selectedUser.id)}
                      disabled={selectedUser.status === "suspended"}
                    >
                      Suspend Account
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => {
                        toast.success("Report sent to admin");
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
                    disabled={selectedUser.status === "active"}
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
