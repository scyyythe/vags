import React from "react";
import { StatCards } from "@/components/admin_&_moderator/dashboard/StatCards";
import { DashboardCharts } from "@/components/admin_&_moderator/dashboard/DashboardCharts";
import { mockDashboardStats, mockUserActivityData, mockSalesData, mockReports, mockBids } from "@/components/admin_&_moderator/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Gavel, Eye, CheckCircle, XCircle } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Admin Dashboard</h2>
        <StatCards stats={mockDashboardStats} isAdmin={true} />
        <DashboardCharts userActivityData={mockUserActivityData} salesData={mockSalesData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Latest issues requiring attention</CardDescription>
            </div>
            <AlertTriangle className="h-5 w-5 text-gallery-red" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.slice(0, 5).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="capitalize">{report.reportType}</TableCell>
                    <TableCell>
                      <Badge variant={
                        report.status === "pending" ? "outline" :
                        report.status === "investigating" ? "secondary" :
                        report.status === "resolved" ? "default" : "destructive"
                      }>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        report.priority === "low" ? "outline" :
                        report.priority === "medium" ? "secondary" : "destructive"
                      }>
                        {report.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Bids */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Recent Bids</CardTitle>
              <CardDescription>Latest bidding activity</CardDescription>
            </div>
            <Gavel className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artwork</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>{bid.artwork.title}</TableCell>
                    <TableCell>${bid.amount}</TableCell>
                    <TableCell>
                      <Badge variant={
                        bid.status === "pending" ? "outline" :
                        bid.status === "approved" ? "default" :
                        "destructive"
                      }>
                        {bid.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
