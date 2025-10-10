import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PolicyViewer } from "@/components/admin_&_moderator/admin/PolicyViewer";
import { PolicyLogsList, PolicyLog } from "@/components/admin_&_moderator/admin/PolicyLogsList";

// Import Section Components
import GeneralSettings from "@/components/admin_&_moderator/admin/platform_config/GeneralSettings";
import FinancialSettings from "@/components/admin_&_moderator/admin/platform_config/FinancialSettings";
import PolicySettings from "@/components/admin_&_moderator/admin/platform_config/PolicySettings";
import TermsAndConditions from "@/components/admin_&_moderator/admin/platform_config/TermsAndConditions";
import EnvironmentSettings from "@/components/admin_&_moderator/admin/platform_config/EnvironmentSettings";
import MaintenanceSettings from "@/components/admin_&_moderator/admin/platform_config/MaintenanceSettings";

const AdminConfig = () => {
  const [policyLogs, setPolicyLogs] = useState<PolicyLog[]>([]);
  const [termsLogs, setTermsLogs] = useState<PolicyLog[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyLog | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<PolicyLog | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [termsViewerOpen, setTermsViewerOpen] = useState(false);

  const viewPolicy = (log: PolicyLog) => {
    setSelectedPolicy(log);
    setViewerOpen(true);
  };

  const viewTerm = (log: PolicyLog) => {
    setSelectedTerm(log);
    setTermsViewerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-md font-bold">Platform Configuration</h1>
        <p className="text-[10px] text-muted-foreground">
          Configure global platform settings and features
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 sm:w-auto sm:inline-grid sm:grid-cols-6">
          <TabsTrigger value="general" className="text-[10px]">
            General Settings
          </TabsTrigger>
          <TabsTrigger value="financial" className="text-[10px]">
            Financial Settings
          </TabsTrigger>
          <TabsTrigger value="policy" className="text-[10px]">
            Policy Settings
          </TabsTrigger>
          <TabsTrigger value="terms" className="text-[10px]">
            Terms & Conditions
          </TabsTrigger>
          <TabsTrigger value="environment" className="text-[10px]">
            Environment Settings
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="text-[10px]">
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        {/* Financial Settings */}
        <TabsContent value="financial">
          <FinancialSettings />
        </TabsContent>

        {/* Policy Settings */}
        <TabsContent value="policy">
          <PolicySettings
            policyLogs={policyLogs}
            setPolicyLogs={setPolicyLogs}
            onView={viewPolicy}
          />
        </TabsContent>

        {/* Terms & Conditions */}
        <TabsContent value="terms">
          <TermsAndConditions
            termsLogs={termsLogs}
            setTermsLogs={setTermsLogs}
            onView={viewTerm}
          />
        </TabsContent>

        {/* Environment Settings */}
        <TabsContent value="environment">
          <EnvironmentSettings />
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance">
          <MaintenanceSettings />
        </TabsContent>
      </Tabs>

      {/* Policy Viewer */}
      {selectedPolicy && (
        <PolicyViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          title={selectedPolicy.title}
          content={selectedPolicy.content}
          status={selectedPolicy.status}
          version={selectedPolicy.version}
          createdAt={selectedPolicy.createdAt}
          updatedAt={selectedPolicy.updatedAt}
        />
      )}

      {/* Terms Viewer */}
      {selectedTerm && (
        <PolicyViewer
          open={termsViewerOpen}
          onOpenChange={setTermsViewerOpen}
          title={selectedTerm.title}
          content={selectedTerm.content}
          status={selectedTerm.status}
          version={selectedTerm.version}
          createdAt={selectedTerm.createdAt}
          updatedAt={selectedTerm.updatedAt}
        />
      )}
    </div>
  );
};

export default AdminConfig;
