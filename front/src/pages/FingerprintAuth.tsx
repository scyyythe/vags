import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";
import SystemMessage from "../components/page/SystemMessage";
import { useModal } from '../context/ModalContext';


const FingerprintAuth = () => {
  const navigate = useNavigate();
  const { setShowLoginModal } = useModal();
  const [validationState, setValidationState] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

  // Fingerprint validation when component mounts
  useEffect(() => {
    // Fingerprint scan process
    if (validationState === "idle") {
      return;
    }

    const timer = setTimeout(() => {
      // Randomly succeed or fail for demonstration purposes
      const isValid = Math.random() > 0.5;
      
      if (isValid) {
        setValidationState("valid");
        setMessage({ type: "success", text: "Fingerprint validated successfully" });
        toast.success("Authentication successful", {
          description: "You will be redirected to your account",
        });
        
        setTimeout(() => {
          navigate("/explore");
        }, 2000);
      } else {
        setValidationState("invalid");
        setMessage({ type: "error", text: "Fingerprint validation failed" });
        toast.error("Authentication failed", {
          description: "Please try again or use another login method",
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [validationState, navigate]);

  const handleFingerprintClick = () => {
    if (validationState !== "validating") {
      setValidationState("validating");
      setMessage({ type: "info", text: "Scanning your fingerprint..." });
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
          <div className={`p-8 rounded-full border-2 ${validationState === "validating" ? "animate-pulse" : ""} transition-colors duration-300 mb-4`}>
            <Fingerprint 
              size={64} 
              className={`${getIconColor()} transition-colors duration-300`} 
            />
          </div>
          
          {message && (
            <SystemMessage type={message.type} message={message.text} />
          )}
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
