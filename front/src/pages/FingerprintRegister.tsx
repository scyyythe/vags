import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../utils/apiClient";
import { useModal } from "../context/ModalContext";
import SystemMessage from "../components/page/SystemMessage";

const FingerprintRegister = () => {
  const navigate = useNavigate();
  const { setShowRegisterModal } = useModal();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  
  
  const [validationState, setValidationState] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const backToRegister = () => {
    setShowRegisterModal(true); 
    navigate("/"); 
  };

  const handleFingerprintRegistration = async () => {
    // Form validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Missing information", {
        description: "Please fill in all required fields.",
      });
      setMessage({ type: "error", text: "Please fill in all required fields" });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address.",
      });
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }
    
    setValidationState("validating");
    setMessage({ type: "info", text: "Scanning your fingerprint..." });
    
    // Simulate fingerprint registration process
    try {
      // this would interface with actual biometric APIs
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Register user with auto-generated secure password
      const securePassword = Math.random().toString(36).slice(-12);
      
      const response = await apiClient.post("user/register/", {
        username: formData.email.split("@")[0],
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: securePassword, 
      });
      
      console.log("Fingerprint registration successful:", response.data);
      
      setValidationState("valid");
      setMessage({ type: "success", text: "Registration successful!" });
      
      toast.success("Registration successful!", {
        description: "You can now log in with your fingerprint.",
      });
      
    } catch (error) {
      console.error("Registration failed:", error.response?.data || error.message);
      
      setValidationState("invalid");
      setMessage({ type: "error", text: "Registration failed. Please try again." });
      
      toast.error("Registration failed", {
        description: "Please check your details and try again.",
      });
    }
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
    <div className="w-full max-w-md p-8 h-[600px] space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-xs text-gray-600">Register using your fingerprint</p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1">First name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                // icon="bx bx-user"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1">Last name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                // icon="bx bx-user"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">@</span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
              />
            </div>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-center cursor-pointer"
          onClick={handleFingerprintRegistration}
        >
          <div
            className={`p-8 rounded-full border-2 ${
              validationState === "validating" ? "animate-pulse" : ""
            } transition-colors duration-300 mb-4`}
          >
            <Fingerprint size={64} className={`${getIconColor()} transition-colors duration-300`} />
          </div>

          <span className="text-center text-xs">Click to scan fingerprint</span>

          {message && <SystemMessage type={message.type} message={message.text} />}
        </div>


        <button
            type="submit"
            className="relative w-full bg-red-900 text-white text-sm font-medium rounded-full px-5 py-2 transition-all hover:bg-red-800"
        >
            Create account
        </button>

        <p className="relative text-[10px] text-left text-gray-500 -top-6">
            By signing up, I agree to the{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
        </p>

        <button
          type="button"
          onClick={backToRegister}
          className="w-full text-gray-600 text-xs py-2 hover:text-red-900 transition-colors relative -top-8"
        >
          <i className="bx bx-arrow-back mr-2"></i>
          Back to registration
        </button>
      </div>
    </div>
  );
};

export default FingerprintRegister;