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
  {
    id: "6",
    reportType: "offensive",
    reportedId: "comment567",
    reportedType: "comment",
    reportedBy: "user345",
    status: "pending",
    dateReported: "2023-06-20",
    description: "This comment contains hate speech",
  },
  {
    id: "7",
    reportType: "fraud",
    reportedId: "bid789",
    reportedType: "bid",
    reportedBy: "user123",
    status: "pending",
    dateReported: "2023-06-21",
    description: "This bid appears to be fraudulent",
  },
  {
    id: "8",
    reportType: "plagiarism",
    reportedId: "art6789",
    reportedType: "artwork",
    reportedBy: "user234",
    status: "investigating",
    dateReported: "2023-06-22",
    description: "This artwork is stolen from DeviantArt",
  },
];

const ModeratorReports = () => {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleInvestigateReport = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      setSelectedReport(report);
      setDialogOpen(true);
    }
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

  const confirmInvestigation = () => {
    if (selectedReport) {
      const updatedReports = reports.map(report => {
        if (report.id === selectedReport.id) {
          return { ...report, status: "investigating" as const };
        }
        return report;
      });
      setReports(updatedReports);
      toast.success("Report now under investigation");
      setDialogOpen(false);
    }
  };

  const filterReportsByStatus = (status: Report["status"]) => {
    return reports.filter(report => report.status === status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Report Management</h1>
        <p className="text-xs text-muted-foreground">
          Review and respond to user-submitted reports
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-grid sm:grid-cols-4">
          <TabsTrigger value="all" className="text-xs">
            All Reports
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs">
            Pending
          </TabsTrigger>
          <TabsTrigger value="investigating" className="text-xs">
            Investigating
          </TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs">
            Resolved
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">All Reports</CardTitle>
              <CardDescription className="text-xs">
                Complete list of all reports in the system
              </CardDescription>
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

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pending Reports</CardTitle>
              <CardDescription className="text-xs">
                Reports awaiting moderator review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportTable
                initialReports={filterReportsByStatus("pending")}
                onInvestigateReport={handleInvestigateReport}
                onResolveReport={handleResolveReport}
                onDismissReport={handleDismissReport}
                onEscalateReport={handleEscalateReport}
              />
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
              <ReportTable
                initialReports={filterReportsByStatus("investigating")}
                onInvestigateReport={handleInvestigateReport}
                onResolveReport={handleResolveReport}
                onDismissReport={handleDismissReport}
                onEscalateReport={handleEscalateReport}
              />
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
              <ReportTable
                initialReports={[
                  ...filterReportsByStatus("resolved"),
                  ...filterReportsByStatus("dismissed"),
                ]}
                onInvestigateReport={handleInvestigateReport}
                onResolveReport={handleResolveReport}
                onDismissReport={handleDismissReport}
                onEscalateReport={handleEscalateReport}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Investigate Report</DialogTitle>
            <DialogDescription className="text-xs">
              Review the report details and begin investigation
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-medium">Report Type</h3>
                  <p className="text-2xs">
                    {selectedReport.reportType.charAt(0).toUpperCase() + selectedReport.reportType.slice(1)}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-medium">Date Reported</h3>
                  <p className="text-2xs">{selectedReport.dateReported}</p>
                </div>
                <div>
                  <h3 className="text-xs font-medium">Reported Content</h3>
                  <p className="text-2xs capitalize">{selectedReport.reportedType}</p>
                  <p className="text-2xs text-muted-foreground">
                    ID: {selectedReport.reportedId}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-medium">Reported By</h3>
                  <p className="text-2xs">{selectedReport.reportedBy}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-medium">Description</h3>
                <p className="text-2xs border p-2 rounded-md mt-1 bg-gray-50">
                  {selectedReport.description}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-2xs text-muted-foreground">
                  Taking this action will change the report status to "Investigating"
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs"
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
