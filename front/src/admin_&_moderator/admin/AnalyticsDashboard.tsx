import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "recharts";
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line, Pie, Cell } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, DollarSign, Award, Eye, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";

// Mock analytics data
const mockUserAnalytics = {
  newUsers: [
    { date: "Jan", count: 42 },
    { date: "Feb", count: 63 },
    { date: "Mar", count: 54 },
    { date: "Apr", count: 78 },
    { date: "May", count: 95 },
    { date: "Jun", count: 108 },
  ],
  activeUsers: [
    { date: "Jan", count: 152 },
    { date: "Feb", count: 178 },
    { date: "Mar", count: 195 },
    { date: "Apr", count: 220 },
    { date: "May", count: 256 },
    { date: "Jun", count: 289 },
  ],
  userRetention: [
    { date: "Jan", rate: 68 },
    { date: "Feb", rate: 72 },
    { date: "Mar", rate: 75 },
    { date: "Apr", rate: 78 },
    { date: "May", rate: 82 },
    { date: "Jun", rate: 85 },
  ],
  userDevices: [
    { name: "Desktop", value: 65 },
    { name: "Mobile", value: 25 },
    { name: "Tablet", value: 10 },
  ],
  userGeography: [
    { country: "United States", users: 1432 },
    { country: "United Kingdom", users: 789 },
    { country: "Canada", users: 645 },
    { country: "Australia", users: 523 },
    { country: "Germany", users: 412 },
    { country: "France", users: 387 },
    { country: "Others", users: 978 },
  ],
};

const mockContentAnalytics = {
  artworkViews: [
    { date: "Jan", views: 3245 },
    { date: "Feb", views: 4122 },
    { date: "Mar", views: 5632 },
    { date: "Apr", views: 6821 },
    { date: "May", views: 7935 },
    { date: "Jun", views: 8456 },
  ],
  mostViewedArtworks: [
    { title: "Humanoid Sculpture", views: 1245, artist: "Angel Cornaro" },
    { title: "Digital Portrait", views: 1098, artist: "Jane Shaun" },
    { title: "Abstract Landscape", views: 876, artist: "Angel Cornaro" },
    { title: "Cloud Formation", views: 765, artist: "Jane Shaun" },
    { title: "Marble Hand", views: 654, artist: "Angel Cornaro" },
  ],
  categoryPopularity: [
    { name: "Digital", value: 32 },
    { name: "Sculpture", value: 28 },
    { name: "Painting", value: 20 },
    { name: "Photography", value: 15 },
    { name: "Mixed Media", value: 5 },
  ],
  engagementMetrics: [
    { date: "Jan", comments: 245, likes: 876 },
    { date: "Feb", comments: 287, likes: 945 },
    { date: "Mar", comments: 332, likes: 1102 },
    { date: "Apr", comments: 378, likes: 1265 },
    { date: "May", comments: 421, likes: 1542 },
    { date: "Jun", comments: 489, likes: 1823 },
  ],
};

const mockSalesAnalytics = {
  monthlySales: [
    { month: "Jan", revenue: 12450 },
    { month: "Feb", revenue: 15780 },
    { month: "Mar", revenue: 18650 },
    { month: "Apr", revenue: 22340 },
    { month: "May", revenue: 26780 },
    { month: "Jun", revenue: 32450 },
  ],
  topSellingArtworks: [
    { title: "Humanoid Sculpture", revenue: 5400, soldCount: 4 },
    { title: "Digital Portrait", revenue: 4500, soldCount: 3 },
    { title: "Abstract Landscape", revenue: 2850, soldCount: 3 },
    { title: "Cloud Formation", revenue: 2400, soldCount: 3 },
    { title: "Marble Hand", revenue: 2200, soldCount: 1 },
  ],
  salesByCategory: [
    { name: "Digital", value: 35 },
    { name: "Sculpture", value: 30 },
    { name: "Painting", value: 20 },
    { name: "Photography", value: 10 },
    { name: "Mixed Media", value: 5 },
  ],
  conversionRates: [
    { page: "Home Page", rate: 3.2 },
    { page: "Artist Profiles", rate: 4.5 },
    { page: "Featured Artworks", rate: 6.8 },
    { page: "Exhibition Pages", rate: 5.2 },
    { page: "Search Results", rate: 2.9 },
  ],
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Card with stat and change indicator component
const StatCard = ({ title, value, change, icon, changeDirection = "up" }: { 
  title: string, 
  value: string | number, 
  change: string, 
  icon: React.ReactNode,
  changeDirection?: "up" | "down" 
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="mt-4 flex items-center">
          {changeDirection === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={changeDirection === "up" ? "text-green-500" : "text-red-500"}>
            {change}
          </span>
          <span className="text-muted-foreground ml-1 text-xs">from last period</span>
        </div>
      </CardContent>
    </Card>
  );
};

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState<string>("30days");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const handleExportData = () => {
    // In a real application, this would generate a CSV or PDF report
    alert("Analytics data exported!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive performance metrics for your gallery
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="timeRange" className="whitespace-nowrap">Time Range:</Label>
            <Select 
              value={timeRange} 
              onValueChange={setTimeRange}
            >
              <SelectTrigger id="timeRange" className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {timeRange === "custom" && (
            <DatePickerWithRange
              date={date}
              setDate={setDate}
              className="w-[280px]"
            />
          )}
          
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Summary Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Users" 
          value="4,289" 
          change="+12.5%" 
          icon={<Users className="h-6 w-6 text-primary" />} 
        />
        <StatCard 
          title="Total Revenue" 
          value="$128,450" 
          change="+18.2%" 
          icon={<DollarSign className="h-6 w-6 text-primary" />} 
        />
        <StatCard 
          title="Total Artworks" 
          value="2,567" 
          change="+9.7%" 
          icon={<Award className="h-6 w-6 text-primary" />} 
        />
        <StatCard 
          title="Total Views" 
          value="357,892" 
          change="+24.3%" 
          icon={<Eye className="h-6 w-6 text-primary" />} 
        />
      </div>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="content">Content Analytics</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
        </TabsList>
        
        {/* User Analytics Tab */}
        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockUserAnalytics.newUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Monthly active users</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockUserAnalytics.activeUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#82ca9d" name="Active Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
                <CardDescription>Monthly retention rates (%)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockUserAnalytics.userRetention}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke="#ff7300" name="Retention Rate (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Devices</CardTitle>
                <CardDescription>Breakdown of user device types</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockUserAnalytics.userDevices}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockUserAnalytics.userDevices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>User Geography</CardTitle>
                <CardDescription>Users by country</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left font-medium">Country</th>
                        <th className="h-10 px-4 text-right font-medium">Users</th>
                        <th className="h-10 px-4 text-right font-medium">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUserAnalytics.userGeography.map((country, index) => {
                        const totalUsers = mockUserAnalytics.userGeography.reduce((sum, item) => sum + item.users, 0);
                        const percentage = ((country.users / totalUsers) * 100).toFixed(1);
                        
                        return (
                          <tr key={index} className="border-b">
                            <td className="p-4 font-medium">{country.country}</td>
                            <td className="p-4 text-right">{country.users.toLocaleString()}</td>
                            <td className="p-4 text-right">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Content Analytics Tab */}
        <TabsContent value="content">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Artwork Views</CardTitle>
                <CardDescription>Total artwork views over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockContentAnalytics.artworkViews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#8884d8" name="Views" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Category Popularity</CardTitle>
                <CardDescription>Artwork categories by popularity</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockContentAnalytics.categoryPopularity}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockContentAnalytics.categoryPopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>Comments and likes over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockContentAnalytics.engagementMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="comments" stroke="#8884d8" name="Comments" />
                    <Line type="monotone" dataKey="likes" stroke="#82ca9d" name="Likes" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Most Viewed Artworks</CardTitle>
                <CardDescription>Top performing artworks by views</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left font-medium">Artwork</th>
                        <th className="h-10 px-4 text-left font-medium">Artist</th>
                        <th className="h-10 px-4 text-right font-medium">Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockContentAnalytics.mostViewedArtworks.map((artwork, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-4 font-medium">{artwork.title}</td>
                          <td className="p-4">{artwork.artist}</td>
                          <td className="p-4 text-right">{artwork.views.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sales Analytics Tab */}
        <TabsContent value="sales">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Total sales revenue by month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSalesAnalytics.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockSalesAnalytics.salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockSalesAnalytics.salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
                <CardDescription>Purchase conversion by page (%)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockSalesAnalytics.conversionRates} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="page" type="category" width={150} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                    <Bar dataKey="rate" fill="#82ca9d" name="Conversion Rate (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Selling Artworks</CardTitle>
                <CardDescription>Best performing artworks by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-10 px-4 text-left font-medium">Artwork</th>
                        <th className="h-10 px-4 text-right font-medium">Units Sold</th>
                        <th className="h-10 px-4 text-right font-medium">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockSalesAnalytics.topSellingArtworks.map((artwork, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-4 font-medium">{artwork.title}</td>
                          <td className="p-4 text-right">{artwork.soldCount}</td>
                          <td className="p-4 text-right">${artwork.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" size="sm">
                  View Full Report
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
