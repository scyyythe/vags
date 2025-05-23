import { useState, useEffect } from "react";
import { StatCard } from "@/components/admin_&_moderator/admin/StatCard";
import { UserTable, User } from "@/components/admin_&_moderator/admin/UserTable";
import { SystemLogs, SystemLog } from "@/components/admin_&_moderator/admin/SystemLogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileCheck,
  Cog,
  Calendar,
  ArrowUp,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
];

const mockLogs: SystemLog[] = [
  {
    id: "1",
    timestamp: "2023-06-15 14:30:45",
    action: "User Login",
    performedBy: {
      id: "1",
      name: "John Doe",
      role: "admin",
    },
    details: "Admin user logged in from IP 192.168.1.1",
    severity: "info",
  },
  {
    id: "2",
    timestamp: "2023-06-15 15:20:18",
    action: "User Suspended",
    performedBy: {
      id: "2",
      name: "Jane Smith",
      role: "moderator",
    },
    details: "User ID: 456 suspended for violating community guidelines",
    severity: "warning",
  },
  {
    id: "3",
    timestamp: "2023-06-15 16:05:32",
    action: "Content Removed",
    performedBy: {
      id: "2",
      name: "Jane Smith",
      role: "moderator",
    },
    details: "Artwork ID: 789 removed for copyright infringement",
    severity: "warning",
  },
  {
    id: "4",
    timestamp: "2023-06-15 17:12:09",
    action: "System Error",
    performedBy: {
      id: "3",
      name: "System",
      role: "system",
    },
    details: "Database connection error during backup process",
    severity: "error",
  },
  {
    id: "5",
    timestamp: "2023-06-15 18:45:50",
    action: "Config Change",
    performedBy: {
      id: "1",
      name: "John Doe",
      role: "admin",
    },
    details: "Changed minimum bid increment from 5% to 10%",
    severity: "info",
  },
];

const activityData = [
  { date: "Mon", users: 4000, artworks: 2400, bids: 1200 },
  { date: "Tue", users: 3000, artworks: 1398, bids: 900 },
  { date: "Wed", users: 2000, artworks: 9800, bids: 1800 },
  { date: "Thu", users: 2780, artworks: 3908, bids: 2500 },
  { date: "Fri", users: 1890, artworks: 4800, bids: 3200 },
  { date: "Sat", users: 2390, artworks: 3800, bids: 2100 },
  { date: "Sun", users: 3490, artworks: 4300, bids: 1700 },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Ensure these handler functions actually modify state in a real app
  const handlePromoteUser = (id: string) => {
    toast.success("User role updated successfully");
  };

  const handleSuspendUser = (id: string) => {
    toast.success("User suspended successfully");
  };

  const handleBanUser = (id: string) => {
    toast.success("User banned successfully");
  };

  const handleReinstateUser = (id: string) => {
    toast.success("User reinstated successfully");
  };

  const handleDeleteUser = (id: string) => {
    toast.success("User deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-md font-bold">Admin Dashboard</h1>
        <p className="text-[10px] text-muted-foreground">
          Welcome to the admin dashboard. Manage your platform from here.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid sm:grid-cols-3">
          <TabsTrigger value="overview" className="text-[10px]">Overview</TabsTrigger>
          <TabsTrigger value="users" className="text-[10px]">User Management</TabsTrigger>
          <TabsTrigger value="logs" className="text-[10px]">System Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value="1,284"
              description="Active accounts on platform"
              icon={Users}
              trend={{ value: 12, positive: true }}
            />
            <StatCard
              title="Active Listings"
              value="457"
              description="Artworks currently for sale"
              icon={FileCheck}
              trend={{ value: 8, positive: true }}
            />
            <StatCard
              title="System Status"
              value="Healthy"
              description="All systems operational"
              icon={Cog}
            />
            <StatCard
              title="Sales Volume (7d)"
              value="$24,389"
              description="Total transaction value"
              icon={ArrowUp}
              trend={{ value: 5, positive: true }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Platform Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={activityData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 10 }} />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stackId="1"
                        stroke="#8884d8"
                        fill="#8884d8"
                      />
                      <Area
                        type="monotone"
                        dataKey="artworks"
                        stackId="1"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                      />
                      <Area
                        type="monotone"
                        dataKey="bids"
                        stackId="1"
                        stroke="#ffc658"
                        fill="#ffc658"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Recent System Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockLogs.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between items-start border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="text-xs font-medium">{log.action}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                          {log.details}
                        </p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {log.timestamp.split(" ")[1]}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <UserTable
                initialUsers={mockUsers}
                onPromoteUser={handlePromoteUser}
                onSuspendUser={handleSuspendUser}
                onBanUser={handleBanUser}
                onReinstateUser={handleReinstateUser}
                onDeleteUser={handleDeleteUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <SystemLogs logs={mockLogs} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
