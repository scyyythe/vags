import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart } from "recharts";
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, Line } from "recharts";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, BarChart2, Download } from "lucide-react";
import { exportToCSV, formatDate } from "@/lib/utils";
import { toast } from "sonner";

// Mock visitor data for different time periods
const mockVisitorData = {
  daily: [
    { date: "May 1", visitors: 145, avgTimeSpent: 42, artworksViewed: 12 },
    { date: "May 2", visitors: 132, avgTimeSpent: 38, artworksViewed: 10 },
    { date: "May 3", visitors: 187, avgTimeSpent: 45, artworksViewed: 13 },
    { date: "May 4", visitors: 213, avgTimeSpent: 50, artworksViewed: 15 },
    { date: "May 5", visitors: 198, avgTimeSpent: 47, artworksViewed: 14 },
    { date: "May 6", visitors: 165, avgTimeSpent: 43, artworksViewed: 12 },
    { date: "May 7", visitors: 227, avgTimeSpent: 52, artworksViewed: 16 },
    { date: "May 8", visitors: 234, avgTimeSpent: 55, artworksViewed: 17 },
    { date: "May 9", visitors: 256, avgTimeSpent: 58, artworksViewed: 18 },
    { date: "May 10", visitors: 278, avgTimeSpent: 62, artworksViewed: 20 },
    { date: "May 11", visitors: 245, avgTimeSpent: 56, artworksViewed: 17 },
    { date: "May 12", visitors: 267, avgTimeSpent: 60, artworksViewed: 19 },
    { date: "May 13", visitors: 289, avgTimeSpent: 63, artworksViewed: 21 },
  ],
  weekly: [
    { week: "Week 1", visitors: 876, avgTimeSpent: 43, artworksViewed: 12 },
    { week: "Week 2", visitors: 1023, avgTimeSpent: 48, artworksViewed: 14 },
    { week: "Week 3", visitors: 1245, avgTimeSpent: 52, artworksViewed: 16 },
    { week: "Week 4", visitors: 1410, avgTimeSpent: 54, artworksViewed: 17 },
  ],
  monthly: [
    { month: "Jan", visitors: 3240, avgTimeSpent: 45, artworksViewed: 13 },
    { month: "Feb", visitors: 2980, avgTimeSpent: 42, artworksViewed: 12 },
    { month: "Mar", visitors: 3450, avgTimeSpent: 47, artworksViewed: 14 },
    { month: "Apr", visitors: 3890, avgTimeSpent: 49, artworksViewed: 15 },
    { month: "May", visitors: 4120, avgTimeSpent: 50, artworksViewed: 16 },
  ],
};

// Mock data for exhibition performance
const mockExhibitionPerformance = [
  {
    id: "ex1",
    name: "Contemporary Masters",
    status: "scheduled",
    totalVisitors: 0,
    averageRating: 0,
    mostViewedArtwork: "N/A",
    averageTimeSpent: 0,
  },
  {
    id: "ex2", 
    name: "Digital Revolution",
    status: "live",
    totalVisitors: 1254,
    averageRating: 4.7,
    mostViewedArtwork: "Digital Consciousness #5",
    averageTimeSpent: 48,
  },
  {
    id: "ex3",
    name: "Renaissance Revisited",
    status: "completed",
    totalVisitors: 4523,
    averageRating: 4.9,
    mostViewedArtwork: "The Modern Mona",
    averageTimeSpent: 65,
  },
  {
    id: "ex4",
    name: "Abstract Wonders",
    status: "scheduled",
    totalVisitors: 0,
    averageRating: 0,
    mostViewedArtwork: "N/A",
    averageTimeSpent: 0,
  },
  {
    id: "ex5",
    name: "Photography Masters",
    status: "completed",
    totalVisitors: 2187,
    averageRating: 4.5,
    mostViewedArtwork: "Urban Silence",
    averageTimeSpent: 52,
  },
];

// Mock room analytics
const mockRoomAnalytics = [
  {
    roomId: "room1",
    roomName: "The Grand Hall",
    exhibitionName: "Contemporary Masters",
    visitors: 2340,
    avgTimeSpent: 18,
    popularArtworks: ["Perspective Shift", "Urban Flow", "Metal Dreams"],
    engagementScore: 87,
  },
  {
    roomId: "room2",
    roomName: "Digital Dome",
    exhibitionName: "Digital Revolution",
    visitors: 1854,
    avgTimeSpent: 25,
    popularArtworks: ["Digital Consciousness #5", "Metaverse Portal", "Binary Emotions"],
    engagementScore: 92,
  },
  {
    roomId: "room3",
    roomName: "Renaissance Wing",
    exhibitionName: "Renaissance Revisited",
    visitors: 3102,
    avgTimeSpent: 22,
    popularArtworks: ["The Modern Mona", "Neoclassical Portrait #3", "Timeless Figures"],
    engagementScore: 89,
  },
  {
    roomId: "room4",
    roomName: "Abstract Corridor",
    exhibitionName: "Abstract Wonders",
    visitors: 0,
    avgTimeSpent: 0,
    popularArtworks: [],
    engagementScore: 0,
  },
  {
    roomId: "room5",
    roomName: "Photography Studio",
    exhibitionName: "Photography Masters",
    visitors: 1976,
    avgTimeSpent: 15,
    popularArtworks: ["Urban Silence", "Natural Frames", "Shadow Play"],
    engagementScore: 78,
  },
];

const ExhibitionAnalytics = () => {
  const [selectedExhibition, setSelectedExhibition] = useState<string>("all");
  const [timeScale, setTimeScale] = useState<"daily" | "weekly" | "monthly">("daily");
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  // Data to display based on selected time scale
  const visitorData = mockVisitorData[timeScale];
  
  // Handle export visitor data
  const handleExportVisitorData = () => {
    exportToCSV(visitorData, `visitor_analytics_${timeScale}.csv`);
    toast.success(`Visitor data exported successfully as ${timeScale} report`);
  };
  
  // Handle export exhibition performance
  const handleExportExhibitionPerformance = () => {
    exportToCSV(
      mockExhibitionPerformance.filter(ex => ex.status !== "scheduled"),
      'exhibition_performance.csv'
    );
    toast.success("Exhibition performance data exported successfully");
  };
  
  // Handle export room analytics
  const handleExportRoomAnalytics = () => {
    exportToCSV(
      mockRoomAnalytics.filter(room => room.visitors > 0),
      'room_analytics.csv'
    );
    toast.success("Room analytics data exported successfully");
  };
  
  // Apply date filter to visitor data
  const getFilteredVisitorData = () => {
    if (!date || !date.from) {
      return visitorData;
    }
    
    // This is a simplified example - in a real app, you'd filter based on actual dates
    // For this mock data, we'll just return the existing data
    return visitorData;
  };

  // Change chart data key based on time scale
  const getXAxisDataKey = () => {
    switch (timeScale) {
      case 'daily':
        return 'date';
      case 'weekly':
        return 'week';
      case 'monthly':
        return 'month';
      default:
        return 'date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Exhibition Analytics</h2>
        <div className="flex items-center gap-4">
          <div className="grid w-[180px] items-center gap-1.5">
            <Label htmlFor="exhibition">Exhibition</Label>
            <Select value={selectedExhibition} onValueChange={setSelectedExhibition}>
              <SelectTrigger id="exhibition">
                <SelectValue placeholder="All Exhibitions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exhibitions</SelectItem>
                {mockExhibitionPerformance.map(exhibition => (
                  <SelectItem key={exhibition.id} value={exhibition.id}>
                    {exhibition.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DatePickerWithRange 
            date={date} 
            setDate={setDate}
            className="w-[300px]"
          />
        </div>
      </div>

      {/* Visitor Analytics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Visitor Analytics</CardTitle>
            <CardDescription>Track visitor engagement over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={timeScale} onValueChange={(value) => setTimeScale(value as "daily" | "weekly" | "monthly")}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleExportVisitorData}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={visitorData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getXAxisDataKey()} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="visitors" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  name="Visitors"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgTimeSpent" 
                  stroke="#82ca9d" 
                  name="Avg. Time Spent (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Exhibition Performance Comparison */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Exhibition Performance</CardTitle>
            <CardDescription>Compare metrics across different exhibitions</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportExhibitionPerformance}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockExhibitionPerformance.filter(ex => ex.status !== "scheduled")}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalVisitors" name="Total Visitors" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="averageTimeSpent" name="Avg. Time (min)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Room Analytics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Virtual Room Performance</CardTitle>
            <CardDescription>Analytics for individual exhibition rooms</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExportRoomAnalytics}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 font-medium">
                  <th className="h-10 px-4 text-left">Room</th>
                  <th className="h-10 px-4 text-left">Exhibition</th>
                  <th className="h-10 px-4 text-right">Visitors</th>
                  <th className="h-10 px-4 text-right">Avg. Time</th>
                  <th className="h-10 px-4 text-center">Engagement</th>
                  <th className="h-10 px-4 text-center">Popular Artworks</th>
                </tr>
              </thead>
              <tbody>
                {mockRoomAnalytics
                  .filter(room => room.visitors > 0)
                  .map((room) => (
                  <tr key={room.roomId} className="border-b">
                    <td className="p-4 font-medium">{room.roomName}</td>
                    <td className="p-4 text-muted-foreground">{room.exhibitionName}</td>
                    <td className="p-4 text-right">{room.visitors.toLocaleString()}</td>
                    <td className="p-4 text-right">{room.avgTimeSpent} min</td>
                    <td className="p-4 text-center">
                      <Badge 
                        variant={room.engagementScore >= 90 ? "default" : 
                                room.engagementScore >= 80 ? "secondary" : "outline"}
                      >
                        {room.engagementScore}%
                      </Badge>
                    </td>
                    <td className="p-4 flex justify-center gap-1 flex-wrap">
                      {room.popularArtworks.map((artwork, idx) => (
                        <Badge key={idx} variant="outline">{artwork}</Badge>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExhibitionAnalytics;
