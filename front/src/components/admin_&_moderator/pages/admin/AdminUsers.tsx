import { useState } from "react";
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
import usePromoteUserMutation from "@/hooks/admin/actions/promote/usePromoteUserMutation";
import useSuspendUserMutation from "@/hooks/admin/actions/suspend/useSuspendUserMutation";
import useBanUserMutation from "@/hooks/admin/actions/ban/useBanUserMutation";
import useReinstateUserMutation from "@/hooks/admin/actions/suspend/useReinstateUserMutation";
import useCreateUserMutation from "@/hooks/admin/actions/create/useCreateUserMutation";
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
  const [open, setOpen] = useState(false);

  // Mutation hooks for query invalidation
  const promoteUserMutation = usePromoteUserMutation();
  const suspendUserMutation = useSuspendUserMutation();
  const banUserMutation = useBanUserMutation();
  const reinstateUserMutation = useReinstateUserMutation();
  const createUserMutation = useCreateUserMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "admin",
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error || !users) return <p>Error loading user data</p>;
  const handleAddUser = (data: z.infer<typeof formSchema>) => {
    const fullName = data.name.trim();
    const nameParts = fullName.split(" ");

    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || "";

    createUserMutation.mutate({
      first_name,
      last_name,
      email: data.email,
      role: data.role,
    });

    setOpen(false);
    form.reset();
  };

  const handlePromoteUser = (id: string) => {
    // The UserTable component handles the actual mutation
    // This is just for additional query invalidation if needed
    console.log("User promoted:", id);
  };

  const handleSuspendUser = (id: string) => {
    // The UserTable component handles the actual mutation
    // This is just for additional query invalidation if needed
    console.log("User suspended:", id);
  };

  const handleBanUser = (id: string) => {
    // The UserTable component handles the actual mutation
    // This is just for additional query invalidation if needed
    console.log("User banned:", id);
  };

  const handleReinstateUser = (id: string) => {
    // The UserTable component handles the actual mutation
    // This is just for additional query invalidation if needed
    console.log("User reinstated:", id);
  };

  const handleDeleteUser = (id: string) => {
    // The UserTable component handles the actual mutation
    // This is just for additional query invalidation if needed
    console.log("User deleted:", id);
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
          <DialogContent className="sm:max-w-[425px] max-w-[425px] rounded-md">
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    size="sm" 
                    className="text-[11px] rounded-full h-8" 
                    type="submit"
                    disabled={createUserMutation.isPending}
                  >
                    {createUserMutation.isPending ? "Creating..." : "Add User"}
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
