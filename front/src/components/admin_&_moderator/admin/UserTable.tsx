import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "moderator" | "user";
  status: "active" | "suspended" | "banned";
  joinDate: string;
  avatar?: string;
};

interface UserTableProps {
  initialUsers: User[];
  onPromoteUser?: (id: string) => void;
  onSuspendUser?: (id: string) => void;
  onBanUser?: (id: string) => void;
  onReinstateUser?: (id: string) => void;
  onDeleteUser?: (id: string) => void;
}

export function UserTable({
  initialUsers,
  onPromoteUser,
  onSuspendUser,
  onBanUser,
  onReinstateUser,
  onDeleteUser,
}: UserTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-3xs">Active</Badge>;
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-3xs">Suspended</Badge>;
      case "banned":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-3xs">Banned</Badge>;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-3xs">Admin</Badge>;
      case "moderator":
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
          style={{fontSize:"10px"}}
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">User</TableHead>
              <TableHead className="text-xs">Role</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Joined</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-[11px]">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="text-2xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-[10px] text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px]">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-[10px]">{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-[10px]">{user.joinDate}</TableCell>
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
                        {user.role !== "admin" && (
                          <DropdownMenuItem 
                            className="text-[10px]"
                            onClick={() => onPromoteUser && onPromoteUser(user.id)}
                          >
                            {user.role === "moderator" ? "Demote to User" : "Promote to Moderator"}
                          </DropdownMenuItem>
                        )}
                        {user.status === "active" ? (
                          <DropdownMenuItem 
                            className="text-[10px]"
                            onClick={() => onSuspendUser && onSuspendUser(user.id)}
                          >
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-[10px]"
                            onClick={() => onReinstateUser && onReinstateUser(user.id)}
                          >
                            Reinstate User
                          </DropdownMenuItem>
                        )}
                        {user.status !== "banned" ? (
                          <DropdownMenuItem 
                            className="text-[10px] text-red-500"
                            onClick={() => onBanUser && onBanUser(user.id)}
                          >
                            Ban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-[10px]"
                            onClick={() => onReinstateUser && onReinstateUser(user.id)}
                          >
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
  );
}
