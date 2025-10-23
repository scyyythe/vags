import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { User } from "@/hooks/users/useUserQuery";
import usePromoteUserMutation from "@/hooks/admin/actions/promote/usePromoteUserMutation";
import useDemoteUserMutation from "@/hooks/admin/actions/promote/useDemoteUserMutation";
import useSuspendUserMutation from "@/hooks/admin/actions/suspend/useSuspendUserMutation";
import useReinstateUserMutation from "@/hooks/admin/actions/suspend/useReinstateUserMutation";
import useBanUserMutation from "@/hooks/admin/actions/ban/useBanUserMutation";
import useUnbanUserMutation from "@/hooks/admin/actions/ban/useUnbanUserMutation";
interface UserTableProps {
  initialUsers: User[];
  onPromoteUser?: (id: string) => void;
  onSuspendUser?: (id: string) => void;
  onBanUser?: (id: string) => void;
  onReinstateUser?: (id: string) => void;
  onDeleteUser?: (id: string) => void;
}
export function UserTable({ initialUsers, onPromoteUser, onSuspendUser, onBanUser, onDeleteUser }: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const promoteUserMutation = usePromoteUserMutation();
  const demoteUserMutation = useDemoteUserMutation();
  const suspendUserMutation = useSuspendUserMutation();
  const banUserMutation = useBanUserMutation();
  const unbanUserMutation = useUnbanUserMutation();
  const reinstateUserMutation = useReinstateUserMutation();

  // Sync local state with parent data
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const promoteUser = (userId: string) => {
    // Optimistic update - immediately update UI
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === userId) {
          const newRole = user.role === "moderator" ? "user" : "moderator";
          return { ...user, role: newRole };
        }
        return user;
      })
    );

    promoteUserMutation.mutate(userId, {
      onSuccess: (updatedUser) => {
        // Update with actual server response
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === updatedUser.id ? { ...user, role: updatedUser.role } : user))
        );
        // Call parent handler for query invalidation
        onPromoteUser && onPromoteUser(updatedUser.id);
      },
      onError: (error) => {
        console.error("Failed to promote user:", error);
        // Revert optimistic update on error
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === userId) {
              const revertedRole = user.role === "moderator" ? "user" : "moderator";
              return { ...user, role: revertedRole };
            }
            return user;
          })
        );
      },
    });
  };
  const demoteUser = (userId: string) => {
    // Optimistic update - immediately update UI
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === userId) {
          const newRole = user.role === "moderator" ? "user" : "moderator";
          return { ...user, role: newRole };
        }
        return user;
      })
    );

    demoteUserMutation.mutate(userId, {
      onSuccess: (updatedUser) => {
        // Update with actual server response
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === updatedUser.id ? { ...user, role: updatedUser.role } : user))
        );
        // Call parent handler for query invalidation
        onPromoteUser && onPromoteUser(updatedUser.id);
      },
      onError: (error) => {
        console.error("Failed to demote user:", error);
        // Revert optimistic update on error
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            if (user.id === userId) {
              const revertedRole = user.role === "moderator" ? "user" : "moderator";
              return { ...user, role: revertedRole };
            }
            return user;
          })
        );
      },
    });
  };
  const suspendUser = (userId: string) => {
    // Optimistic update - immediately update UI
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, user_status: "Suspended" } : user))
    );

    const today = new Date();
    const end = new Date();
    end.setDate(today.getDate() + 3); // 3-day suspension

    suspendUserMutation.mutate({
      userId,
      start_date: today.toISOString(),
      end_date: end.toISOString(),
      reason: "Violation of community guidelines",
    }, {
      onSuccess: () => {
        // Call parent handler for query invalidation
        onSuspendUser && onSuspendUser(userId);
      },
      onError: (error) => {
        console.error("Failed to suspend user:", error);
        // Revert optimistic update on error
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, user_status: "Active" } : user))
        );
      },
    });
  };
  const ReinstateUser = (userId: string) => {
    // Optimistic update - immediately update UI
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, user_status: "Active" } : user))
    );

    reinstateUserMutation.mutate(userId, {
      onSuccess: (updatedUser) => {
        // Update with actual server response
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === updatedUser.id ? { ...user, user_status: updatedUser.user_status || "Active" } : user))
        );
        // Call parent handler for query invalidation
        onSuspendUser && onSuspendUser(updatedUser.id);
      },
      onError: (error) => {
        console.error("Failed to reinstate user:", error);
        // Revert optimistic update on error
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, user_status: "Suspended" } : user))
        );
      },
    });
  };
  const banUser = (userId: string) => {
    // Optimistic update - immediately update UI
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, user_status: "Banned" } : user))
    );

    banUserMutation.mutate(
      { userId, reason: "Violation", is_permanent: true },
      {
        onSuccess: (updatedUser) => {
          // Update with actual server response
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === updatedUser.id ? { ...user, user_status: updatedUser.user_status || "Banned" } : user
            )
          );
          // Call parent handler for query invalidation
          onBanUser && onBanUser(updatedUser.id);
        },
        onError: (error) => {
          console.error("Failed to ban user:", error);
          // Revert optimistic update on error
          setUsers((prevUsers) =>
            prevUsers.map((user) => (user.id === userId ? { ...user, user_status: "Active" } : user))
          );
        },
      }
    );
  };

  const unbanUser = (userId: string) => {
    // Optimistic update - immediately update UI
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, user_status: "Active" } : user))
    );

    unbanUserMutation.mutate(userId, {
      onSuccess: (updatedUser) => {
        // Update with actual server response
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === updatedUser.id ? { ...user, user_status: updatedUser.user_status || "Active" } : user
          )
        );
        // Call parent handler for query invalidation
        onBanUser && onBanUser(updatedUser.id);
      },
      onError: (error) => {
        console.error("Failed to unban user:", error);
        // Revert optimistic update on error
        setUsers((prevUsers) =>
          prevUsers.map((user) => (user.id === userId ? { ...user, user_status: "Banned" } : user))
        );
      },
    });
  };

  const deleteUser = (userId: string) => {
    // Optimistic update - immediately remove from UI
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    
    // Call parent handler for query invalidation
    onDeleteUser && onDeleteUser(userId);
  };

  const filteredUsers = users.filter((user) => {
    const firstName = user.first_name || "";
    const email = user.email || "";
    const query = searchQuery.toLowerCase();

    return firstName.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const formatDate = (isoDateString: string) => {
    const date = new Date(isoDateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: User["user_status"]) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-3xs">Active</Badge>;
      case "Suspended":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-3xs">Suspended</Badge>;
      case "Banned":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-3xs">Banned</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: User["role"]) => {
    if (!role) {
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-3xs">User</Badge>;
    }

    switch (role) {
      case "Admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-3xs">Admin</Badge>;
      case "Moderator":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-3xs">Moderator</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 text-3xs">User</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
        <Input
          placeholder="Search users..."
          className="pl-8 rounded-full h-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ fontSize: "10px" }}
        />
      </div>

      <div className="border rounded-md">
        {/* Fixed header (not scrollable) */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[11px]">User</TableHead>
              <TableHead className="text-[11px]">Role</TableHead>
              <TableHead className="text-[11px] text-center">Status</TableHead>
              <TableHead className="text-[11px]">Joined</TableHead>
              <TableHead className="text-[11px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        {/* Scrollable body only */}
        <div className="max-h-[350px] overflow-auto">
          <Table>
            <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-[11px]">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.profile_picture} />
                        <AvatarFallback className="text-2xs">
                          {`${user?.first_name?.charAt(0) ?? ""}${user?.last_name?.charAt(0) ?? ""}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{`${user?.first_name ?? ""} ${user?.last_name ?? ""}`}</div>

                        <div className="text-[10px] text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px]">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-[10px] text-center">{getStatusBadge(user.user_status)}</TableCell>
                  <TableCell className="text-[10px]">{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-[10px] text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel className="text-[11px]">User Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user.role !== "Admin" && (
                          <DropdownMenuItem
                            className="text-[10px]"
                            onClick={() => {
                              if (user.role === "Moderator") {
                                demoteUser(user.id);
                              } else {
                                promoteUser(user.id);
                              }
                            }}
                          >
                            {user.role === "Moderator" ? "Demote to User" : "Promote to Moderator"}
                          </DropdownMenuItem>
                        )}
                        {user.user_status === "Active" ? (
                          <DropdownMenuItem className="text-[10px]" onClick={() => suspendUser(user.id)}>
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-[10px]" onClick={() => ReinstateUser(user.id)}>
                            Reinstate User
                          </DropdownMenuItem>
                        )}
                        {user.user_status !== "Banned" ? (
                          <DropdownMenuItem className="text-[10px] text-red-500" onClick={() => banUser(user.id)}>
                            Ban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-[10px]" onClick={() => unbanUser(user.id)}>
                            Unban User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-[10px] text-red-500"
                          onClick={() => onDeleteUser && onDeleteUser(user.id)}
                        >
                          Delete Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
