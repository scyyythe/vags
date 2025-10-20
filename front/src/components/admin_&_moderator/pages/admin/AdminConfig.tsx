import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [activeTab, setActiveTab] = useState("general");

  const viewPolicy = (log: PolicyLog) => {
    setSelectedPolicy(log);
    setViewerOpen(true);
  };

  const viewTerm = (log: PolicyLog) => {
    setSelectedTerm(log);
    setTermsViewerOpen(true);
  };

  const tabOptions = [
    { value: "general", label: "General Settings" },
    { value: "financial", label: "Financial Settings" },
    { value: "policy", label: "Policy Settings" },
    { value: "terms", label: "Terms & Conditions" },
    { value: "environment", label: "Environment Settings" },
    { value: "maintenance", label: "Maintenance" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "financial":
        return <FinancialSettings />;
      case "policy":
        return (
          <PolicySettings
            policyLogs={policyLogs}
            setPolicyLogs={setPolicyLogs}
            onView={viewPolicy}
          />
        );
      case "terms":
        return (
          <TermsAndConditions
            termsLogs={termsLogs}
            setTermsLogs={setTermsLogs}
            onView={viewTerm}
          />
        );
      case "environment":
        return <EnvironmentSettings />;
      case "maintenance":
        return <MaintenanceSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-md font-bold">Platform Configuration</h1>
        <p className="text-[10px] text-muted-foreground">
          Configure global platform settings and features
        </p>
      </div>

      <div className="space-y-4">
        {/* Mobile Dropdown */}
        <div className="block sm:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full" style={{fontSize:"11px"}}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tabOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-[11px]">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              {tabOptions.map((option) => (
                <TabsTrigger key={option.value} value={option.value} className="text-[10px]">
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="mt-4">
          {renderTabContent()}
        </div>
      </div>

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
