import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, EyeOff, Shield, Smartphone, Mail, Key } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useQueryClient } from "@tanstack/react-query";

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentStatus: {
    two_factor_enabled: boolean;
    enabled_methods: string[];
    primary_method: string;
    remaining_backup_codes: number;
  };
}

interface SetupData {
  secret?: string;
  qr_code?: string;
  provisioning_uri?: string;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ isOpen, onClose, onSuccess, currentStatus }) => {
  const { language: selectedLanguage } = useLanguage();
  const queryClient = useQueryClient();

  const getAvailableMethods = () => {
    const allMethods = ["totp", "sms", "email"];
    const enabledMethods = currentStatus?.enabled_methods || [];
    return allMethods.filter((method) => !enabledMethods.includes(method));
  };

  const [activeTab, setActiveTab] = useState(() => {
    const availableMethods = getAvailableMethods();
    return availableMethods.length > 0 ? availableMethods[0] : "totp";
  });
  const [setupData, setSetupData] = useState<SetupData>({});
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"method" | "verify" | "backup">("method");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [backupEmail, setBackupEmail] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("method");
      setVerificationCode("");
      setBackupCodes([]);
      setShowBackupCodes(false);
      setIsLoading(false);
      setPhoneNumber("");
      setBackupEmail("");
      setSetupData({});
    }
  }, [isOpen]);

  // Auto-translated labels
  const setup2FALabel = useAutoTranslation("Set up Two-Factor Authentication", selectedLanguage);
  const chooseMethodLabel = useAutoTranslation("Choose Verification Method", selectedLanguage);
  const authenticatorAppLabel = useAutoTranslation("Authenticator", selectedLanguage);
  const smsLabel = useAutoTranslation("SMS", selectedLanguage);
  const emailLabel = useAutoTranslation("Email", selectedLanguage);
  const recommendedLabel = useAutoTranslation("Recommended", selectedLanguage);
  const scanQRCodeLabel = useAutoTranslation("Scan QR Code", selectedLanguage);
  const enterCodeManuallyLabel = useAutoTranslation("Enter code manually", selectedLanguage);
  const verificationCodeLabel = useAutoTranslation("Verification Code", selectedLanguage);
  const verifyLabel = useAutoTranslation("Verify", selectedLanguage);
  const backupCodesLabel = useAutoTranslation("Backup Codes", selectedLanguage);
  const saveBackupCodesLabel = useAutoTranslation("Save Backup Codes", selectedLanguage);
  const downloadLabel = useAutoTranslation("Download", selectedLanguage);
  const copyLabel = useAutoTranslation("Copy", selectedLanguage);
  const continueLabel = useAutoTranslation("Continue", selectedLanguage);
  const cancelLabel = useAutoTranslation("Cancel", selectedLanguage);
  const phoneNumberLabel = useAutoTranslation("Phone Number", selectedLanguage);
  const backupEmailLabel = useAutoTranslation("Backup Email", selectedLanguage);
  const enterPhoneNumberLabel = useAutoTranslation("Enter your phone number", selectedLanguage);
  const enterBackupEmailLabel = useAutoTranslation("Enter backup email address", selectedLanguage);

  const authenticatorAppDesc = useAutoTranslation(
    "Use an authenticator app like Google Authenticator or Authy to generate time-based codes",
    selectedLanguage
  );
  const smsDesc = useAutoTranslation("SMS verification (testing mode - enter any 6-digit code)", selectedLanguage);
  const emailDesc = useAutoTranslation("Receive verification codes via email", selectedLanguage);

  const handleMethodSelect = async (method: string) => {
    setIsLoading(true);
    try {
      const requestData: any = { method: method };

      if (method === "sms") {
        if (!phoneNumber) {
          toast.error("Please enter your phone number");
          setIsLoading(false);
          return;
        }
        requestData.phone_number = phoneNumber;
      } else if (method === "email") {
        if (!backupEmail) {
          toast.error("Please enter your backup email");
          setIsLoading(false);
          return;
        }
        requestData.backup_email = backupEmail;
      }

      const response = await apiClient.post("/auth/2fa/setup/", requestData);

      if (method === "totp") {
        setSetupData(response.data);
        setStep("verify");
      } else {
        if (method === "sms") {
          toast.success("SMS setup initiated. Enter any 6-digit code to proceed (testing mode)");
        } else if (method === "email") {
          toast.success("Email verification code sent to your backup email address");
        } else {
          toast.success("Setup initiated. Please verify your contact information.");
        }
        setStep("verify");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to initialize 2FA setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode) {
      toast.error("Please enter verification code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/2fa/verify-setup/", {
        code: verificationCode,
        method: activeTab,
      });

      if (response.data.backup_codes) {
        setBackupCodes(response.data.backup_codes);
        setStep("backup");
      } else {
        toast.success("Two-factor authentication enabled successfully!");
        // Invalidate 2FA status query to refresh data
        queryClient.invalidateQueries({ queryKey: ["twoFactorStatus"] });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to verify setup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodesComplete = () => {
    toast.success("Two-factor authentication enabled successfully!");
    // Invalidate 2FA status query to refresh data
    queryClient.invalidateQueries({ queryKey: ["twoFactorStatus"] });
    onSuccess();
    onClose();
  };

  // Reset state when modal closes
  const handleClose = () => {
    // Reset all state to initial values
    setStep("method");
    setVerificationCode("");
    setBackupCodes([]);
    setShowBackupCodes(false);
    setIsLoading(false);
    setPhoneNumber("");
    setBackupEmail("");
    setSetupData({});

    // Call the original onClose
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const downloadBackupCodes = () => {
    const content = `VAGS Art Platform - Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes
      .map((code, index) => `${index + 1}. ${code}`)
      .join("\n")}\n\nKeep these codes safe! Each code can only be used once.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vags-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="mx-auto h-10 w-10 text-blue-600 mb-4" />
        <h3 className="text-base font-semibold mb-2">{chooseMethodLabel}</h3>
        <p className="text-sm text-gray-600">Choose how you'd like to receive verification codes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList
          className={`grid w-full h-12 bg-transparent p-0 gap-0 ${
            getAvailableMethods().length === 1
              ? "grid-cols-1"
              : getAvailableMethods().length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {getAvailableMethods().includes("totp") && (
            <TabsTrigger
              value="totp"
              className="flex items-center justify-center gap-1 text-xs px-2 py-2 bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none flex-1"
            >
              <Key className="h-3 w-3" />
              <span className="truncate text-xs">{authenticatorAppLabel}</span>
            </TabsTrigger>
          )}
          {getAvailableMethods().includes("sms") && (
            <TabsTrigger
              value="sms"
              className="flex items-center justify-center gap-1 text-xs px-2 py-2 bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none flex-1"
            >
              <Smartphone className="h-3 w-3" />
              <span className="truncate text-xs">{smsLabel}</span>
            </TabsTrigger>
          )}
          {getAvailableMethods().includes("email") && (
            <TabsTrigger
              value="email"
              className="flex items-center justify-center gap-1 text-xs px-2 py-2 bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none flex-1"
            >
              <Mail className="h-3 w-3" />
              <span className="truncate text-xs">{emailLabel}</span>
            </TabsTrigger>
          )}
        </TabsList>

        {getAvailableMethods().includes("totp") && (
          <TabsContent value="totp" className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm">{authenticatorAppLabel}</h4>
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  {recommendedLabel}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">{authenticatorAppDesc}</p>
              <Button onClick={() => handleMethodSelect("totp")} className="w-full text-xs">
                {scanQRCodeLabel}
              </Button>
            </div>
          </TabsContent>
        )}

        {getAvailableMethods().includes("sms") && (
          <TabsContent value="sms" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">{smsLabel}</h4>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 mt-0.5">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-yellow-800">SMS temporarily unavailable</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      SMS verification is not available at the moment. Please consider using email two-factor
                      authentication instead.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 opacity-50">
                <Label htmlFor="phone" className="text-sm">
                  {phoneNumberLabel}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={enterPhoneNumberLabel}
                  className="w-full text-sm"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled
                />
              </div>
              <Button onClick={() => handleMethodSelect("sms")} className="w-full mt-4 text-sm" disabled>
                {continueLabel}
              </Button>
            </div>
          </TabsContent>
        )}

        {getAvailableMethods().includes("email") && (
          <TabsContent value="email" className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">{emailLabel}</h4>
              <p className="text-sm text-gray-600 mb-4">{emailDesc}</p>
              <div className="space-y-2">
                <Label htmlFor="backup-email" className="text-sm">
                  {backupEmailLabel}
                </Label>
                <Input
                  id="backup-email"
                  type="email"
                  placeholder={enterBackupEmailLabel}
                  className="w-full text-sm"
                  value={backupEmail}
                  onChange={(e) => setBackupEmail(e.target.value)}
                />
              </div>
              <Button onClick={() => handleMethodSelect("email")} className="w-full mt-4 text-xs">
                {continueLabel}
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      {activeTab === "totp" && setupData.qr_code && (
        <div className="text-center">
          <h3 className="text-base font-semibold mb-4">{scanQRCodeLabel}</h3>
          <div className="bg-white p-4 rounded-lg border inline-block">
            <img src={`data:image/png;base64,${setupData.qr_code}`} alt="QR Code" className="w-40 h-40" />
          </div>
          <p className="text-sm text-gray-600 mt-4">Scan this QR code with your authenticator app</p>

          {setupData.secret && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">{enterCodeManuallyLabel}</p>
              <div className="flex items-center gap-2">
                <Input value={setupData.secret} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(setupData.secret!)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <Label htmlFor="verification-code" className="text-sm">
          {verificationCodeLabel}
        </Label>
        <Input
          id="verification-code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="w-full text-center text-base tracking-widest"
          maxLength={6}
        />
        <Button
          onClick={handleVerification}
          disabled={!verificationCode || verificationCode.length !== 6 || isLoading}
          className="w-full text-sm"
        >
          {isLoading ? "Verifying..." : verifyLabel}
        </Button>
      </div>
    </div>
  );

  const renderBackupCodes = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-base font-semibold mb-2">{backupCodesLabel}</h3>
        <p className="text-sm text-gray-600">
          Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
        </p>
      </div>

      <Alert>
        <AlertDescription className="text-sm">
          Each backup code can only be used once. Keep them safe and don't share them with anyone.
        </AlertDescription>
      </Alert>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-2 font-mono text-sm">
          {backupCodes.map((code, index) => (
            <div key={index} className="p-2 bg-white rounded border">
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={downloadBackupCodes} className="flex-1 text-sm">
          <Download className="h-4 w-4 mr-2" />
          {downloadLabel}
        </Button>
        <Button variant="outline" onClick={() => copyToClipboard(backupCodes.join("\n"))} className="flex-1 text-sm">
          <Copy className="h-4 w-4 mr-2" />
          {copyLabel}
        </Button>
      </div>

      <Button onClick={handleBackupCodesComplete} className="w-full text-sm">
        {continueLabel}
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">{setup2FALabel}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step === "method" && renderMethodSelection()}
          {step === "verify" && renderVerification()}
          {step === "backup" && renderBackupCodes()}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} className="text-sm">
            {cancelLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorSetup;
