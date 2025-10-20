import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ConfigToggle } from "@/components/admin_&_moderator/admin/ConfigToggle";
import { PolicyLogsList, PolicyLog } from "@/components/admin_&_moderator/admin/PolicyLogsList";
import { FileText, Save } from "lucide-react";

const policySchema = z.object({
  privacyPolicy: z.string().optional(),
  contentPolicy: z.string().optional(),
  communityGuidelines: z.string().optional(),
  dataRetentionDuration: z.string().min(1, { message: "Duration required" }),
});

interface PolicySettingsProps {
  policyLogs: PolicyLog[];
  setPolicyLogs: React.Dispatch<React.SetStateAction<PolicyLog[]>>;
  onView: (log: PolicyLog) => void;
}

const PolicySettings = ({ policyLogs, setPolicyLogs, onView }: PolicySettingsProps) => {
  const [policyConfig, setPolicyConfig] = useState({
    requireUserConsent: true,
    displayPrivacyOnSignup: true,
    aiContentModeration: false,
    reportingSystem: true,
    allowDataDeletion: true,
  });

  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);

  const policyForm = useForm<z.infer<typeof policySchema>>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      privacyPolicy: "",
      contentPolicy: "",
      communityGuidelines: "",
      dataRetentionDuration: "12",
    },
  });

  // ✅ Save or Update Policy
  const savePolicy = (type: string, title: string, content: string, status: "draft" | "saved") => {
    if (editingPolicyId) {
      setPolicyLogs((logs) =>
        logs.map((log) =>
          log.id === editingPolicyId
            ? { ...log, title, content, status, updatedAt: new Date().toLocaleString() }
            : log
        )
      );
      toast.success(`${title} updated successfully`);
      policyForm.reset(); // ✅ Clear after editing
      setEditingPolicyId(null);
      return;
    }

    const existingVersions = policyLogs.filter(
      (log) => log.type === type && log.status === "saved"
    );
    const nextVersion =
      existingVersions.length > 0
        ? Math.max(...existingVersions.map((log) => log.version || 1)) + 1
        : 1;

    const newPolicy: PolicyLog = {
      id: Date.now().toString(),
      title,
      type,
      content,
      status,
      version: status === "saved" ? nextVersion : undefined,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    setPolicyLogs([...policyLogs, newPolicy]);
    toast.success(
      status === "saved"
        ? `${title} published as v${nextVersion}`
        : `${title} saved as draft`
    );

    policyForm.reset(); // Always clear after saving
  };

  // Delete Policy
  const deletePolicy = (id: string) => {
    setPolicyLogs(policyLogs.filter((log) => log.id !== id));
    toast.success("Policy deleted");
  };

  // Edit Draft
  const handleEditDraft = (log: PolicyLog) => {
    if (log.status === "draft") {
      policyForm.reset({
        privacyPolicy: log.type === "Privacy Policy" ? log.content : "",
        contentPolicy: log.type === "Content Policy" ? log.content : "",
        communityGuidelines: log.type === "Community Guidelines" ? log.content : "",
        dataRetentionDuration: "12",
      });
      setEditingPolicyId(log.id);
      toast.info(`Editing draft: ${log.title}`);
    }
  };

  // Download PDF (used by icon + modal)
  const handleDownloadPDF = (log: PolicyLog) => {
    try {
      const pdfContent = `
${log.title} (${log.type})
Version: ${log.version || "N/A"}
Updated: ${log.updatedAt}

---------------------------------------
${log.content}
`;
      const blob = new Blob([pdfContent], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${log.title.replace(/\s+/g, "_")}_v${log.version || 1}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Policy downloaded as PDF");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  // Handle Toggle
  const handleToggle = (setting: keyof typeof policyConfig, checked: boolean) => {
    setPolicyConfig({
      ...policyConfig,
      [setting]: checked,
    });
    toast.success(`${setting} ${checked ? "enabled" : "disabled"} successfully`);
  };

  return (
    <div className="space-y-4">
      <PolicyLogsList
        logs={policyLogs}
        onView={onView}
        onDelete={deletePolicy}
        onEdit={handleEditDraft}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Privacy Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Privacy Policy</CardTitle>
          <CardDescription className="text-[11px]">
            Configure privacy policy and user consent settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            className="text-xs min-h-[120px]"
            placeholder="Enter your privacy policy content..."
            {...policyForm.register("privacyPolicy")}
            style={{ fontSize: "11px" }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = policyForm.getValues("privacyPolicy");
                if (content) savePolicy("Privacy Policy", "Privacy Policy", content, "draft");
                else toast.error("Please enter policy content");
              }}
            >
              <FileText className="h-3 w-3" /> Save as Draft
            </Button>
            <Button
              size="sm"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = policyForm.getValues("privacyPolicy");
                if (content) savePolicy("Privacy Policy", "Privacy Policy", content, "saved");
                else toast.error("Please enter policy content");
              }}
            >
              <Save className="h-3 w-3" /> Save as Policy
            </Button>
          </div>
          <div className="space-y-3 pt-2">
            <ConfigToggle
              id="requireUserConsent"
              label="Require User Consent"
              description="Users must consent before registration"
              defaultChecked={policyConfig.requireUserConsent}
              onToggle={(checked) => handleToggle("requireUserConsent", checked)}
            />
            <ConfigToggle
              id="displayPrivacyOnSignup"
              label="Display Privacy Policy on Sign-up"
              description="Show privacy policy during registration"
              defaultChecked={policyConfig.displayPrivacyOnSignup}
              onToggle={(checked) => handleToggle("displayPrivacyOnSignup", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Content Policy</CardTitle>
          <CardDescription className="text-[11px]">
            Define rules for user-generated content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            className="text-xs min-h-[100px]"
            placeholder="Define rules for artworks, descriptions, and comments..."
            {...policyForm.register("contentPolicy")}
            style={{ fontSize: "11px" }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = policyForm.getValues("contentPolicy");
                if (content) savePolicy("Content Policy", "Content Policy", content, "draft");
                else toast.error("Please enter policy content");
              }}
            >
              <FileText className="h-3 w-3" /> Save as Draft
            </Button>
            <Button
              size="sm"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = policyForm.getValues("contentPolicy");
                if (content) savePolicy("Content Policy", "Content Policy", content, "saved");
                else toast.error("Please enter policy content");
              }}
            >
              <Save className="h-3 w-3" /> Save as Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Community Guidelines</CardTitle>
          <CardDescription className="text-[11px]">
            Set community behavior and interaction rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            className="text-xs min-h-[120px]"
            placeholder="Define community behavior policies, commenting guidelines..."
            {...policyForm.register("communityGuidelines")}
            style={{ fontSize: "11px" }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = policyForm.getValues("communityGuidelines");
                if (content)
                  savePolicy("Community Guidelines", "Community Guidelines", content, "draft");
                else toast.error("Please enter guidelines content");
              }}
            >
              <FileText className="h-3 w-3" /> Save as Draft
            </Button>
            <Button
              size="sm"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = policyForm.getValues("communityGuidelines");
                if (content)
                  savePolicy("Community Guidelines", "Community Guidelines", content, "saved");
                else toast.error("Please enter guidelines content");
              }}
            >
              <Save className="h-3 w-3" /> Save as Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Data Retention Policy</CardTitle>
          <CardDescription className="text-[11px]">
            Configure data storage and deletion settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            className="text-xs h-8 rounded-full"
            type="number"
            min="1"
            placeholder="12"
            {...policyForm.register("dataRetentionDuration")}
            style={{ fontSize: "11px" }}
          />
          <ConfigToggle
            id="allowDataDeletion"
            label="Allow User Data Deletion Requests"
            description="Users can request complete data deletion"
            defaultChecked={policyConfig.allowDataDeletion}
            onToggle={(checked) => handleToggle("allowDataDeletion", checked)}
          />
          <Button
            type="button"
            size="sm"
            className="text-xs h-7 rounded-full"
            onClick={() => toast.success("Data retention settings saved")}
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicySettings;
