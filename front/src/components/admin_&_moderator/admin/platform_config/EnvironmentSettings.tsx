import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const EnvironmentSettings = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Environment Settings</CardTitle>
          <CardDescription className="text-xs">
            Manage deployment environment and system configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[11px] text-muted-foreground">
            Environment settings will be available here. You can use this section to configure
            system-wide environment variables, API endpoints, or resource modes.
          </p>
          <p className="text-[11px] text-muted-foreground mt-2">
            (For now, no environment options are implemented.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnvironmentSettings;
