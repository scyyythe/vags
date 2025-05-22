import React from "react";
import { StatCards } from "@/components/admin_&_moderator/dashboard/StatCards";
import { DashboardCharts } from "@/components/admin_&_moderator/dashboard/DashboardCharts";
import { mockDashboardStats, mockUserActivityData, mockSalesData, mockReports, mockBids } from "@/components/admin_&_moderator/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Gavel, Eye, CheckCircle, XCircle } from "lucide-react";

const AdminDashboard = () => {
  return ( 
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold tracking-tight mb-6">Admin Dashboard</h2>
        <StatCards stats={mockDashboardStats} isAdmin={true} />
        <DashboardCharts userActivityData={mockUserActivityData} salesData={mockSalesData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm mb-1">Recent Reports</CardTitle>
              <CardDescription className="text-xs">Latest issues requiring attention</CardDescription>
            </div>
            <AlertTriangle className="h-4 w-4 text-gallery-red" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Priority</TableHead>
                  <TableHead className="text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-[10px]">
                {mockReports.slice(0, 5).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="capitalize text-[10px]">{report.reportType}</TableCell>
                    <TableCell>
                      <Badge className="text-[10px]" variant={
                        report.status === "pending" ? "outline" :
                        report.status === "investigating" ? "secondary" :
                        report.status === "resolved" ? "default" : "destructive"
                      }>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-[10px]" variant={
                        report.priority === "low" ? "outline" :
                        report.priority === "medium" ? "secondary" : "destructive"
                      }>
                        {report.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button className="flex">
                        <Eye className="h-3 w-3 mr-2 text-[10px]" /> <span className="relative bottom-1">View</span>
                      </button>
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
              <CardTitle className="text-sm mb-1">Recent Bids</CardTitle>
              <CardDescription className="text-xs">Latest bidding activity</CardDescription>
            </div>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Artwork</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-[10px]">
                {mockBids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>{bid.artwork.title}</TableCell>
                    <TableCell>${bid.amount}</TableCell>
                    <TableCell>
                      <Badge className="text-[9px]" variant={
                        bid.status === "pending" ? "outline" :
                        bid.status === "approved" ? "default" :
                        "destructive"
                      }>
                        {bid.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <button className="h-5 w-5 p-0">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        </button>
                        <button className="h-5 w-5 p-0">
                          <XCircle className="h-3 w-3 text-red-500" />
                        </button>
                        <button className="h-5 w-5 p-0">
                          <Eye className="h-3 w-3" />
                        </button>
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
