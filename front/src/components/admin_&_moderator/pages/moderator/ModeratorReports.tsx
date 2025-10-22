import { useState } from "react";
import { ReportTable, Report } from "@/components/admin_&_moderator/admin/ReportTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import useModeratorReports, { useUpdateReportStatus } from "@/hooks/moderator/useModeratorReports";


const ModeratorReports = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch reports based on active tab
  const { data: allReports, isLoading: allLoading, error: allError } = useModeratorReports("all");
  const { data: pendingReports, isLoading: pendingLoading, error: pendingError } = useModeratorReports("pending");
  const { data: investigatingReports, isLoading: investigatingLoading, error: investigatingError } = useModeratorReports("investigating");
  const { data: resolvedReports, isLoading: resolvedLoading, error: resolvedError } = useModeratorReports("resolved");

  // Mutation for updating report status
  const updateReportMutation = useUpdateReportStatus();

  // Get current reports based on active tab
  const getCurrentReports = () => {
    switch (activeTab) {
      case "pending":
        return pendingReports?.reports || [];
      case "investigating":
        return investigatingReports?.reports || [];
      case "resolved":
        return resolvedReports?.reports || [];
      default:
        return allReports?.reports || [];
    }
  };

  const handleInvestigateReport = (id: string) => {
    const reports = getCurrentReports();
    const report = reports.find(r => r.id === id);
    if (report) {
      setSelectedReport(report);
      setDialogOpen(true);
    }
  };

  const handleResolveReport = (id: string) => {
    updateReportMutation.mutate(
      { reportId: id, status: "resolved" },
      {
        onSuccess: () => {
          toast.success("Report marked as resolved", { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to update report status", { closeButton: true });
        }
      }
    );
  };

  const handleDismissReport = (id: string) => {
    updateReportMutation.mutate(
      { reportId: id, status: "dismissed" },
      {
        onSuccess: () => {
          toast.success("Report marked as dismissed", { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to update report status", { closeButton: true });
        }
      }
    );
  };

  const handleEscalateReport = (id: string) => {
    toast.success("Report escalated to admin", { closeButton: true });
  };

  const confirmInvestigation = () => {
    if (selectedReport) {
      updateReportMutation.mutate(
        { reportId: selectedReport.id, status: "investigating" },
        {
          onSuccess: () => {
            toast.success("Report now under investigation", { closeButton: true });
            setDialogOpen(false);
          },
          onError: () => {
            toast.error("Failed to update report status", { closeButton: true });
          }
        }
      );
    }
  };

  // Get loading state based on active tab
  const getCurrentLoading = () => {
    switch (activeTab) {
      case "pending":
        return pendingLoading;
      case "investigating":
        return investigatingLoading;
      case "resolved":
        return resolvedLoading;
      default:
        return allLoading;
    }
  };

  // Get error state based on active tab
  const getCurrentError = () => {
    switch (activeTab) {
      case "pending":
        return pendingError;
      case "investigating":
        return investigatingError;
      case "resolved":
        return resolvedError;
      default:
        return allError;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-md font-bold">Report Management</h1>
        <p className="text-[10px] text-muted-foreground">
          Review and respond to user-submitted reports
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid sm:grid-cols-4">
          <TabsTrigger value="all" className="text-[10px]">
            All Reports ({allReports?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-[10px]">
            Pending ({pendingReports?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="investigating" className="text-[10px]">
            Investigating ({investigatingReports?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-[10px]">
            Resolved ({resolvedReports?.total || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Reports</CardTitle>
              <CardDescription className="text-[10px]">
                Complete list of all reports in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getCurrentLoading() ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading reports...</p>
                  </div>
                </div>
              ) : getCurrentError() ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-sm text-red-500">Failed to load reports</p>
                    <p className="text-xs text-gray-400 mt-1">Please try again later</p>
                  </div>
                </div>
              ) : (
                <ReportTable
                  initialReports={getCurrentReports()}
                  onInvestigateReport={handleInvestigateReport}
                  onResolveReport={handleResolveReport}
                  onDismissReport={handleDismissReport}
                  onEscalateReport={handleEscalateReport}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pending Reports</CardTitle>
              <CardDescription className="text-xs">
                Reports awaiting moderator review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getCurrentLoading() ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading reports...</p>
                  </div>
                </div>
              ) : getCurrentError() ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-sm text-red-500">Failed to load reports</p>
                    <p className="text-xs text-gray-400 mt-1">Please try again later</p>
                  </div>
                </div>
              ) : (
                <ReportTable
                  initialReports={getCurrentReports()}
                  onInvestigateReport={handleInvestigateReport}
                  onResolveReport={handleResolveReport}
                  onDismissReport={handleDismissReport}
                  onEscalateReport={handleEscalateReport}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investigating">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reports Under Investigation</CardTitle>
              <CardDescription className="text-xs">
                Reports currently being investigated
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getCurrentLoading() ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading reports...</p>
                  </div>
                </div>
              ) : getCurrentError() ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-sm text-red-500">Failed to load reports</p>
                    <p className="text-xs text-gray-400 mt-1">Please try again later</p>
                  </div>
                </div>
              ) : (
                <ReportTable
                  initialReports={getCurrentReports()}
                  onInvestigateReport={handleInvestigateReport}
                  onResolveReport={handleResolveReport}
                  onDismissReport={handleDismissReport}
                  onEscalateReport={handleEscalateReport}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Resolved Reports</CardTitle>
              <CardDescription className="text-xs">
                Reports that have been resolved or dismissed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getCurrentLoading() ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Loading reports...</p>
                  </div>
                </div>
              ) : getCurrentError() ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <p className="text-sm text-red-500">Failed to load reports</p>
                    <p className="text-xs text-gray-400 mt-1">Please try again later</p>
                  </div>
                </div>
              ) : (
                <ReportTable
                  initialReports={getCurrentReports()}
                  onInvestigateReport={handleInvestigateReport}
                  onResolveReport={handleResolveReport}
                  onDismissReport={handleDismissReport}
                  onEscalateReport={handleEscalateReport}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xs">Investigate Report</DialogTitle>
            <DialogDescription className="text-[11px]">
              Review the report details and begin investigation
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[10px] font-medium">Report Type</h3>
                  <p className="text-xs">
                    {selectedReport.reportType.charAt(0).toUpperCase() + selectedReport.reportType.slice(1)}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] font-medium">Date Reported</h3>
                  <p className="text-xs">{selectedReport.dateReported}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-medium">Reported Content</h3>
                  <p className="text-xs capitalize">{selectedReport.reportedType}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {selectedReport.reportedId}
                  </p>
                </div>
                <div>
                  <h3 className="text-[10px] font-medium">Reported By</h3>
                  <p className="text-xs">{selectedReport.reportedBy}</p>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-medium">Description</h3>
                <p className="text-xs border p-2 rounded-md mt-1 bg-gray-50">
                  {selectedReport.description}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground">
                  Taking this action will change the report status to "Investigating"
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] rounded-full h-8"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="text-[10px] rounded-full h-8"
                    onClick={confirmInvestigation}
                  >
                    Begin Investigation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModeratorReports;
