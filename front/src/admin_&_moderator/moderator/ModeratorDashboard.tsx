import React from "react";
import { StatCards } from "@/components/admin_&_moderator/dashboard/StatCards";
import { mockDashboardStats, mockReports, mockArtworks } from "@/components/admin_&_moderator/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, CheckCircle, XCircle, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const ModeratorDashboard = () => {
  const pendingReports = mockReports.filter(report => report.status === "pending");
  const pendingArtworks = mockArtworks.filter(artwork => !artwork.isApproved);

  const handleApproveArtwork = (id: string) => {
    toast.success("Artwork has been approved");
  };

  const handleRejectArtwork = (id: string) => {
    toast.success("Artwork has been rejected");
  };

  const handleAssignReport = (id: string) => {
    toast.success("Report has been assigned to you");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-6">Moderator Dashboard</h2>
        <StatCards stats={mockDashboardStats} isAdmin={false} />
      </div>

      <Tabs defaultValue="pending-review" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
          <TabsTrigger value="pending-review">Pending Review</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Pending Review Tab */}
        <TabsContent value="pending-review">
          <Card>
            <CardHeader>
              <CardTitle>Artworks Pending Review</CardTitle>
              <CardDescription>Artworks requiring moderator approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingArtworks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No artworks pending review</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Artwork</TableHead>
                        <TableHead>Artist</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingArtworks.map((artwork) => (
                        <TableRow key={artwork.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded bg-secondary overflow-hidden">
                                <img src={artwork.imageUrl} alt={artwork.title} className="h-full w-full object-cover" />
                              </div>
                              <span className="font-medium">{artwork.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={artwork.artist.avatar} alt={artwork.artist.name} />
                                <AvatarFallback>{artwork.artist.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {artwork.artist.name}
                            </div>
                          </TableCell>
                          <TableCell>{artwork.createdAt.toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleApproveArtwork(artwork.id)}
                                title="Approve Artwork"
                              >
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleRejectArtwork(artwork.id)}
                                title="Reject Artwork"
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Pending Reports</CardTitle>
              <CardDescription>User reports requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReports.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No pending reports</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="capitalize">{report.reportType}</TableCell>
                          <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                          <TableCell>
                            <Badge variant={
                              report.priority === "low" ? "outline" :
                              report.priority === "medium" ? "secondary" : "destructive"
                            }>
                              {report.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => handleAssignReport(report.id)}
                              >
                                Assign to Me
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Activity</CardTitle>
              <CardDescription>Last 7 days of moderation actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>Approved Artwork</TableCell>
                      <TableCell>"Humanoid Sculpture" by Angel Cornaro</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{new Date(Date.now() - 86400000).toLocaleDateString()}</TableCell>
                      <TableCell>Resolved Report</TableCell>
                      <TableCell>Comment report #438 marked as resolved</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{new Date(Date.now() - 86400000 * 2).toLocaleDateString()}</TableCell>
                      <TableCell>Rejected Bid</TableCell>
                      <TableCell>$2,500 bid on "Marble Hand" rejected (suspicious activity)</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModeratorDashboard;
