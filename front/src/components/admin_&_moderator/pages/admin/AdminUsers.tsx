import { useState, useEffect } from "react";
import { UserTable } from "@/components/admin_&_moderator/admin/UserTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User } from "@/hooks/users/useUserQuery";
import useAllUsersQuery from "@/hooks/users/useAllUsersQuery";
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["admin", "moderator", "user"]),
});

const AdminUsers = () => {
  const { data: users, isLoading, error } = useAllUsersQuery();
  const [usersState, setUsersState] = useState<User[]>(users || []);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (users) {
      setUsersState(users);
    }
  }, [users]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
    },
  });
  if (isLoading) return <p>Loading...</p>;
  if (error || !users) return <p>Error loading user data</p>;
  const handleAddUser = (data: z.infer<typeof formSchema>) => {
    const fullName = data.name.trim();
    const nameParts = fullName.split(" ");

    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    const newUser: User = {
      id: (usersState.length + 1).toString(),
      first_name,
      last_name,
      email: data.email,
      role: data.role,
      user_status: "active",
      created_at: new Date().toISOString(),
      password: "",
    };

    setUsersState([...usersState, newUser]);
    toast.success("User added successfully");
    setOpen(false);
    form.reset();
  };

  const handlePromoteUser = (id: string) => {
    const updatedUsers = usersState.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          role: user.role === "moderator" ? ("user" as const) : ("moderator" as const),
        };
      }
      return user;
    });
    setUsersState(updatedUsers);
    toast.success("User role updated successfully");
  };

  const handleSuspendUser = (id: string) => {
    const updatedUsers = usersState.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          status: "suspended" as const,
        };
      }
      return user;
    });
    setUsersState(updatedUsers);
    toast.success("User suspended successfully");
  };

  const handleBanUser = (id: string) => {
    const updatedUsers = usersState.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          status: "banned" as const,
        };
      }
      return user;
    });
    setUsersState(updatedUsers);
    toast.success("User banned successfully");
  };

  const handleReinstateUser = (id: string) => {
    const updatedUsers = users.map((user) => {
      if (user.id === id) {
        return {
          ...user,
          status: "active" as const,
        };
      }
      return user;
    });
    setUsersState(updatedUsers);
    toast.success("User reinstated successfully");
  };

  const handleDeleteUser = (id: string) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsersState(updatedUsers);
    toast.success("User deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-md font-bold">User Management</h1>
          <p className="text-[10px] text-muted-foreground">Manage users, roles, and permissions across the platform</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="text-[9px] rounded-full h-7">
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-sm">Add New User</DialogTitle>
              <DialogDescription className="text-[10px]">
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
                        <Input
                          className="h-8 rounded-full"
                          placeholder="enter name"
                          {...field}
                          style={{ fontSize: "10px" }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
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
                        <Input
                          className="h-8 rounded-full"
                          placeholder="enter email"
                          {...field}
                          style={{ fontSize: "10px" }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="h-8 rounded-full" style={{ fontSize: "10px" }}>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin" className="text-[10px]">
                              Admin
                            </SelectItem>
                            <SelectItem value="moderator" className="text-[10px]">
                              Moderator
                            </SelectItem>
                            <SelectItem value="user" className="text-[10px]">
                              User
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription className="text-[10px]">
                        This determines what actions the user can take on the platform.
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} 
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[11px] rounded-full h-8"
                    onClick={() => setOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button size="sm" className="text-[11px] rounded-full h-8" type="submit">
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
