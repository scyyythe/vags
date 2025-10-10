import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfigToggle } from "@/components/admin_&_moderator/admin/ConfigToggle";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl, 
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PolicyViewer } from "@/components/admin_&_moderator/admin/PolicyViewer";
import { PolicyLogsList, PolicyLog } from "@/components/admin_&_moderator/admin/PolicyLogsList";
import { Save, FileText, Trash2 } from "lucide-react";

const configSchema = z.object({
  biddingTimeLimit: z.string().min(1, {
    message: "Value required",
  }),
  minBidIncrement: z.string().min(1, {
    message: "Value required",
  }),
  sellerCommissionRate: z.string().min(1, {
    message: "Value required",
  }),
});

const paymentSchema = z.object({
  stripePublicKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  paypalClientId: z.string().optional(),
  paypalClientSecret: z.string().optional(),
});

const policySchema = z.object({
  privacyPolicy: z.string().optional(),
  contentPolicy: z.string().optional(),
  communityGuidelines: z.string().optional(),
  dataRetentionDuration: z.string().min(1, { message: "Duration required" }),
});

const termsSchema = z.object({
  generalTerms: z.string().optional(),
  userConduct: z.string().optional(),
  accountAccess: z.string().optional(),
  liabilityDisclaimer: z.string().optional(),
  autoSuspendViolations: z.string().min(1, { message: "Value required" }),
});

const AdminConfig = () => {
  const [platformConfig, setPlatformConfig] = useState({
    biddingEnabled: true,
    postingEnabled: true,
    registrationEnabled: true,
    exhibitionsEnabled: true,
  });

  const [policyConfig, setPolicyConfig] = useState({
    requireUserConsent: true,
    displayPrivacyOnSignup: true,
    aiContentModeration: false,
    reportingSystem: true,
    allowDataDeletion: true,
  });

  const [termsConfig, setTermsConfig] = useState({
    requireTermsAcceptance: true,
    showTermsInFooter: true,
    requireAdminReview: false,
  });

  const [policyLogs, setPolicyLogs] = useState<PolicyLog[]>([]);
  const [termsLogs, setTermsLogs] = useState<PolicyLog[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyLog | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<PolicyLog | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [termsViewerOpen, setTermsViewerOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);

  const configForm = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      biddingTimeLimit: "48",
      minBidIncrement: "5",
      sellerCommissionRate: "10",
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      stripePublicKey: "",
      stripeSecretKey: "",
      paypalClientId: "",
      paypalClientSecret: "",
    },
  });

  const policyForm = useForm<z.infer<typeof policySchema>>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      privacyPolicy: "",
      contentPolicy: "",
      communityGuidelines: "",
      dataRetentionDuration: "12",
    },
  });

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

  const onConfigSubmit = (data: z.infer<typeof configSchema>) => {
    toast.success("Platform configuration updated successfully");
  };

  const onPaymentSubmit = (data: z.infer<typeof paymentSchema>) => {
    toast.success("Payment settings updated successfully");
  };

  const savePolicyAsDraft = (type: string, title: string, content: string) => {
    if (editingPolicyId) {
      // Update existing draft
      setPolicyLogs(policyLogs.map(log => 
        log.id === editingPolicyId 
          ? { ...log, title, content, updatedAt: new Date().toLocaleString() }
          : log
      ));
      setEditingPolicyId(null);
      toast.success("Draft updated successfully");
    } else {
      // Create new draft
      const newPolicy: PolicyLog = {
        id: Date.now().toString(),
        title,
        type,
        content,
        status: "draft",
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };
      setPolicyLogs([...policyLogs, newPolicy]);
      toast.success("Policy saved as draft");
    }
  };

  const savePolicyAsPolicy = (type: string, title: string, content: string) => {
    // Get existing versions of this type to calculate next version
    const existingVersions = policyLogs.filter(
      log => log.type === type && log.status === "saved"
    );
    const nextVersion = existingVersions.length > 0 
      ? Math.max(...existingVersions.map(log => log.version || 1)) + 1 
      : 1;

    if (editingPolicyId) {
      // If editing a draft, remove it and create new saved version
      setPolicyLogs([
        ...policyLogs.filter(log => log.id !== editingPolicyId),
        {
          id: Date.now().toString(),
          title,
          type,
          content,
          status: "saved",
          version: nextVersion,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        }
      ]);
      setEditingPolicyId(null);
      toast.success(`Policy published as v${nextVersion}`);
    } else {
      // Create new saved policy
      const newPolicy: PolicyLog = {
        id: Date.now().toString(),
        title,
        type,
        content,
        status: "saved",
        version: nextVersion,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };
      setPolicyLogs([...policyLogs, newPolicy]);
      toast.success(`Policy saved successfully as v${nextVersion}`);
    }
  };

  const editPolicy = (log: PolicyLog) => {
    setEditingPolicyId(log.id);
    // Populate form based on policy type
    if (log.type === "Privacy Policy") {
      policyForm.setValue("privacyPolicy", log.content);
    } else if (log.type === "Content Policy") {
      policyForm.setValue("contentPolicy", log.content);
    } else if (log.type === "Community Guidelines") {
      policyForm.setValue("communityGuidelines", log.content);
    }
    toast.info("Editing draft. Make changes and save.");
  };

  const downloadPolicyPDF = (log: PolicyLog) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${log.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${log.title}</h1>
            <div class="meta">
              <p>Status: Published | Version: ${log.version || 1}</p>
              <p>Created: ${log.createdAt} | Last Updated: ${log.updatedAt}</p>
            </div>
            <div class="content">${log.content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const deletePolicy = (id: string) => {
    setPolicyLogs(policyLogs.filter((log) => log.id !== id));
    toast.success("Policy deleted");
  };

  const viewPolicy = (log: PolicyLog) => {
    setSelectedPolicy(log);
    setViewerOpen(true);
  };

  const saveTermsAsDraft = (type: string, title: string, content: string) => {
    if (editingTermId) {
      // Update existing draft
      setTermsLogs(termsLogs.map(log => 
        log.id === editingTermId 
          ? { ...log, title, content, updatedAt: new Date().toLocaleString() }
          : log
      ));
      setEditingTermId(null);
      toast.success("Draft updated successfully");
    } else {
      // Create new draft
      const newTerm: PolicyLog = {
        id: Date.now().toString(),
        title,
        type,
        content,
        status: "draft",
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };
      setTermsLogs([...termsLogs, newTerm]);
      toast.success("Terms saved as draft");
    }
  };

  const saveTermsAsTerms = (type: string, title: string, content: string) => {
    // Get existing versions of this type to calculate next version
    const existingVersions = termsLogs.filter(
      log => log.type === type && log.status === "saved"
    );
    const nextVersion = existingVersions.length > 0 
      ? Math.max(...existingVersions.map(log => log.version || 1)) + 1 
      : 1;

    if (editingTermId) {
      // If editing a draft, remove it and create new saved version
      setTermsLogs([
        ...termsLogs.filter(log => log.id !== editingTermId),
        {
          id: Date.now().toString(),
          title,
          type,
          content,
          status: "saved",
          version: nextVersion,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        }
      ]);
      setEditingTermId(null);
      toast.success(`Terms published as v${nextVersion}`);
    } else {
      // Create new saved terms
      const newTerm: PolicyLog = {
        id: Date.now().toString(),
        title,
        type,
        content,
        status: "saved",
        version: nextVersion,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString(),
      };
      setTermsLogs([...termsLogs, newTerm]);
      toast.success(`Terms & Conditions saved as v${nextVersion}`);
    }
  };

  const editTerm = (log: PolicyLog) => {
    setEditingTermId(log.id);
    // Populate form based on terms type
    if (log.type === "General Terms") {
      termsForm.setValue("generalTerms", log.content);
    } else if (log.type === "User Conduct") {
      termsForm.setValue("userConduct", log.content);
    } else if (log.type === "Account & Access") {
      termsForm.setValue("accountAccess", log.content);
    } else if (log.type === "Liability & Disclaimers") {
      termsForm.setValue("liabilityDisclaimer", log.content);
    }
    toast.info("Editing draft. Make changes and save.");
  };

  const downloadTermsPDF = (log: PolicyLog) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${log.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${log.title}</h1>
            <div class="meta">
              <p>Status: Published | Version: ${log.version || 1}</p>
              <p>Created: ${log.createdAt} | Last Updated: ${log.updatedAt}</p>
            </div>
            <div class="content">${log.content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const deleteTerm = (id: string) => {
    setTermsLogs(termsLogs.filter((log) => log.id !== id));
    toast.success("Terms & Conditions deleted");
  };

  const viewTerm = (log: PolicyLog) => {
    setSelectedTerm(log);
    setTermsViewerOpen(true);
  };

  const handleToggle = (setting: keyof typeof platformConfig, checked: boolean) => {
    setPlatformConfig({
      ...platformConfig,
      [setting]: checked,
    });
    toast.success(`${setting} ${checked ? "enabled" : "disabled"} successfully`, { closeButton: true });
  };

  const handlePolicyToggle = (setting: keyof typeof policyConfig, checked: boolean) => {
    setPolicyConfig({
      ...policyConfig,
      [setting]: checked,
    });
    toast.success(`${setting} ${checked ? "enabled" : "disabled"} successfully`, { closeButton: true });
  };

  const handleTermsToggle = (setting: keyof typeof termsConfig, checked: boolean) => {
    setTermsConfig({
      ...termsConfig,
      [setting]: checked,
    });
    toast.success(`${setting} ${checked ? "enabled" : "disabled"} successfully`, { closeButton: true });
  };

  const handleMaintenanceMode = () => {
    toast.success("Maintenance mode activated. Platform will be unavailable to users in 5 minutes.", { closeButton: true });
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
        <TabsList className="grid w-full grid-cols-5 sm:w-auto sm:inline-grid sm:grid-cols-5">
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
          <TabsTrigger value="maintenance" className="text-[10px]">
            Maintenance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs">Feature Controls</CardTitle>
              <CardDescription className="text-[11px]">
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <ConfigToggle
                  id="bidding"
                  label="Bidding"
                  description="Allow users to place bids on artworks"
                  defaultChecked={platformConfig.biddingEnabled}
                  onToggle={(checked) => handleToggle("biddingEnabled", checked)}
                />
                <ConfigToggle
                  id="posting"
                  label="Artwork Posting"
                  description="Allow users to post new artworks"
                  defaultChecked={platformConfig.postingEnabled}
                  onToggle={(checked) => handleToggle("postingEnabled", checked)}
                />
                <ConfigToggle
                  id="registration"
                  label="User Registration"
                  description="Allow new users to register on the platform"
                  defaultChecked={platformConfig.registrationEnabled}
                  onToggle={(checked) => handleToggle("registrationEnabled", checked)}
                />
                <ConfigToggle
                  id="exhibitions"
                  label="Exhibitions"
                  description="Allow creation and viewing of exhibitions"
                  defaultChecked={platformConfig.exhibitionsEnabled}
                  onToggle={(checked) => handleToggle("exhibitionsEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs">Default Rules</CardTitle>
              <CardDescription className="text-[11px]">
                Configure default platform-wide rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...configForm}>
                <form
                  onSubmit={configForm.handleSubmit(onConfigSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={configForm.control}
                    name="biddingTimeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px]">Bidding Time Limit (hours)</FormLabel>
                        <FormControl>
                          <Input className="rounded-full h-8" style={{fontSize:"10px"}} {...field} type="number" min="1" />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Default time period for auctions
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={configForm.control}
                    name="minBidIncrement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px]">Minimum Bid Increment (%)</FormLabel>
                        <FormControl>
                          <Input className="rounded-full h-8" style={{fontSize:"10px"}} {...field} type="number" min="1" max="100" />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Minimum percentage increase for new bids
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={configForm.control}
                    name="sellerCommissionRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px]">Seller Commission Rate (%)</FormLabel>
                        <FormControl>
                          <Input className="rounded-full h-8" style={{fontSize:"10px"}} {...field} type="number" min="0" max="100" />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          Platform fee taken from sales
                        </FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" size="sm" className="text-[10px] h-7 rounded-full">
                    Save Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Gateways</CardTitle>
              <CardDescription className="text-xs">
                Configure payment processing services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form
                  onSubmit={paymentForm.handleSubmit(onPaymentSubmit)}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="text-xs font-semibold mb-2">Stripe</h3>
                      <div className="space-y-2">
                        <FormField
                          control={paymentForm.control}
                          name="stripePublicKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Public Key</FormLabel>
                              <FormControl>
                                <Input className="text-xs" {...field} type="password" />
                              </FormControl>
                              <FormMessage className="text-2xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="stripeSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Secret Key</FormLabel>
                              <FormControl>
                                <Input className="text-xs" {...field} type="password" />
                              </FormControl>
                              <FormMessage className="text-2xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold mb-2">PayPal</h3>
                      <div className="space-y-2">
                        <FormField
                          control={paymentForm.control}
                          name="paypalClientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Client ID</FormLabel>
                              <FormControl>
                                <Input className="text-xs" {...field} type="password" />
                              </FormControl>
                              <FormMessage className="text-2xs" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={paymentForm.control}
                          name="paypalClientSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Client Secret</FormLabel>
                              <FormControl>
                                <Input className="text-xs" {...field} type="password" />
                              </FormControl>
                              <FormMessage className="text-2xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="sm" className="text-xs">
                    Save Payment Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy" className="space-y-4">
          <PolicyLogsList
            logs={policyLogs}
            onView={viewPolicy}
            onDelete={deletePolicy}
            onEdit={editPolicy}
            onDownloadPDF={downloadPolicyPDF}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Privacy Policy</CardTitle>
              <CardDescription className="text-xs">
                Configure privacy policy and user consent settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...policyForm}>
                <form className="space-y-4">
                  <FormField
                    control={policyForm.control}
                    name="privacyPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Privacy Policy Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="text-xs min-h-[120px]" 
                            placeholder="Enter your privacy policy content..."
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Define what user data is collected, stored, and used
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = policyForm.getValues("privacyPolicy");
                        if (content) {
                          savePolicyAsDraft("Privacy Policy", "Privacy Policy", content);
                          policyForm.reset();
                        } else {
                          toast.error("Please enter policy content");
                        }
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = policyForm.getValues("privacyPolicy");
                        if (content) {
                          savePolicyAsPolicy("Privacy Policy", "Privacy Policy", content);
                          policyForm.reset();
                        } else {
                          toast.error("Please enter policy content");
                        }
                      }}
                    >
                      <Save className="h-3 w-3" />
                      Save as Policy
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        policyForm.reset();
                        setEditingPolicyId(null);
                        toast.info("Form cleared");
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </Button>
                  </div>

                  <div className="space-y-3 pt-2">
                    <ConfigToggle
                      id="requireUserConsent"
                      label="Require User Consent"
                      description="Users must consent before registration"
                      defaultChecked={policyConfig.requireUserConsent}
                      onToggle={(checked) => handlePolicyToggle("requireUserConsent", checked)}
                    />
                    <ConfigToggle
                      id="displayPrivacyOnSignup"
                      label="Display Privacy Policy on Sign-up"
                      description="Show privacy policy during registration"
                      defaultChecked={policyConfig.displayPrivacyOnSignup}
                      onToggle={(checked) => handlePolicyToggle("displayPrivacyOnSignup", checked)}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Content Policy</CardTitle>
              <CardDescription className="text-xs">
                Define rules for user-generated content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...policyForm}>
                <form className="space-y-4">
                  <FormField
                    control={policyForm.control}
                    name="contentPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Content Policy Rules</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="text-xs min-h-[100px]" 
                            placeholder="Define rules for artworks, descriptions, and comments..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = policyForm.getValues("contentPolicy");
                        if (content) {
                          savePolicyAsDraft("Content Policy", "Content Policy", content);
                        } else {
                          toast.error("Please enter policy content");
                        }
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = policyForm.getValues("contentPolicy");
                        if (content) {
                          savePolicyAsPolicy("Content Policy", "Content Policy", content);
                        } else {
                          toast.error("Please enter policy content");
                        }
                      }}
                    >
                      <Save className="h-3 w-3" />
                      Save as Policy
                    </Button>
                  </div>

                  <div className="space-y-3 pt-2">
                    <ConfigToggle
                      id="aiContentModeration"
                      label="AI Content Moderation"
                      description="Automatically detect inappropriate content"
                      defaultChecked={policyConfig.aiContentModeration}
                      onToggle={(checked) => handlePolicyToggle("aiContentModeration", checked)}
                    />
                    <ConfigToggle
                      id="reportingSystem"
                      label="Reporting System"
                      description="Allow users to report inappropriate content"
                      defaultChecked={policyConfig.reportingSystem}
                      onToggle={(checked) => handlePolicyToggle("reportingSystem", checked)}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Community Guidelines</CardTitle>
              <CardDescription className="text-xs">
                Set community behavior and interaction rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...policyForm}>
                <form className="space-y-4">
                  <FormField
                    control={policyForm.control}
                    name="communityGuidelines"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Guidelines Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="text-xs min-h-[120px]" 
                            placeholder="Define community behavior policies, commenting guidelines, exhibition rules..."
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Guidelines for commenting, interactions, and exhibitions
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = policyForm.getValues("communityGuidelines");
                        if (content) {
                          savePolicyAsDraft("Community Guidelines", "Community Guidelines", content);
                        } else {
                          toast.error("Please enter guidelines content");
                        }
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = policyForm.getValues("communityGuidelines");
                        if (content) {
                          savePolicyAsPolicy("Community Guidelines", "Community Guidelines", content);
                        } else {
                          toast.error("Please enter guidelines content");
                        }
                      }}
                    >
                      <Save className="h-3 w-3" />
                      Save as Policy
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Data Retention Policy</CardTitle>
              <CardDescription className="text-xs">
                Configure data storage and deletion settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...policyForm}>
                <form className="space-y-4">
                  <FormField
                    control={policyForm.control}
                    name="dataRetentionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Retention Duration (months)</FormLabel>
                        <FormControl>
                          <Input 
                            className="text-xs h-8 rounded-full" 
                            type="number" 
                            min="1" 
                            placeholder="12"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Delete inactive accounts after specified duration
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />

                  <ConfigToggle
                    id="allowDataDeletion"
                    label="Allow User Data Deletion Requests"
                    description="Users can request complete data deletion"
                    defaultChecked={policyConfig.allowDataDeletion}
                    onToggle={(checked) => handlePolicyToggle("allowDataDeletion", checked)}
                  />

                  <Button
                    type="button"
                    size="sm"
                    className="text-xs h-7 rounded-full"
                    onClick={() => {
                      const duration = policyForm.getValues("dataRetentionDuration");
                      toast.success("Data retention settings saved");
                    }}
                  >
                    Save Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <PolicyLogsList
            logs={termsLogs}
            onView={viewTerm}
            onDelete={deleteTerm}
            onEdit={editTerm}
            onDownloadPDF={downloadTermsPDF}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">General Terms</CardTitle>
              <CardDescription className="text-xs">
                Overall user agreement and platform terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...termsForm}>
                <form className="space-y-4">
                  <FormField
                    control={termsForm.control}
                    name="generalTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">General Terms Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="text-xs min-h-[140px]" 
                            placeholder="Platform ownership, responsibilities, user obligations, intellectual property rights..."
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Platform ownership, user obligations, and IP rights
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = termsForm.getValues("generalTerms");
                        if (content) {
                          saveTermsAsDraft("General Terms", "General Terms", content);
                          termsForm.setValue("generalTerms", "");
                        } else {
                          toast.error("Please enter terms content");
                        }
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = termsForm.getValues("generalTerms");
                        if (content) {
                          saveTermsAsTerms("General Terms", "General Terms", content);
                          termsForm.setValue("generalTerms", "");
                        } else {
                          toast.error("Please enter terms content");
                        }
                      }}
                    >
                      <Save className="h-3 w-3" />
                      Save as Terms
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        termsForm.setValue("generalTerms", "");
                        setEditingTermId(null);
                        toast.info("Form cleared");
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">User Conduct</CardTitle>
              <CardDescription className="text-xs">
                Acceptable use and behavior policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...termsForm}>
                <form className="space-y-4">
                  <FormField
                    control={termsForm.control}
                    name="userConduct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">User Conduct Rules</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="text-xs min-h-[120px]" 
                            placeholder="Rules about acceptable use, prohibited actions, plagiarism policy..."
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Define acceptable and prohibited user behaviors
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = termsForm.getValues("userConduct");
                        if (content) {
                          saveTermsAsDraft("User Conduct", "User Conduct", content);
                          termsForm.setValue("userConduct", "");
                        } else {
                          toast.error("Please enter conduct rules");
                        }
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = termsForm.getValues("userConduct");
                        if (content) {
                          saveTermsAsTerms("User Conduct", "User Conduct", content);
                          termsForm.setValue("userConduct", "");
                        } else {
                          toast.error("Please enter conduct rules");
                        }
                      }}
                    >
                      <Save className="h-3 w-3" />
                      Save as Terms
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Account & Access</CardTitle>
              <CardDescription className="text-xs">
                Account suspension and termination policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...termsForm}>
                <form className="space-y-4">
                  <FormField
                    control={termsForm.control}
                    name="accountAccess"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Account Access Policy</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="text-xs min-h-[100px]" 
                            placeholder="Conditions for account suspension, banning, or termination..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = termsForm.getValues("accountAccess");
                        if (content) {
                          saveTermsAsDraft("Account & Access", "Account & Access Policy", content);
                          termsForm.setValue("accountAccess", "");
                        } else {
                          toast.error("Please enter account policy");
                        }
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = termsForm.getValues("accountAccess");
                        if (content) {
                          saveTermsAsTerms("Account & Access", "Account & Access Policy", content);
                          termsForm.setValue("accountAccess", "");
                        } else {
                          toast.error("Please enter account policy");
                        }
                      }}
                    >
                      <Save className="h-3 w-3" />
                      Save as Terms
                    </Button>
                  </div>

                  <FormField
                    control={termsForm.control}
                    name="autoSuspendViolations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Auto-Suspend After Violations</FormLabel>
                        <FormControl>
                          <Input 
                            className="text-xs h-8 rounded-full" 
                            type="number" 
                            min="1" 
                            placeholder="3"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Number of policy violations before auto-suspension
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />

                  <ConfigToggle
                    id="requireAdminReview"
                    label="Require Admin Review Before Ban"
                    description="Admin must review before permanent bans"
                    defaultChecked={termsConfig.requireAdminReview}
                    onToggle={(checked) => handleTermsToggle("requireAdminReview", checked)}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Liability & Disclaimers</CardTitle>
              <CardDescription className="text-xs">
                Legal protection and liability clauses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...termsForm}>
                <form className="space-y-4">
                  <FormField
                    control={termsForm.control}
                    name="liabilityDisclaimer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Liability Disclaimer</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="text-xs min-h-[100px]" 
                            placeholder="Platform liability limitations, disclaimers for user content..."
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-[10px]">
                          Legal disclaimers and platform liability limitations
                        </FormDescription>
                        <FormMessage className="text-2xs" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = termsForm.getValues("liabilityDisclaimer");
                        if (content) {
                          saveTermsAsDraft("Liability & Disclaimers", "Liability Disclaimer", content);
                          termsForm.setValue("liabilityDisclaimer", "");
                        } else {
                          toast.error("Please enter disclaimer content");
                        }
                      }}
                    >
                      <FileText className="h-3 w-3" />
                      Save as Draft
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] h-7 gap-1"
                      onClick={() => {
                        const content = termsForm.getValues("liabilityDisclaimer");
                        if (content) {
                          saveTermsAsTerms("Liability & Disclaimers", "Liability Disclaimer", content);
                          termsForm.setValue("liabilityDisclaimer", "");
                        } else {
                          toast.error("Please enter disclaimer content");
                        }
                      }}
                    >
                      <Save className="h-3 w-3" />
                      Save as Terms
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Acceptance Controls</CardTitle>
              <CardDescription className="text-xs">
                Manage how users accept terms and conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...termsForm}>
                <form className="space-y-4">
                  <div className="space-y-3">
                    <ConfigToggle
                      id="requireTermsAcceptance"
                      label="Require Terms Acceptance"
                      description="Users must accept T&C before login/register"
                      defaultChecked={termsConfig.requireTermsAcceptance}
                      onToggle={(checked) => handleTermsToggle("requireTermsAcceptance", checked)}
                    />
                    <ConfigToggle
                      id="showTermsInFooter"
                      label="Show Terms in Footer"
                      description="Display terms link in site footer"
                      defaultChecked={termsConfig.showTermsInFooter}
                      onToggle={(checked) => handleTermsToggle("showTermsInFooter", checked)}
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    className="text-xs h-7 rounded-full"
                    onClick={() => toast.success("Terms acceptance settings saved")}
                  >
                    Save Settings
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Maintenance</CardTitle>
              <CardDescription className="text-xs">
                Manage system downtime and maintenance operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
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

                <div className="border-t pt-4">
                  <h3 className="text-xs font-semibold">Database Backups</h3>
                  <p className="text-2xs text-muted-foreground mb-2">
                    Backup the entire platform database to secure your data.
                  </p>
                  <Button variant="outline" size="sm" className="text-xs mr-2">
                    Create Backup
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Restore Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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