import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key, Smartphone, Mail, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/utils/apiClient";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface TwoFactorVerificationProps {
  onSuccess: (token: string) => void;
  onError: (error: string) => void;
  email: string;
  method: string;
  enabledMethods?: string[];
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  onSuccess,
  onError,
  email,
  method,
  enabledMethods = ["totp", "sms", "email", "backup"],
}) => {
  const { language: selectedLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState(method || "totp");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);

  // Auto-translated labels
  const twoFactorAuthLabel = useAutoTranslation("Two-Factor Authentication", selectedLanguage);
  const enterCodeLabel = useAutoTranslation("Enter Verification Code", selectedLanguage);
  const backupCodeLabel = useAutoTranslation("Backup Code", selectedLanguage);
  const verifyLabel = useAutoTranslation("Verify", selectedLanguage);
  const authenticatorAppLabel = useAutoTranslation("Authenticator App", selectedLanguage);
  const smsLabel = useAutoTranslation("SMS", selectedLanguage);
  const emailLabel = useAutoTranslation("Email", selectedLanguage);
  const enter6DigitCodeLabel = useAutoTranslation("Enter 6-digit code from your authenticator app", selectedLanguage);
  const enterBackupCodeLabel = useAutoTranslation("Enter one of your backup codes", selectedLanguage);
  const invalidCodeLabel = useAutoTranslation("Invalid code", selectedLanguage);
  const tooManyAttemptsLabel = useAutoTranslation("Too many attempts. Please try again later.", selectedLanguage);
  const accountLockedLabel = useAutoTranslation("Account temporarily locked", selectedLanguage);
  const tryAgainInLabel = useAutoTranslation("Try again in", selectedLanguage);
  const secondsLabel = useAutoTranslation("seconds", selectedLanguage);

  useEffect(() => {
    if (isLocked && lockTime > 0) {
      const timer = setTimeout(() => {
        setLockTime(lockTime - 1);
        if (lockTime <= 1) {
          setIsLocked(false);
          setAttempts(0);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLocked, lockTime]);

  const handleVerification = async (code: string, isBackupCode = false) => {
    if (isLocked) {
      toast.error(accountLockedLabel);
      return;
    }

    if (!code) {
      toast.error("Please enter a code");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post("/auth/2fa/verify/", {
        code: isBackupCode ? undefined : code,
        backup_code: isBackupCode ? code : undefined,
        device_fingerprint: generateDeviceFingerprint(),
      });

      toast.success("Verification successful!");
      onSuccess(response.data.token || "verified");
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || invalidCodeLabel;
      toast.error(errorMessage);

      setAttempts((prev) => prev + 1);

      if (attempts >= 4) {
        setIsLocked(true);
        setLockTime(300); // 5 minutes
        toast.error(tooManyAttemptsLabel);
      }

      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDeviceFingerprint = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx!.textBaseline = "top";
    ctx!.font = "14px Arial";
    ctx!.fillText("Device fingerprint", 2, 2);

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join("|");

    return btoa(fingerprint).substring(0, 32);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === "backup") {
      handleVerification(backupCode, true);
    } else {
      handleVerification(verificationCode);
    }
  };

  const renderAuthenticatorTab = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Key className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-sm font-semibold mb-2">{authenticatorAppLabel}</h3>
        <p className="text-xs text-gray-600">{enter6DigitCodeLabel}</p>
      </div>

      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div>
          <Label htmlFor="totp-code">{enterCodeLabel}</Label>
          <Input
            id="totp-code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-sm tracking-widest font-mono"
            maxLength={6}
            disabled={isLoading || isLocked}
          />
        </div>
        <Button type="submit" className="w-full" disabled={verificationCode.length !== 6 || isLoading || isLocked}>
          {isLoading ? "Verifying..." : verifyLabel}
        </Button>
      </form>
    </div>
  );

  const renderSMSTab = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Smartphone className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-sm font-semibold mb-2">{smsLabel}</h3>
        <p className="text-xs text-gray-600">Enter the verification code sent to your phone</p>
      </div>

      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div>
          <Label htmlFor="sms-code">{enterCodeLabel}</Label>
          <Input
            id="sms-code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-sm tracking-widest font-mono"
            maxLength={6}
            disabled={isLoading || isLocked}
          />
        </div>
        <Button type="submit" className="w-full" disabled={verificationCode.length !== 6 || isLoading || isLocked}>
          {isLoading ? "Verifying..." : verifyLabel}
        </Button>
      </form>
    </div>
  );

  const renderEmailTab = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Mail className="mx-auto h-12 w-12 text-purple-600 mb-4" />
        <h3 className="text-sm font-semibold mb-2">{emailLabel}</h3>
        <p className="text-xs text-gray-600">Enter the verification code sent to your email</p>
      </div>

      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email-code">{enterCodeLabel}</Label>
          <Input
            id="email-code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            className="w-full text-center text-sm tracking-widest font-mono"
            maxLength={6}
            disabled={isLoading || isLocked}
          />
        </div>
        <Button type="submit" className="w-full" disabled={verificationCode.length !== 6 || isLoading || isLocked}>
          {isLoading ? "Verifying..." : verifyLabel}
        </Button>
      </form>
    </div>
  );

  const renderBackupCodeTab = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-orange-600 mb-4" />
        <h3 className="text-sm font-semibold mb-2">{backupCodeLabel}</h3>
        <p className="text-xs text-gray-600">{enterBackupCodeLabel}</p>
      </div>

      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div>
          <Label htmlFor="backup-code">{backupCodeLabel}</Label>
          <div className="relative">
            <Input
              id="backup-code"
              type={showBackupCode ? "text" : "password"}
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              className="w-full text-center text-sm tracking-widest font-mono"
              disabled={isLoading || isLocked}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowBackupCode(!showBackupCode)}
            >
              {showBackupCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={backupCode.length < 8 || isLoading || isLocked}>
          {isLoading ? "Verifying..." : verifyLabel}
        </Button>
      </form>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6" />
          {twoFactorAuthLabel}
        </CardTitle>
        <CardDescription className="text-xs">Please verify your identity to continue</CardDescription>
      </CardHeader>

      <CardContent>
        {isLocked && (
          <Alert className="mb-4">
            <AlertDescription>
              {accountLockedLabel}. {tryAgainInLabel} {lockTime} {secondsLabel}.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full ${
              enabledMethods.length === 1
                ? "grid-cols-1"
                : enabledMethods.length === 2
                ? "grid-cols-2"
                : enabledMethods.length === 3
                ? "grid-cols-3"
                : "grid-cols-4"
            }`}
          >
            {enabledMethods.includes("totp") && (
              <TabsTrigger value="totp" className="text-xs">
                <Key className="h-3 w-3" />
              </TabsTrigger>
            )}
            {enabledMethods.includes("sms") && (
              <TabsTrigger value="sms" className="text-xs">
                <Smartphone className="h-3 w-3" />
              </TabsTrigger>
            )}
            {enabledMethods.includes("email") && (
              <TabsTrigger value="email" className="text-xs">
                <Mail className="h-3 w-3" />
              </TabsTrigger>
            )}
            {enabledMethods.includes("backup") && (
              <TabsTrigger value="backup" className="text-xs">
                <Shield className="h-3 w-3" />
              </TabsTrigger>
            )}
          </TabsList>

          {enabledMethods.includes("totp") && (
            <TabsContent value="totp" className="mt-6">
              {renderAuthenticatorTab()}
            </TabsContent>
          )}

          {enabledMethods.includes("sms") && (
            <TabsContent value="sms" className="mt-6">
              {renderSMSTab()}
            </TabsContent>
          )}

          {enabledMethods.includes("email") && (
            <TabsContent value="email" className="mt-6">
              {renderEmailTab()}
            </TabsContent>
          )}

          {enabledMethods.includes("backup") && (
            <TabsContent value="backup" className="mt-6">
              {renderBackupCodeTab()}
            </TabsContent>
          )}
        </Tabs>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Having trouble? Contact support for assistance.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorVerification;
