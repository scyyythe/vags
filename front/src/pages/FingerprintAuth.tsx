import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";
import SystemMessage from "../components/page/SystemMessage";
import apiClient from "../utils/apiClient";
import { useModal } from "../context/ModalContext";

const FingerprintAuth = () => {
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();
  const [validationState, setValidationState] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

  const handleFingerprintClick = async () => {
    if (validationState !== "validating") {
      setValidationState("validating");
      setMessage({ type: "info", text: "Scanning your fingerprint..." });

      try {
        const response = await apiClient.post("/trigger-fingerprint-verification/");

        console.log("Response:", response);

        if (response.status === 200 && response.data.status === "success") {
          handleFingerprintScanResult(response.data.result);
        } else {
          console.error("Fingerprint scan failed:", response.data);
          setMessage({ type: "error", text: response.data.result || "Fingerprint scan failed" });
        }
      } catch (error) {
        if (error.response) {
          console.error("Server error:", error.response.data);
          setValidationState("invalid");
          setMessage({ type: "error", text: "Fingerprint not found" });
        } else if (error.request) {
          console.error("No response from server:", error.request);
          setValidationState("invalid");
          setMessage({ type: "error", text: "No response from server" });
        } else {
          console.error("Error setting up request:", error.message);
          setValidationState("invalid");
          setMessage({ type: "error", text: "Error during fingerprint scan" });
        }
      }
    }
  };

  const handleFingerprintScanResult = (result) => {
    console.log("Fingerprint scan result:", result);
    if (result === "matched") {
      setValidationState("valid");
      setMessage({ type: "success", text: "Fingerprint validated successfully" });

      toast.success("Authentication successful", {
        description: "Redirecting to your account...",
      });

      setTimeout(() => {
        navigate("/explore");
      }, 1000);
    } else if (result === "Fingerprint not found") {
      setValidationState("invalid");
      setMessage({ type: "error", text: result || "Fingerprint validation failed" });

      toast.error("Authentication failed", {
        description: "Fingerprint not found. Please try again.",
      });

      setTimeout(() => {
        handleFingerprintClick();
      }, 2000);
    } else {
      setValidationState("invalid");
      setMessage({ type: "error", text: result || "Fingerprint validation failed" });

      toast.error("Authentication failed", {
        description: result || "Please try again or use another login method",
      });
    }
  };

  const backToLogin = () => {
    setShowLoginModal(true);
    navigate("/");
  };

  const getIconColor = () => {
    switch (validationState) {
      case "valid":
        return "text-green-500";
      case "invalid":
        return "text-red-500";
      case "validating":
        return "text-blue-500";
      default:
        return "text-black";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Login</h1>
          <p className="text-xs text-gray-600">Login using your fingerprint.</p>
        </div>

        <div
          className="flex flex-col items-center justify-center py-10 cursor-pointer"
          onClick={handleFingerprintClick}
        >
          <div
            className={`p-8 rounded-full border-2 ${
              validationState === "validating" ? "animate-pulse" : ""
            } transition-colors duration-300 mb-4`}
          >
            <Fingerprint size={64} className={`${getIconColor()} transition-colors duration-300`} />
          </div>

          {message && <SystemMessage type={message.type} message={message.text} />}
        </div>

        <button
          type="button"
          onClick={backToLogin}
          className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors"
        >
          <i className="bx bx-arrow-back mr-2"></i>
          Back to login
        </button>
      </div>
    </div>
  );
};

export default FingerprintAuth;
