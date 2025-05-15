import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface DashboardChartsProps {
  userActivityData: ChartData;
  salesData: ChartData;
}

export const DashboardCharts = ({ userActivityData, salesData }: DashboardChartsProps) => {
  // Transform chartData to recharts format
  const transformData = (chartData: ChartData) => {
    return chartData.labels.map((label, index) => {
      const dataPoint: { [key: string]: any } = {
        name: label,
      };
      
      chartData.datasets.forEach(dataset => {
        dataPoint[dataset.label] = dataset.data[index];
      });
      
      return dataPoint;
    });
  };

  const userActivityChartData = transformData(userActivityData);
  const salesChartData = transformData(salesData);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <CardDescription>New and active users over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userActivityChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(155, 135, 245, 0.8)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="rgba(155, 135, 245, 0.2)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(20, 184, 166, 0.8)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="rgba(20, 184, 166, 0.2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="New Users" 
                  stroke="rgba(155, 135, 245, 1)" 
                  fillOpacity={1} 
                  fill="url(#colorNewUsers)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Active Users" 
                  stroke="rgba(20, 184, 166, 1)" 
                  fillOpacity={1} 
                  fill="url(#colorActiveUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sales Analytics</CardTitle>
          <CardDescription>Revenue over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Sales ($)" fill="rgba(255, 87, 87, 0.8)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
