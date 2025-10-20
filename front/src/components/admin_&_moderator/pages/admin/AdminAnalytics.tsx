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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [fullReportOpen, setFullReportOpen] = useState(false);
  
  const handleExport = (format: string) => {
    toast.success(`Report exported as ${format.toUpperCase()}`, {
      closeButton: true,
    });
  };

  const handleViewFullReport = () => {
    setFullReportOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-md font-bold">Analytics Dashboard</h1>
          <p className="text-[10px] text-muted-foreground">
            View comprehensive platform statistics and reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="7d" onValueChange={setTimeRange}>
            <SelectTrigger className="w-28 h-8 text-[10px] rounded-full">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h" className="text-[10px]">Last 24 Hours</SelectItem>
              <SelectItem value="7d" className="text-[10px]">Last 7 Days</SelectItem>
              <SelectItem value="30d" className="text-[10px]">Last 30 Days</SelectItem>
              <SelectItem value="90d" className="text-[10px]">Last 90 Days</SelectItem>
              <SelectItem value="1y" className="text-[10px]">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="csv">
            <SelectTrigger className="w-20 h-8 text-[10px] rounded-full">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv" className="text-[10px]" onSelect={() => handleExport("csv")}>CSV</SelectItem>
              <SelectItem value="pdf" className="text-[10px]" onSelect={() => handleExport("pdf")}>PDF</SelectItem>
              <SelectItem value="xlsx" className="text-[10px]" onSelect={() => handleExport("xlsx")}>Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">User Activity</CardTitle>
            <CardDescription className="text-[11px]">
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
            <CardDescription className="text-[11px]">
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
                  <Bar dataKey="sales" fill="#DC2626" radius={[20, 20, 0, 0]} />
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
            <CardDescription className="text-[11px]">
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
                    style={{fontSize:"10px"}}
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
            <CardDescription className="text-[11px]">
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
            <CardDescription className="text-[11px]">
              Summary of platform performance for {timeRange === "7d" ? "the last 7 days" : timeRange === "30d" ? "the last 30 days" : "the selected period"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="text-[10px] rounded-full h-8" onClick={handleViewFullReport}>
            View Full Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-sm font-bold">8,942</p>
              <p className="text-xs text-green-600">+12% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">New Artworks</p>
              <p className="text-sm font-bold">1,257</p>
              <p className="text-xs text-green-600">+8% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Sales</p>
              <p className="text-sm font-bold">$324,581</p>
              <p className="text-xs text-green-600">+15% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Platform Revenue</p>
              <p className="text-sm font-bold">$32,458</p>
              <p className="text-xs text-green-600">+15% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Bid Amount</p>
              <p className="text-sm font-bold">$428</p>
              <p className="text-xs text-red-600">-3% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Active Auctions</p>
              <p className="text-sm font-bold">432</p>
              <p className="text-xs text-green-600">+7% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Completed Auctions</p>
              <p className="text-sm font-bold">187</p>
              <p className="text-xs text-green-600">+5% vs. last period</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Time on Site</p>
              <p className="text-sm font-bold">12m 37s</p>
              <p className="text-xs text-green-600">+8% vs. last period</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={fullReportOpen} onOpenChange={setFullReportOpen}>
        <DialogContent className="sm:max-w-[70vw] max-h-[90vh] rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Full Analytics Report</DialogTitle>
            <DialogDescription className="text-[11px]">
              Comprehensive platform analytics for {timeRange === "7d" ? "the last 7 days" : timeRange === "30d" ? "the last 30 days" : "the selected period"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Detailed Key Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Detailed Key Performance Metrics</CardTitle>
                <CardDescription className="text-[10px]">
                  Comprehensive breakdown of platform performance for {timeRange === "7d" ? "the last 7 days" : timeRange === "30d" ? "the last 30 days" : "the selected period"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Total Users</p>
                    <p className="text-sm font-bold">8,942</p>
                    <p className="text-[10px] text-green-600">+12% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">New Artworks</p>
                    <p className="text-sm font-bold">1,257</p>
                    <p className="text-[10px] text-green-600">+8% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Total Sales</p>
                    <p className="text-sm font-bold">$324,581</p>
                    <p className="text-[10px] text-green-600">+15% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Platform Revenue</p>
                    <p className="text-sm font-bold">$32,458</p>
                    <p className="text-[10px] text-green-600">+15% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Avg. Bid Amount</p>
                    <p className="text-sm font-bold">$428</p>
                    <p className="text-[10px] text-red-600">-3% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Active Auctions</p>
                    <p className="text-sm font-bold">432</p>
                    <p className="text-[10px] text-green-600">+7% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Completed Auctions</p>
                    <p className="text-sm font-bold">187</p>
                    <p className="text-[10px] text-green-600">+5% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Avg. Time on Site</p>
                    <p className="text-sm font-bold">12m 37s</p>
                    <p className="text-[10px] text-green-600">+8% vs. last period</p>
                  </div>
                </div>

                {/* Additional Advanced Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">User Retention Rate</p>
                    <p className="text-sm font-bold text-green-600">78.5%</p>
                    <p className="text-[10px] text-green-600">+5.2% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Conversion Rate</p>
                    <p className="text-sm font-bold text-blue-600">12.3%</p>
                    <p className="text-[10px] text-green-600">+2.1% vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Average Session Duration</p>
                    <p className="text-sm font-bold text-purple-600">18m 42s</p>
                    <p className="text-[10px] text-green-600">+3.2m vs. last period</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] text-muted-foreground">Bounce Rate</p>
                    <p className="text-sm font-bold text-orange-600">24.8%</p>
                    <p className="text-[10px] text-red-600">+1.5% vs. last period</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geographic and Category Analysis */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xs">Geographic Distribution</CardTitle>
                  <CardDescription className="text-[10px]">
                    User activity by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px]">North America</span>
                      <span className="text-[11px] font-semibold">42.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px]">Europe</span>
                      <span className="text-[11px] font-semibold">31.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px]">Asia Pacific</span>
                      <span className="text-[11px] font-semibold">18.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px]">Other</span>
                      <span className="text-[11px] font-semibold">7.6%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xs">Top Performing Categories</CardTitle>
                  <CardDescription className="text-[10px]">
                    Highest revenue generating categories
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
                          style={{fontSize:"10px"}}
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
            </div>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xs">Export Report</CardTitle>
                <CardDescription className="text-[10px]">
                  Download this report in your preferred format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] rounded-full"
                    onClick={() => handleExport("pdf")}
                  >
                    Export as PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] rounded-full"
                    onClick={() => handleExport("csv")}
                  >
                    Export as CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] rounded-full"
                    onClick={() => handleExport("xlsx")}
                  >
                    Export as Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnalytics;
