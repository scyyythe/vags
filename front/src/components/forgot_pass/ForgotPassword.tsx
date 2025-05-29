import React, { useState } from "react";
import { KeyRound } from "lucide-react";
import { useModal } from "../../context/ModalContext";
import apiClient from "@/utils/apiClient";
import axios from "axios";
import { toast } from "sonner";
// Custom OTP input field component
const OtpInput = ({ value, onChange }: { value: string[]; onChange: (otp: string[]) => void }) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (val.length <= 1 && /^[0-9]*$/.test(val)) {
      const newOtp = [...value];
      newOtp[index] = val;
      onChange(newOtp);

      // Auto-focus next input
      if (val && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split("");
      onChange(digits);
    }
  };

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3].map((i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          className="w-14 h-14 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-900"
          type="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={i === 0 ? handlePaste : undefined}
        />
      ))}
    </div>
  );
};

type ForgotPasswordStep = "email" | "verification" | "newPassword" | "success";

const ForgotPassword = ({ closeForgotPasswordModal }: { closeForgotPasswordModal: () => void }) => {
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const { setShowLoginModal } = useModal();
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      toast.error("Email is required", { description: "Please enter your email address to proceed." });
      return;
    }

    try {
      await apiClient.post("request-reset-email/", { email });
      setError("");
      toast.success("Email sent successfully!", {
        description: "Please check your inbox for the OTP.",
      });
      setCurrentStep("verification");
    } catch (err: unknown) {
      console.error("Request Reset Email Error:", err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.error || "Failed to send reset email", {
          description: "There was an issue sending the reset email. Please try again.",
        });
        setError(err.response?.data?.error || "Failed to send reset email");
      } else {
        toast.error("An unexpected error occurred", {
          description: "Something went wrong. Please try again later.",
        });
        setError("An unexpected error occurred");
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      setError("Please enter the complete verification code");
      toast.error("Incomplete OTP", {
        description: "The OTP must be 4 digits. Please enter the full code.",
      });
      return;
    }

    try {
      await apiClient.post("/verify-otp/", {
        email,
        otp: otpValue,
      });
      setError("");
      toast.success("OTP verified successfully!", {
        description: "You can now proceed to reset your password.",
      });
      setCurrentStep("newPassword");
    } catch (err: unknown) {
      console.error("Verify OTP Error:", err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.detail || "OTP verification failed", {
          description: "The OTP you entered is incorrect or expired. Please try again.",
        });
        setError(err.response?.data?.detail || "OTP verification failed");
      } else {
        toast.error("An unexpected error occurred", {
          description: "There was an issue verifying the OTP. Please try again later.",
        });
        setError("An unexpected error occurred");
      }
    }
  };

  const handleResendCode = async () => {
    try {
      await apiClient.post("/resend-otp/", { email });
      setError("");
      toast.success("OTP resent successfully!", {
        description: "A new OTP has been sent to your email.",
      });
    } catch (err: unknown) {
      console.error("Resend Code Error:", err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.detail || "Failed to resend code", {
          description: "There was an issue resending the OTP. Please try again.",
        });
        setError(err.response?.data?.detail || "Failed to resend code");
      } else {
        toast.error("An unexpected error occurred", {
          description: "Something went wrong while resending the code. Please try again.",
        });
        setError("An unexpected error occurred");
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password too short", {
        description: "Your password must be at least 8 characters long.",
      });
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords mismatch", {
        description: "The passwords you entered do not match. Please try again.",
      });
      return;
    }

    try {
      await apiClient.post("/reset-password/", {
        email,
        new_password: password,
      });
      setError("");
      toast.success("Password reset successfully!", {
        description: "You can now log in with your new password.",
      });
      setCurrentStep("success");
    } catch (err: unknown) {
      console.error("Reset Password Error:", err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.detail || "Failed to reset password", {
          description: "There was an issue resetting your password. Please try again.",
        });
        setError(err.response?.data?.detail || "Failed to reset password");
      } else {
        toast.error("An unexpected error occurred", {
          description: "Something went wrong while resetting your password. Please try again later.",
        });
        setError("An unexpected error occurred");
      }
    }
  };

  const backToLogin = () => {
    closeForgotPasswordModal();
    setShowLoginModal(true);
  };

  const renderEmailForm = () => (
    <div className="flex flex-col items-center">
      {/* <div className="border border-gray-300 p-2 rounded-full mb-6">
        <i className="bx bx-fingerprint"></i>
      </div> */}

      <h1 className="text-lg font-bold mb-2">Forgot Password</h1>
      <p className="text-[11px] text-center text-gray-600 mb-8">
        Enter your email address and we will send a link to reset your password.
      </p>

      <form onSubmit={handleEmailSubmit} className="w-full">
        <div className="mb-6">
          <label htmlFor="email" className="block text-xs font-medium mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              className="w-full px-10 py-2 text-[10px] border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <i className="bx bx-at text-gray-400 text-xs"></i>
            </div>
          </div>
          {error && <p className="text-red-600 text-[10px] mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-red-900 text-white text-xs font-medium py-3 rounded-full hover:bg-red-800 transition-colors mb-4"
        >
          Reset password
        </button>

        <button
          type="button"
          onClick={backToLogin}
          className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
        >
          <i className="bx bx-arrow-back mr-2"></i>
          Back to login
        </button>
      </form>
    </div>
  );

  const renderVerificationForm = () => (
    <div className="flex flex-col items-center">
      <div className="border border-gray-300 p-2 rounded-full mb-6">
        <i className="bx bx-envelope-open"></i>
      </div>

      <h1 className="text-lg font-bold mb-2">Password Reset</h1>
      <p className="text-[10px] text-center text-gray-600 mb-8">
        We sent a code to <span className="font-[600] text-gray-900">{email}</span>
      </p>

      <form onSubmit={handleVerifyOtp} className="w-full">
        <div className="mb-6 text-xs">
          <OtpInput value={otp} onChange={setOtp} />
          {error && <p className="text-red-600 text-[10px] mt-2 text-center">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-red-900 text-white text-xs font-medium py-3 rounded-full hover:bg-red-800 transition-colors mb-4"
        >
          Confirm
        </button>

        <p className="text-[10px] text-center mb-4">
          Didn't receive the email?{" "}
          <button onClick={handleResendCode} className="text-red-900 underline font-medium">
            Click to resend
          </button>
        </p>

        <button
          type="button"
          onClick={backToLogin}
          className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
        >
          <i className="bx bx-arrow-back mr-2"></i>
          Back to login
        </button>
      </form>
    </div>
  );

  const renderNewPasswordForm = () => (
    <div className="flex flex-col items-center">
      <div className="border border-gray-300 p-2 rounded-full mb-6">
        <KeyRound className="w-5 h-5 text-gray-600" />
      </div>

      <h1 className="text-lg font-bold mb-2">Set new password</h1>
      <p className="text-[10px] text-center text-gray-600 mb-8">Must be at least 8 characters.</p>

      <form onSubmit={handlePasswordSubmit} className="w-full">
        <div className="mb-4">
          <label htmlFor="password" className="block text-xs font-medium mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full px-10 py-2 text-[10px] border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="absolute inset-y-0 left-3 flex items-center">
              <i className="bx bx-lock-alt text-gray-400"></i>
            </div>

            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={showPassword ? "bx bx-hide" : "bx bx-show"} style={{ fontSize: "15px" }}></i>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-xs font-medium mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="w-full px-10 py-2 text-[10px] border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-300"
              placeholder="Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <i className="bx bx-lock-alt text-gray-400"></i>
            </div>

            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <i className={showConfirmPassword ? "bx bx-hide" : "bx bx-show"} style={{ fontSize: "15px" }}></i>
            </button>
          </div>
          {error && <p className="text-red-600 text-[10px] mt-1">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-red-900 text-white text-xs font-medium py-3 rounded-full hover:bg-red-800 transition-colors mb-4"
        >
          Reset password
        </button>

        <button
          type="button"
          onClick={backToLogin}
          className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
        >
          <i className="bx bx-arrow-back mr-2"></i>
          Back to login
        </button>
      </form>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className="flex flex-col items-center">
      <div className="mb-2">
        <i className="bx bx-check-circle text-xl"></i>
      </div>

      <h1 className="text-lg font-bold mb-2 text-red-900">All done !</h1>
      <p className="text-xs text-center mb-8">Your password has been reset.</p>

      <button
        type="button"
        onClick={backToLogin}
        className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
      >
        <i className="bx bx-arrow-back mr-2"></i>
        Back to login
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-8">
      {currentStep === "email" && renderEmailForm()}
      {currentStep === "verification" && renderVerificationForm()}
      {currentStep === "newPassword" && renderNewPasswordForm()}
      {currentStep === "success" && renderSuccessMessage()}
    </div>
  );
};

export default ForgotPassword;
