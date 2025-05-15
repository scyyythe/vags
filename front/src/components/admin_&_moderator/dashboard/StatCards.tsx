import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Image, FileText, AlertTriangle, Calendar, Gavel, DollarSign, ShieldCheck } from "lucide-react";
import { DashboardStats } from "@/components/admin_&_moderator/types";

interface StatCardsProps {
  stats: DashboardStats;
  isAdmin: boolean;
}

export const StatCards = ({ stats, isAdmin }: StatCardsProps) => {
  const adminStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: `+${stats.newUsersToday} today`,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Total Artworks",
      value: stats.totalArtworks,
      description: `+${stats.newArtworksToday} today`,
      icon: <Image className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      description: "Requiring attention",
      icon: <AlertTriangle className="h-5 w-5 text-gallery-red" />,
    },
    {
      title: "Active Exhibitions",
      value: stats.activeExhibitions,
      description: "Currently running",
      icon: <Calendar className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Active Bids",
      value: stats.activeBids,
      description: "Pending & approved",
      icon: <Gavel className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Total Sales",
      value: `$${stats.totalSales.toLocaleString()}`,
      description: "Lifetime value",
      icon: <DollarSign className="h-5 w-5 text-gallery-teal" />,
    },
  ];

  const moderatorStats = [
    {
      title: "Pending Reports",
      value: stats.pendingReports,
      description: "Requiring attention",
      icon: <AlertTriangle className="h-5 w-5 text-gallery-red" />,
    },
    {
      title: "Active Bids",
      value: stats.activeBids,
      description: "Requiring review",
      icon: <Gavel className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "New Artworks",
      value: stats.newArtworksToday,
      description: "Pending review",
      icon: <Image className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Moderation Actions",
      value: "24",
      description: "Last 24 hours",
      icon: <ShieldCheck className="h-5 w-5 text-gallery-teal" />,
    },
  ];

  const statsToShow = isAdmin ? adminStats : moderatorStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {statsToShow.map((stat, index) => (
        <Card key={index} className="shadow-sm dashboard-stat-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stat.value}</div>
            <p className="text-[10px] text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
