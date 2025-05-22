import { useState } from "react";
import { UserTable, User } from "@/components/admin_&_moderator/admin/UserTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["admin", "moderator", "user"]),
});

const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    joinDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "moderator",
    status: "active",
    joinDate: "2023-02-20",
  },
  {
    id: "3",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "user",
    status: "active",
    joinDate: "2023-03-10",
  },
  {
    id: "4",
    name: "Bob Williams",
    email: "bob@example.com",
    role: "user",
    status: "suspended",
    joinDate: "2023-04-05",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "user",
    status: "banned",
    joinDate: "2023-05-12",
  },
  {
    id: "6",
    name: "David Johnson",
    email: "david@example.com",
    role: "user",
    status: "active",
    joinDate: "2023-06-22",
  },
  {
    id: "7",
    name: "Eva Martinez",
    email: "eva@example.com",
    role: "moderator",
    status: "active",
    joinDate: "2023-07-14",
  },
  {
    id: "8",
    name: "Frank Miller",
    email: "frank@example.com",
    role: "user",
    status: "active",
    joinDate: "2023-08-30",
  },
];

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });

  const handleAddUser = (data: z.infer<typeof formSchema>) => {
    const newUser: User = {
      id: (users.length + 1).toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    toast.success("User added successfully");
    setOpen(false);
    form.reset();
  };

  const handlePromoteUser = (id: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          role: user.role === "moderator" ? "user" as const : "moderator" as const,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success("User role updated successfully");
  };

  const handleSuspendUser = (id: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: "suspended" as const,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success("User suspended successfully");
  };

  const handleBanUser = (id: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: "banned" as const,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success("User banned successfully");
  };

  const handleReinstateUser = (id: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return {
          ...user,
          status: "active" as const,
        };
      }
      return user;
    });
    setUsers(updatedUsers);
    toast.success("User reinstated successfully");
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    toast.success("User deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="text-xs text-muted-foreground">
            Manage users, roles, and permissions across the platform
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-xs">
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-sm">Add New User</DialogTitle>
              <DialogDescription className="text-xs">
                Create a new user account with specific roles and permissions.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Name</FormLabel>
                      <FormControl>
                        <Input className="text-xs" placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage className="text-2xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <Input className="text-xs" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage className="text-2xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Role</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                            <SelectItem value="moderator" className="text-xs">Moderator</SelectItem>
                            <SelectItem value="user" className="text-xs">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription className="text-2xs">
                        This determines what actions the user can take on the platform.
                      </FormDescription>
                      <FormMessage className="text-2xs" />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="text-xs" type="submit">
                    Add User
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable
            initialUsers={users}
            onPromoteUser={handlePromoteUser}
            onSuspendUser={handleSuspendUser}
            onBanUser={handleBanUser}
            onReinstateUser={handleReinstateUser}
            onDeleteUser={handleDeleteUser}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
