import { useState } from "react";
import { StatCard } from "@/components/admin_&_moderator/admin/StatCard";
import { ReportTable, Report } from "@/components/admin_&_moderator/admin/ReportTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import useModeratorOverview from "@/hooks/moderator/useModeratorOverview";
import useFlaggedContent from "@/hooks/moderator/useFlaggedContent";
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
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useModeratorOverview();
  const { data: flaggedContentData, isLoading: flaggedContentLoading, error: flaggedContentError } = useFlaggedContent();

  // Handle error state
  if (overviewError) {
    console.error("Failed to load moderator overview:", overviewError);
  }
  if (flaggedContentError) {
    console.error("Failed to load flagged content:", flaggedContentError);
  }

  const handleInvestigateReport = (id: string) => {
    const updatedReports = reports.map(report => {
      if (report.id === id) {
        return { ...report, status: "investigating" as const };
      }
      return report;
    });
    setReports(updatedReports);
    toast.success("Report marked as investigating", { closeButton: true });
  };

  const handleResolveReport = (id: string) => {
    const updatedReports = reports.map(report => {
      if (report.id === id) {
        return { ...report, status: "resolved" as const };
      }
      return report;
    });
    setReports(updatedReports);
    toast.success("Report marked as resolved", { closeButton: true });
  };

  const handleDismissReport = (id: string) => {
    const updatedReports = reports.map(report => {
      if (report.id === id) {
        return { ...report, status: "dismissed" as const };
      }
      return report;
    });
    setReports(updatedReports);
    toast.success("Report marked as dismissed", { closeButton: true });
  };

  const handleEscalateReport = (id: string) => {
    toast.success("Report escalated to admin", { closeButton: true });
  };

  // Flagged content action handlers
  const handleApproveContent = (id: string) => {
    toast.success("Content approved", { closeButton: true });
  };

  const handleRemoveContent = (id: string) => {
    toast.success("Content removed", { closeButton: true });
  };

  const handleEscalateContent = (id: string) => {
    toast.success("Content escalated to admin", { closeButton: true });
  };

  const handleWarnUser = (id: string) => {
    toast.success("User warned", { closeButton: true });
  };

  const handleSuspendUser = (id: string) => {
    toast.success("User suspended", { closeButton: true });
  };

  const handleBanUser = (id: string) => {
    toast.success("User banned", { closeButton: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-md font-bold">Moderator Dashboard</h1>
        <p className="text-[10px] text-muted-foreground">
          Monitor reports, manage content, and maintain community standards
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="text-[10px]">Overview</TabsTrigger>
          <TabsTrigger value="content" className="text-[10px]">Flagged Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pending Reports"
              value={overviewLoading ? "..." : overviewData?.pendingReports.value.toString() || "0"}
              description="Reports awaiting review"
              icon={FileCheck}
              trend={overviewData?.pendingReports ? { 
                value: Math.abs(overviewData.pendingReports.trend), 
                positive: overviewData.pendingReports.positive 
              } : { value: 0, positive: true }}
            />
            <StatCard
              title="Reports Resolved (7d)"
              value={overviewLoading ? "..." : overviewData?.resolvedReports7d.value.toString() || "0"}
              description="Successfully handled reports"
              icon={Search}
              trend={overviewData?.resolvedReports7d ? { 
                value: Math.abs(overviewData.resolvedReports7d.trend), 
                positive: overviewData.resolvedReports7d.positive 
              } : { value: 0, positive: true }}
            />
            <StatCard
              title="Users Warned"
              value={overviewLoading ? "..." : overviewData?.usersWarned7d.value.toString() || "0"}
              description="Users issued warnings this week"
              icon={Users}
              trend={overviewData?.usersWarned7d ? { 
                value: Math.abs(overviewData.usersWarned7d.trend), 
                positive: overviewData.usersWarned7d.positive 
              } : { value: 0, positive: true }}
            />
            <StatCard
              title="Removed Content"
              value={overviewLoading ? "..." : overviewData?.removedContent7d.value.toString() || "0"}
              description="Items removed this week"
              icon={X}
              trend={overviewData?.removedContent7d ? { 
                value: Math.abs(overviewData.removedContent7d.trend), 
                positive: overviewData.removedContent7d.positive 
              } : { value: 0, positive: true }}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-[13px]">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[40vh] overflow-auto">
                {overviewLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-start gap-4 p-2 bg-gray-50 rounded-md animate-pulse">
                      <div className="mt-0.5">
                        <div className="h-4 w-4 bg-gray-300 rounded"></div>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                        <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : overviewData?.recentAlerts ? (
                  // Real data from backend
                  overviewData.recentAlerts.map((alert) => (
                    <div key={alert.id} className={`flex items-start gap-4 p-2 rounded-md ${
                      alert.icon === "red" ? "bg-red-50" : 
                      alert.icon === "amber" ? "bg-amber-50" : 
                      "bg-blue-50"
                    }`}>
                      <div className="mt-0.5">
                        <Bell className={`h-4 w-4 ${
                          alert.icon === "red" ? "text-red-500" : 
                          alert.icon === "amber" ? "text-amber-500" : 
                          "text-blue-500"
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-medium">{alert.title}</h4>
                        <p className="text-[11px] text-muted-foreground">
                          {alert.description}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback when no data
                  <div className="flex items-center justify-center p-4 text-gray-500">
                    <p className="text-sm">No recent alerts available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[13px]">Recently Resolved Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[40vh] overflow-auto">
                <div className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="text-xs font-medium">Content Removed: Artwork #2356</p>
                    <p className="text-[11px] text-muted-foreground">
                      Removed for terms of service violation
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Yesterday</p>
                </div>

                <div className="flex justify-between items-start border-b pb-2">
                  <div>
                    <p className="text-xs font-medium">User Muted: @artlover556</p>
                    <p className="text-[11px] text-muted-foreground">
                      24-hour mute for harassment in comments
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">2 days ago</p>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium">Dispute Resolved: Bid #8972</p>
                    <p className="text-[11px] text-muted-foreground">
                      Mediated between buyer and seller
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">3 days ago</p>
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
              <CardTitle className="text-[13px]">Flagged Content Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-h-[90vh] overflow-auto">
                {flaggedContentLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-4 animate-pulse">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                          <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                          <div className="h-6 bg-gray-300 rounded w-16"></div>
                        </div>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-md">
                        <div className="h-3 bg-gray-300 rounded w-1/4 mb-2"></div>
                        <div className="h-2 bg-gray-300 rounded w-full"></div>
                      </div>
                    </div>
                  ))
                ) : flaggedContentData?.flaggedContent && flaggedContentData.flaggedContent.length > 0 ? (
                  // Real data from backend
                  flaggedContentData.flaggedContent.map((item) => (
                    <div key={item.id} className="border rounded-md p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                          <h3 className="text-xs font-medium">{item.title}</h3>
                          <p className="text-[11px] text-muted-foreground">{item.description}</p>
                          <div className="flex items-center mt-1">
                            <p className={`text-[10px] px-2 py-0.5 rounded ${
                              item.flagged_reason.toLowerCase().includes('inappropriate') || 
                              item.flagged_reason.toLowerCase().includes('copyright') ||
                              item.flagged_reason.toLowerCase().includes('fraud') 
                                ? 'bg-red-100 text-red-800'
                                : item.flagged_reason.toLowerCase().includes('harassment') ||
                                  item.flagged_reason.toLowerCase().includes('spam')
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              Flagged: {item.flagged_reason}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.type === 'artwork' && (
                            <>
                              <button 
                                onClick={() => handleApproveContent(item.id)}
                                className="text-[10px] px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleRemoveContent(item.id)}
                                className="text-[10px] px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                              >
                                Remove
                              </button>
                              <button 
                                onClick={() => handleEscalateContent(item.id)}
                                className="text-[10px] px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                              >
                                Escalate
                              </button>
                            </>
                          )}
                          {item.type === 'comment' && (
                            <>
                              <button 
                                onClick={() => handleApproveContent(item.id)}
                                className="text-[10px] px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                              >
                                Keep
                              </button>
                              <button 
                                onClick={() => handleRemoveContent(item.id)}
                                className="text-[10px] px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                              >
                                Remove
                              </button>
                              <button 
                                onClick={() => handleWarnUser(item.id)}
                                className="text-[10px] px-2 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                              >
                                Warn User
                              </button>
                            </>
                          )}
                          {item.type === 'user' && (
                            <>
                              <button 
                                onClick={() => handleApproveContent(item.id)}
                                className="text-[10px] px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                              >
                                Legitimate
                              </button>
                              <button 
                                onClick={() => handleSuspendUser(item.id)}
                                className="text-[10px] px-2 py-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200"
                              >
                                Suspend
                              </button>
                              <button 
                                onClick={() => handleBanUser(item.id)}
                                className="text-[10px] px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                              >
                                Ban
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-md">
                        <p className="text-[11px] font-medium">Report Description:</p>
                        <p className="text-[10px]">{item.report_description}</p>
                        {item.type === 'comment' && item.content_data.text && (
                          <>
                            <p className="text-[11px] font-medium mt-2">Comment Content:</p>
                            <p className="text-[10px]">"{item.content_data.text}"</p>
                            <p className="text-[10px] mt-2 text-gray-500">
                              - Posted by {item.content_data.author} on {new Date(item.content_data.created_at || '').toLocaleDateString()}
                            </p>
                          </>
                        )}
                        {item.type === 'user' && item.content_data.username && (
                          <p className="text-[10px] mt-2 text-gray-500">
                            Username: @{item.content_data.username}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  // No flagged content
                  <div className="flex items-center justify-center p-8 text-gray-500">
                    <div className="text-center">
                      <p className="text-sm">No flagged content available</p>
                      <p className="text-xs text-gray-400 mt-1">All content is clean and approved</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModeratorDashboard;
