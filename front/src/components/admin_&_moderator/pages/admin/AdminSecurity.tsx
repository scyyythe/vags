import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfigToggle } from "@/components/admin_&_moderator/admin/ConfigToggle";
import { Button } from "@/components/ui/button";
import { SystemLogs, SystemLog } from "@/components/admin_&_moderator/admin/SystemLogs";
import { toast } from "sonner";

const mockLogs: SystemLog[] = [
  {
    id: "1",
    timestamp: "2023-06-15 14:30:45",
    action: "User Login",
    performedBy: {
      id: "1",
      name: "John Doe",
      role: "admin",
    },
    details: "Admin user logged in from IP 192.168.1.1",
    severity: "info",
  },
  {
    id: "2",
    timestamp: "2023-06-15 15:20:18",
    action: "User Suspended",
    performedBy: {
      id: "2",
      name: "Jane Smith",
      role: "moderator",
    },
    details: "User ID: 456 suspended for violating community guidelines",
    severity: "warning",
  },
  {
    id: "3",
    timestamp: "2023-06-15 16:05:32",
    action: "Content Removed",
    performedBy: {
      id: "2",
      name: "Jane Smith",
      role: "moderator",
    },
    details: "Artwork ID: 789 removed for copyright infringement",
    severity: "warning",
  },
  {
    id: "4",
    timestamp: "2023-06-15 17:12:09",
    action: "System Error",
    performedBy: {
      id: "3",
      name: "System",
      role: "system",
    },
    details: "Database connection error during backup process",
    severity: "error",
  },
  {
    id: "5",
    timestamp: "2023-06-15 18:45:50",
    action: "Config Change",
    performedBy: {
      id: "1",
      name: "John Doe",
      role: "admin",
    },
    details: "Changed minimum bid increment from 5% to 10%",
    severity: "info",
  },
  {
    id: "6",
    timestamp: "2023-06-16 09:15:32",
    action: "Login Attempt",
    performedBy: {
      id: "3",
      name: "System",
      role: "system",
    },
    details: "Failed login attempt for user 'admin' from IP 203.0.113.15",
    severity: "warning",
  },
  {
    id: "7",
    timestamp: "2023-06-16 10:30:12",
    action: "Account Locked",
    performedBy: {
      id: "3",
      name: "System",
      role: "system",
    },
    details: "Account 'test@example.com' locked after 5 failed login attempts",
    severity: "warning",
  },
  {
    id: "8",
    timestamp: "2023-06-16 11:45:08",
    action: "IP Blocked",
    performedBy: {
      id: "1",
      name: "John Doe",
      role: "admin",
    },
    details: "IP 203.0.113.15 blocked after suspicious activity",
    severity: "warning",
  },
];

const AdminSecurity = () => {
  const [securityConfig, setSecurityConfig] = useState({
    twoFactorAuth: true,
    ipLocking: true,
    sensitiveDataLogging: false,
    autoAccountLock: true,
  });

  const handleToggle = (setting: keyof typeof securityConfig, checked: boolean) => {
    setSecurityConfig({
      ...securityConfig,
      [setting]: checked,
    });
    toast.success(`${setting} ${checked ? "enabled" : "disabled"} successfully`);
  };

  const handleResetSecurity = () => {
    toast.success("Security alerts have been reset");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Security & Compliance</h1>
        <p className="text-xs text-muted-foreground">
          Manage platform security settings and monitor system activity
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security Settings</CardTitle>
            <CardDescription className="text-xs">
              Configure security and authentication policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfigToggle
              id="twoFactorAuth"
              label="Two-Factor Authentication"
              description="Require 2FA for admin and moderator accounts"
              defaultChecked={securityConfig.twoFactorAuth}
              onToggle={(checked) => handleToggle("twoFactorAuth", checked)}
            />
            <ConfigToggle
              id="ipLocking"
              label="IP Locking"
              description="Restrict admin access to whitelisted IP addresses"
              defaultChecked={securityConfig.ipLocking}
              onToggle={(checked) => handleToggle("ipLocking", checked)}
            />
            <ConfigToggle
              id="sensitiveDataLogging"
              label="Sensitive Data Logging"
              description="Log sensitive user data and activities"
              defaultChecked={securityConfig.sensitiveDataLogging}
              onToggle={(checked) => handleToggle("sensitiveDataLogging", checked)}
            />
            <ConfigToggle
              id="autoAccountLock"
              label="Automatic Account Locking"
              description="Lock accounts after multiple failed login attempts"
              defaultChecked={securityConfig.autoAccountLock}
              onToggle={(checked) => handleToggle("autoAccountLock", checked)}
            />
            <Button
              size="sm"
              className="text-xs"
              onClick={() => toast.success("Security settings saved")}
            >
              Save Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security Alerts</CardTitle>
            <CardDescription className="text-xs">
              Recent security events requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-amber-500 pl-3 py-2 bg-amber-50 rounded">
                <p className="text-xs font-medium">Multiple Login Failures</p>
                <p className="text-3xs text-muted-foreground">
                  5 failed login attempts for user 'admin@example.com'
                </p>
                <p className="text-3xs text-muted-foreground">10 minutes ago</p>
              </div>
              <div className="border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded">
                <p className="text-xs font-medium">Suspicious IP Activity</p>
                <p className="text-3xs text-muted-foreground">
                  Unusual login pattern detected from IP 203.0.113.15
                </p>
                <p className="text-3xs text-muted-foreground">1 hour ago</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-3 py-2 bg-amber-50 rounded">
                <p className="text-xs font-medium">Account Permission Change</p>
                <p className="text-3xs text-muted-foreground">
                  User 'moderator4' granted admin privileges
                </p>
                <p className="text-3xs text-muted-foreground">Yesterday</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="text-xs w-full"
                onClick={handleResetSecurity}
              >
                Clear All Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Security Audit Log</CardTitle>
          <CardDescription className="text-xs">
            Complete record of security-related events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SystemLogs logs={mockLogs} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
