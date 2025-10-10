import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MaintenanceSettings = () => {
  const handleMaintenanceMode = () => {
    toast.success(
      "Maintenance mode activated. Platform will be unavailable to users in 5 minutes.",
      { closeButton: true }
    );
  };

  const handleCreateBackup = () => {
    toast.success("Database backup created successfully.");
  };

  const handleRestoreBackup = () => {
    toast.success("Database restored successfully.");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">System Maintenance</CardTitle>
          <CardDescription className="text-xs">
            Manage system downtime and maintenance operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Maintenance Mode */}
            <div>
              <h3 className="text-xs font-semibold">Maintenance Mode</h3>
              <p className="text-2xs text-muted-foreground mb-2">
                Put the platform in maintenance mode to prevent users from accessing it while
                updates are performed.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                onClick={handleMaintenanceMode}
              >
                Enable Maintenance Mode
              </Button>
            </div>

            {/* Database Backups */}
            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold">Database Backups</h3>
              <p className="text-2xs text-muted-foreground mb-2">
                Backup the entire platform database to secure your data.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={handleCreateBackup}
                >
                  Create Backup
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={handleRestoreBackup}
                >
                  Restore Backup
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceSettings;
