import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";
import SystemMessage from "../components/page/SystemMessage";
<<<<<<< backend
import apiClient from "../utils/apiClient"; // Your axios setup
=======
import { useModal } from '../context/ModalContext';

>>>>>>> master

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
        const response = await apiClient.post("/trigger-fingerprint-scan/");

        console.log("API Response:", response); // Debugging log
        console.log("API Data:", response.data); // Log the actual data

        if (response.status === 200 && response.data.status === "success") {
          handleFingerprintScanResult(response.data.result);
        } else {
          console.error("Fingerprint scan failed:", response.data);
          throw new Error("Fingerprint scan failed");
        }
      } catch (error) {
        console.error("Error triggering fingerprint scan:", error.response?.data || error.message);
        setMessage({ type: "error", text: "Error during fingerprint scan" });
      }
    }
  };

  const handleFingerprintScanResult = (status) => {
    if (status === "matched") {
      setValidationState("valid");
      setMessage({ type: "success", text: "Fingerprint validated successfully" });
      toast.success("Authentication successful", {
        description: "You will be redirected to your account",
      });
      navigate("/explore"); // Redirect to explore page
    } else {
      setValidationState("invalid");
      setMessage({ type: "error", text: "Fingerprint validation failed" });
      toast.error("Authentication failed", {
        description: "Please try again or use another login method",
      });
    }
  };

  const backToLogin = () => {
    setShowLoginModal(true); // Show the login modal
    navigate("/"); // Navigate back to the main page if needed
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
