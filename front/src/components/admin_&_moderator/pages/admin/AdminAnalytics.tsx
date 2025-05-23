import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const userActivityData = [
  { name: "Jan", total: 1231 },
  { name: "Feb", total: 1542 },
  { name: "Mar", total: 1620 },
  { name: "Apr", total: 1798 },
  { name: "May", total: 2004 },
  { name: "Jun", total: 2366 },
  { name: "Jul", total: 2575 },
];

const salesData = [
  { name: "Jan", sales: 5000 },
  { name: "Feb", sales: 7800 },
  { name: "Mar", sales: 4200 },
  { name: "Apr", sales: 9800 },
  { name: "May", sales: 8100 },
  { name: "Jun", sales: 14500 },
  { name: "Jul", sales: 12300 },
];

const categoryData = [
  { name: "Digital Art", value: 400 },
  { name: "Photography", value: 300 },
  { name: "Traditional", value: 200 },
  { name: "Sculpture", value: 150 },
  { name: "Other", value: 100 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const deviceData = [
  { name: "Mobile", sessions: 4000, users: 2400 },
  { name: "Desktop", sessions: 3000, users: 1398 },
  { name: "Tablet", sessions: 2000, users: 800 },
];

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState("7d");
  
  const handleExport = (format: string) => {
    toast.success(`Report exported as ${format.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Analytics Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            View comprehensive platform statistics and reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="7d" onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h" className="text-xs">Last 24 Hours</SelectItem>
              <SelectItem value="7d" className="text-xs">Last 7 Days</SelectItem>
              <SelectItem value="30d" className="text-xs">Last 30 Days</SelectItem>
              <SelectItem value="90d" className="text-xs">Last 90 Days</SelectItem>
              <SelectItem value="1y" className="text-xs">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="csv">
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv" className="text-xs" onSelect={() => handleExport("csv")}>CSV</SelectItem>
              <SelectItem value="pdf" className="text-xs" onSelect={() => handleExport("pdf")}>PDF</SelectItem>
              <SelectItem value="xlsx" className="text-xs" onSelect={() => handleExport("xlsx")}>Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">User Activity</CardTitle>
            <CardDescription className="text-xs">
              Active users over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={userActivityData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#DC2626"
                    fill="#FECACA"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Sales Volume</CardTitle>
            <CardDescription className="text-xs">
              Total sales over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salesData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Bar dataKey="sales" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Content Categories</CardTitle>
            <CardDescription className="text-xs">
              Distribution of artwork by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Device Usage</CardTitle>
            <CardDescription className="text-xs">
              Platform visits by device type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={deviceData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="sessions" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm">Key Performance Metrics</CardTitle>
            <CardDescription className="text-xs">
              Summary of platform performance for {timeRange === "7d" ? "the last 7 days" : timeRange === "30d" ? "the last 30 days" : "the selected period"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="text-xs">
            View Full Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-2xs text-muted-foreground">Total Users</p>
              <p className="text-sm font-bold">8,942</p>
              <p className="text-3xs text-green-600">+12% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xs text-muted-foreground">New Artworks</p>
              <p className="text-sm font-bold">1,257</p>
              <p className="text-3xs text-green-600">+8% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xs text-muted-foreground">Total Sales</p>
              <p className="text-sm font-bold">$324,581</p>
              <p className="text-3xs text-green-600">+15% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xs text-muted-foreground">Platform Revenue</p>
              <p className="text-sm font-bold">$32,458</p>
              <p className="text-3xs text-green-600">+15% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xs text-muted-foreground">Avg. Bid Amount</p>
              <p className="text-sm font-bold">$428</p>
              <p className="text-3xs text-red-600">-3% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xs text-muted-foreground">Active Auctions</p>
              <p className="text-sm font-bold">432</p>
              <p className="text-3xs text-green-600">+7% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xs text-muted-foreground">Completed Auctions</p>
              <p className="text-sm font-bold">187</p>
              <p className="text-3xs text-green-600">+5% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xs text-muted-foreground">Avg. Time on Site</p>
              <p className="text-sm font-bold">12m 37s</p>
              <p className="text-3xs text-green-600">+8% vs. last period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
