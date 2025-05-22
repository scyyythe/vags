import { useState } from "react";
import { StatCard } from "@/components/admin_&_moderator/admin/StatCard";
import { ReportTable, Report } from "@/components/admin_&_moderator/admin/ReportTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Bell,
  FileCheck,
  Search,
  Users,
  X,
} from "lucide-react";

const mockReports: Report[] = [
  {
    id: "1",
    reportType: "offensive",
    reportedId: "art12345",
    reportedType: "artwork",
    reportedBy: "user789",
    status: "pending",
    dateReported: "2023-06-15",
    description: "This artwork contains inappropriate content",
  },
  {
    id: "2",
    reportType: "fraud",
    reportedId: "user456",
    reportedType: "user",
    reportedBy: "user789",
    status: "investigating",
    dateReported: "2023-06-16",
    description: "This user is posting fake artwork for sale",
  },
  {
    id: "3",
    reportType: "spam",
    reportedId: "comment789",
    reportedType: "comment",
    reportedBy: "user123",
    status: "pending",
    dateReported: "2023-06-17",
    description: "This comment is spam and unrelated to the artwork",
  },
  {
    id: "4",
    reportType: "plagiarism",
    reportedId: "art56789",
    reportedType: "artwork",
    reportedBy: "user456",
    status: "resolved",
    dateReported: "2023-06-18",
    description: "This artwork is copied from another artist",
  },
  {
    id: "5",
    reportType: "other",
    reportedId: "bid12345",
    reportedType: "bid",
    reportedBy: "user789",
    status: "dismissed",
    dateReported: "2023-06-19",
    description: "Suspicious bidding behavior",
  },
];

const ModeratorDashboard = () => {
  const [reports, setReports] = useState<Report[]>(mockReports);

  const handleInvestigateReport = (id: string) => {
    const updatedReports = reports.map(report => {
      if (report.id === id) {
        return { ...report, status: "investigating" as const };
      }
      return report;
    });
    setReports(updatedReports);
    toast.success("Report marked as investigating");
  };

  const handleResolveReport = (id: string) => {
    const updatedReports = reports.map(report => {
      if (report.id === id) {
        return { ...report, status: "resolved" as const };
      }
      return report;
    });
    setReports(updatedReports);
    toast.success("Report marked as resolved");
  };

  const handleDismissReport = (id: string) => {
    const updatedReports = reports.map(report => {
      if (report.id === id) {
        return { ...report, status: "dismissed" as const };
      }
      return report;
    });
    setReports(updatedReports);
    toast.success("Report marked as dismissed");
  };

  const handleEscalateReport = (id: string) => {
    toast.success("Report escalated to admin");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Moderator Dashboard</h1>
        <p className="text-xs text-muted-foreground">
          Monitor reports, manage content, and maintain community standards
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid sm:grid-cols-3">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">Active Reports</TabsTrigger>
          <TabsTrigger value="content" className="text-xs">Flagged Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="stats-grid">
            <StatCard
              title="Pending Reports"
              value="24"
              description="Reports awaiting review"
              icon={FileCheck}
              trend={{ value: 4, positive: false }}
            />
            <StatCard
              title="Reports Resolved (7d)"
              value="58"
              description="Successfully handled reports"
              icon={Search}
              trend={{ value: 12, positive: true }}
            />
            <StatCard
              title="Users Warned"
              value="7"
              description="Users issued warnings this week"
              icon={Users}
              trend={{ value: 2, positive: false }}
            />
            <StatCard
              title="Removed Content"
              value="15"
              description="Items removed this week"
              icon={X}
              trend={{ value: 5, positive: false }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-2 bg-red-50 rounded-md">
                  <div className="mt-0.5">
                    <Bell className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium">High Priority: Copyright Strike</h4>
                    <p className="text-3xs text-muted-foreground">
                      Artwork ID art56789 reported for copyright infringement. Requires immediate review.
                    </p>
                    <p className="text-3xs text-gray-500 mt-1">30 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-2 bg-amber-50 rounded-md">
                  <div className="mt-0.5">
                    <Bell className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium">Suspicious User Activity</h4>
                    <p className="text-3xs text-muted-foreground">
                      User ID user456 has received multiple reports in the last 24 hours.
                    </p>
                    <p className="text-3xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-2 bg-blue-50 rounded-md">
                  <div className="mt-0.5">
                    <Bell className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium">New Escalated Report</h4>
                    <p className="text-3xs text-muted-foreground">
                      Admin has requested review of bid dispute on auction #8745.
                    </p>
                    <p className="text-3xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recently Resolved Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="text-xs font-medium">Content Removed: Artwork #2356</p>
                    <p className="text-3xs text-muted-foreground">
                      Removed for terms of service violation
                    </p>
                  </div>
                  <p className="text-3xs text-muted-foreground">Yesterday</p>
                </div>

                <div className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="text-xs font-medium">User Muted: @artlover556</p>
                    <p className="text-3xs text-muted-foreground">
                      24-hour mute for harassment in comments
                    </p>
                  </div>
                  <p className="text-3xs text-muted-foreground">2 days ago</p>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium">Dispute Resolved: Bid #8972</p>
                    <p className="text-3xs text-muted-foreground">
                      Mediated between buyer and seller
                    </p>
                  </div>
                  <p className="text-3xs text-muted-foreground">3 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Report Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportTable
                initialReports={reports}
                onInvestigateReport={handleInvestigateReport}
                onResolveReport={handleResolveReport}
                onDismissReport={handleDismissReport}
                onEscalateReport={handleEscalateReport}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Flagged Content Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">Flagged Artwork: "Dark Nebula"</h3>
                      <p className="text-xs text-muted-foreground">ID: art12345</p>
                      <div className="flex items-center mt-1">
                        <p className="text-3xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          Flagged: Inappropriate Content
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-2xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                        Approve
                      </button>
                      <button className="text-2xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
                        Remove
                      </button>
                      <button className="text-2xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                        Escalate
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-2xs font-medium">Report Description:</p>
                    <p className="text-3xs">
                      This artwork contains graphic content that violates community guidelines.
                      The imagery includes explicit violence that should not be allowed.
                    </p>
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">Flagged Comment</h3>
                      <p className="text-xs text-muted-foreground">On Artwork: "Sunset Dreams"</p>
                      <div className="flex items-center mt-1">
                        <p className="text-3xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          Flagged: Harassment
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-2xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                        Keep
                      </button>
                      <button className="text-2xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
                        Remove
                      </button>
                      <button className="text-2xs px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200">
                        Warn User
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-2xs font-medium">Comment Content:</p>
                    <p className="text-3xs">
                      "You are such a talentless hack. Your art is worthless garbage 
                      and you should be ashamed to call yourself an artist."
                    </p>
                    <p className="text-3xs mt-2 text-gray-500">
                      - Posted by user456 on June 17, 2023
                    </p>
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-medium">Flagged User Profile</h3>
                      <p className="text-xs text-muted-foreground">Username: @artmaster2000</p>
                      <div className="flex items-center mt-1">
                        <p className="text-3xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          Flagged: Impersonation
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-2xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                        Legitimate
                      </button>
                      <button className="text-2xs px-2 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200">
                        Suspend
                      </button>
                      <button className="text-2xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
                        Ban
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-2xs font-medium">Report Description:</p>
                    <p className="text-3xs">
                      This user is impersonating a famous artist and selling counterfeit works.
                      They have copied the bio and artwork style of @realartmaster and are misleading buyers.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModeratorDashboard;
