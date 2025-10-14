import React, { useState, useEffect } from "react";
import { Shield, Smartphone, Mail, Key } from "lucide-react";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";
import { useTwoFactorSendCode } from "@/hooks/mutate/users/useTwoFactorMutate";
import { toast } from "sonner";

interface TwoFactorVerificationProps {
  twoFactorMethod: string;
  enabledMethods: string[];
  pendingLoginData: {
    email: string;
    password: string;
  };
  onVerify: (code: string) => void;
  onBack: () => void;
  isVerifying?: boolean;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  twoFactorMethod,
  enabledMethods,
  pendingLoginData,
  onVerify,
  onBack,
  isVerifying = false,
}) => {
  const { language: selectedLanguage } = useLanguage();
  const [twoFactorCode, setTwoFactorCode] = useState(["", "", "", "", "", ""]);
  const { mutate: send2FACode, isPending: isSending2FA } = useTwoFactorSendCode();

  // 2FA translations
  const twoFactorTitle = useAutoTranslation("Two-Factor Authentication", selectedLanguage);
  const twoFactorDesc = useAutoTranslation(
    "Enter the verification code from your authenticator app or email",
    selectedLanguage
  );
  const verificationCodeLabel = useAutoTranslation("Verification Code", selectedLanguage);
  const verifyLabel = useAutoTranslation("Verify", selectedLanguage);
  const resendCodeLabel = useAutoTranslation("Resend Code", selectedLanguage);
  const backToLoginLabel = useAutoTranslation("Back to Login", selectedLanguage);

  const handleResend2FACode = () => {
    send2FACode(
      {
        method: twoFactorMethod,
        email: pendingLoginData.email,
        password: pendingLoginData.password,
      },
      {
        onSuccess: () => {
          // toast.success("Verification code sent successfully");
        },
        onError: (error: any) => {
          console.error("Failed to send 2FA code:", error);
          toast.error(error.response?.data?.error || "Failed to send verification code");
        },
      }
    );
  };

  // Auto-send code when component mounts for SMS/Email methods
  useEffect(() => {
    if (twoFactorMethod === "sms" || twoFactorMethod === "email") {
      handleResend2FACode();
    }
  }, [twoFactorMethod]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...twoFactorCode];
    newCode[index] = value;
    setTwoFactorCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !twoFactorCode[index] && index > 0) {
      // Move to previous input if current is empty
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = twoFactorCode.join("");
    if (!code || code.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    onVerify(code);
  };

  return (
    <div className="w-full flex flex-col justify-center py-8 px-14 md:py-8 md:px-14 lg:py-8 lg:px-14 bg-white rounded-2xl">
      {/* Back button */}
      <div className="flex justify-start mb-4">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800 text-xs flex items-center gap-2">
          <i className="bx bx-arrow-back"></i>
          {backToLoginLabel}
        </button>
      </div>

      {/* 2FA Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h1 className="text-sm font-bold mb-2">{twoFactorTitle}</h1>
        <p className="text-gray-600 text-xs">{twoFactorDesc}</p>
      </div>

      {/* Method indicator */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
          {twoFactorMethod === "sms" && <Smartphone className="h-3 w-3 text-gray-600" />}
          {twoFactorMethod === "email" && <Mail className="h-3 w-3 text-gray-600" />}
          {twoFactorMethod === "totp" && <Key className="h-3 w-3 text-gray-600" />}
          <span className="text-xs text-gray-600 uppercase">{twoFactorMethod}</span>
        </div>
      </div>

      {/* 2FA Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs text-gray-600 mb-2">{verificationCodeLabel}</label>
          <div className="flex gap-2 justify-center">
            {twoFactorCode.map((digit, index) => (
              <input
                key={index}
                id={`digit-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleDigitChange(index, e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 border border-gray-300 rounded-lg text-center text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={1}
                autoComplete="off"
                inputMode="numeric"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={twoFactorCode.join("").length !== 6 || isVerifying}
          className="w-full bg-red-900 text-white text-xs font-medium rounded-full px-5 py-3 transition-all hover:bg-red-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Verifying...
            </>
          ) : (
            verifyLabel
          )}
        </button>

        {/* Resend code button */}
        {(twoFactorMethod === "sms" || twoFactorMethod === "email") && (
          <div className="text-center">
            <button
              type="button"
              onClick={handleResend2FACode}
              disabled={isSending2FA}
              className="text-gray-600 hover:text-blue-600 text-xs disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
            >
              {isSending2FA ? (
                <>
                  <div className="w-3 h-3 border border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                resendCodeLabel
              )}
            </button>
          </div>
        )}
      </form>

      {/* Help text */}
      <div className="text-center mt-6">
        <p className="text-xs text-gray-500">
          {twoFactorMethod === "totp" && "Open your authenticator app to get the verification code"}
          {twoFactorMethod === "sms" && "Check your email for the verification code (testing mode)"}
          {twoFactorMethod === "email" && "Check your email for the verification code"}
        </p>
      </div>
    </div>
  );
};

export default TwoFactorVerification;
