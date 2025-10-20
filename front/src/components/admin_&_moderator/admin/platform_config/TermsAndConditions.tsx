import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConfigToggle } from "@/components/admin_&_moderator/admin/ConfigToggle";
import { PolicyLogsList, PolicyLog } from "@/components/admin_&_moderator/admin/PolicyLogsList";
import { FileText, Save } from "lucide-react";

const termsSchema = z.object({
  generalTerms: z.string().optional(),
  userConduct: z.string().optional(),
  accountAccess: z.string().optional(),
  liabilityDisclaimer: z.string().optional(),
  autoSuspendViolations: z.string().min(1, { message: "Value required" }),
});

interface TermsAndConditionsProps {
  termsLogs: PolicyLog[];
  setTermsLogs: React.Dispatch<React.SetStateAction<PolicyLog[]>>;
  onView: (log: PolicyLog) => void;
}

const TermsAndConditions = ({ termsLogs, setTermsLogs, onView }: TermsAndConditionsProps) => {
  const [termsConfig, setTermsConfig] = useState({
    requireTermsAcceptance: true,
    showTermsInFooter: true,
    requireAdminReview: false,
  });

  const [editingTermId, setEditingTermId] = useState<string | null>(null);

  const termsForm = useForm<z.infer<typeof termsSchema>>({
    resolver: zodResolver(termsSchema),
    defaultValues: {
      generalTerms: "",
      userConduct: "",
      accountAccess: "",
      liabilityDisclaimer: "",
      autoSuspendViolations: "3",
    },
  });

  // Save or Update Terms
  const saveTerms = (type: string, title: string, content: string, status: "draft" | "saved") => {
    if (editingTermId) {
      setTermsLogs((logs) =>
        logs.map((log) =>
          log.id === editingTermId
            ? { ...log, title, content, status, updatedAt: new Date().toLocaleString() }
            : log
        )
      );
      toast.success(`${title} updated successfully`);
      termsForm.reset();
      setEditingTermId(null);
      return;
    }

    const existingVersions = termsLogs.filter((log) => log.type === type && log.status === "saved");
    const nextVersion =
      existingVersions.length > 0
        ? Math.max(...existingVersions.map((log) => log.version || 1)) + 1
        : 1;

    const newTerm: PolicyLog = {
      id: Date.now().toString(),
      title,
      type,
      content,
      status,
      version: status === "saved" ? nextVersion : undefined,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    setTermsLogs([...termsLogs, newTerm]);
    toast.success(
      status === "saved"
        ? `${title} published as v${nextVersion}`
        : `${title} saved as draft`
    );
    termsForm.reset(); // Always clear
  };

  // Delete
  const deleteTerm = (id: string) => {
    setTermsLogs(termsLogs.filter((log) => log.id !== id));
    toast.success("Terms deleted");
  };

  // Edit draft
  const handleEditDraft = (log: PolicyLog) => {
    if (log.status === "draft") {
      termsForm.reset({
        generalTerms: log.type === "General Terms" ? log.content : "",
        userConduct: log.type === "User Conduct" ? log.content : "",
        accountAccess: log.type === "Account & Access" ? log.content : "",
        liabilityDisclaimer: log.type === "Liability & Disclaimers" ? log.content : "",
        autoSuspendViolations: "3",
      });
      setEditingTermId(log.id);
      toast.info(`Editing draft: ${log.title}`);
    }
  };

  // Download PDF
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
      toast.success("Terms downloaded as PDF");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  // Handle toggle
  const handleToggle = (setting: keyof typeof termsConfig, checked: boolean) => {
    setTermsConfig({
      ...termsConfig,
      [setting]: checked,
    });
    toast.success(`${setting} ${checked ? "enabled" : "disabled"} successfully`);
  };

  return (
    <div className="space-y-4">
      <PolicyLogsList
        logs={termsLogs}
        onView={onView}
        onDelete={deleteTerm}
        onEdit={handleEditDraft}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* General Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">General Terms</CardTitle>
          <CardDescription className="text-[11px]">
            Overall user agreement and platform terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="text-xs min-h-[140px]"
            placeholder="Platform ownership, responsibilities, user obligations..."
            {...termsForm.register("generalTerms")}
            style={{ fontSize: "11px" }}
          />
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = termsForm.getValues("generalTerms");
                if (content) saveTerms("General Terms", "General Terms", content, "draft");
                else toast.error("Please enter terms content");
              }}
            >
              <FileText className="h-3 w-3" /> Save as Draft
            </Button>
            <Button
              size="sm"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = termsForm.getValues("generalTerms");
                if (content) saveTerms("General Terms", "General Terms", content, "saved");
                else toast.error("Please enter terms content");
              }}
            >
              <Save className="h-3 w-3" /> Save as Terms
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Conduct */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">User Conduct</CardTitle>
          <CardDescription className="text-[11px]">
            Acceptable use and behavior policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="text-xs min-h-[120px]"
            placeholder="Rules about acceptable use, prohibited actions..."
            {...termsForm.register("userConduct")}
            style={{ fontSize: "11px" }}
          />
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = termsForm.getValues("userConduct");
                if (content) saveTerms("User Conduct", "User Conduct", content, "draft");
                else toast.error("Please enter conduct rules");
              }}
            >
              <FileText className="h-3 w-3" /> Save as Draft
            </Button>
            <Button
              size="sm"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = termsForm.getValues("userConduct");
                if (content) saveTerms("User Conduct", "User Conduct", content, "saved");
                else toast.error("Please enter conduct rules");
              }}
            >
              <Save className="h-3 w-3" /> Save as Terms
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account & Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Account & Access</CardTitle>
          <CardDescription className="text-[11px]">
            Account suspension and termination policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            className="text-xs min-h-[100px]"
            placeholder="Conditions for account suspension, banning, or termination..."
            {...termsForm.register("accountAccess")}
            style={{ fontSize: "11px" }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = termsForm.getValues("accountAccess");
                if (content)
                  saveTerms("Account & Access", "Account & Access Policy", content, "draft");
                else toast.error("Please enter account policy");
              }}
            >
              <FileText className="h-3 w-3" /> Save as Draft
            </Button>
            <Button
              size="sm"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = termsForm.getValues("accountAccess");
                if (content)
                  saveTerms("Account & Access", "Account & Access Policy", content, "saved");
                else toast.error("Please enter account policy");
              }}
            >
              <Save className="h-3 w-3" /> Save as Terms
            </Button>
          </div>
          <Input
            className="text-xs h-8 rounded-full"
            type="number"
            min="1"
            placeholder="3"
            {...termsForm.register("autoSuspendViolations")}
            style={{ fontSize: "11px" }}
          />
          <ConfigToggle
            id="requireAdminReview"
            label="Require Admin Review Before Ban"
            description="Admin must review before permanent bans"
            defaultChecked={termsConfig.requireAdminReview}
            onToggle={(checked) => handleToggle("requireAdminReview", checked)}
          />
        </CardContent>
      </Card>

      {/* Liability & Disclaimers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Liability & Disclaimers</CardTitle>
          <CardDescription className="text-[11px]">
            Legal protection and liability clauses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="text-xs min-h-[100px]"
            placeholder="Platform liability limitations, disclaimers for user content..."
            {...termsForm.register("liabilityDisclaimer")}
            style={{ fontSize: "11px" }}
          />
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = termsForm.getValues("liabilityDisclaimer");
                if (content)
                  saveTerms("Liability & Disclaimers", "Liability Disclaimer", content, "draft");
                else toast.error("Please enter disclaimer content");
              }}
            >
              <FileText className="h-3 w-3" /> Save as Draft
            </Button>
            <Button
              size="sm"
              className="text-[10px] h-7 gap-1"
              onClick={() => {
                const content = termsForm.getValues("liabilityDisclaimer");
                if (content)
                  saveTerms("Liability & Disclaimers", "Liability Disclaimer", content, "saved");
                else toast.error("Please enter disclaimer content");
              }}
            >
              <Save className="h-3 w-3" /> Save as Terms
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs">Acceptance Controls</CardTitle>
          <CardDescription className="text-[11px]">
            Manage how users accept terms and conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <ConfigToggle
              id="requireTermsAcceptance"
              label="Require Terms Acceptance"
              description="Users must accept T&C before login/register"
              defaultChecked={termsConfig.requireTermsAcceptance}
              onToggle={(checked) => handleToggle("requireTermsAcceptance", checked)}
            />
            <ConfigToggle
              id="showTermsInFooter"
              label="Show Terms in Footer"
              description="Display terms link in site footer"
              defaultChecked={termsConfig.showTermsInFooter}
              onToggle={(checked) => handleToggle("showTermsInFooter", checked)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="text-xs h-7 rounded-full mt-3"
            onClick={() => toast.success("Terms acceptance settings saved")}
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;
