import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/page/InputField";
import SocialButton from "../components/page/SocialButton";
import { useModal } from "../context/ModalContext";
import apiClient from "../utils/apiClient";

const Login = ({ closeLoginModal }: { closeLoginModal: () => void }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setShowRegisterModal, setShowForgotPasswordModal } = useModal();
  const [showPassword, setShowPassword] = useState(false);

  const [showFingerprintText, setShowFingerprintText] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await apiClient.post("token/", formData);

      const { access_token, refresh_token, user_id, email } = response.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user_id", user_id);
      localStorage.setItem("email", email);

      console.log("Login successful:", response.data);
      navigate("/explore"); 
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      alert("Login failed. Please check your details and try again.");
    }
  };

  const handleFingerprintClick = () => {
    navigate("/fingerprint-auth");
  };

  return (
    <div className="w-full flex flex-col justify-center md:p-6 lg:py-12 lg:px-16 bg-white rounded-3xl">
      <div className="flex justify-between">
        {/* Fingerprint Icon and Sliding Text Container */}
        <div className="relative bottom-2 flex items-center gap-2">
          <div
            className="border border-gray-300 px-2 rounded-full mb-1 hover:border-red-800 transition-colors cursor-pointer"
            onMouseEnter={() => setShowFingerprintText(true)}
            onMouseLeave={() => setShowFingerprintText(false)}
            onClick={handleFingerprintClick}
          >
            <i className="bx bx-fingerprint text-sm hover:text-red-800 cursor-pointer"></i>
          </div>

          {/* Sliding Text */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              showFingerprintText ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
            }`}
          >
            <span className="whitespace-nowrap text-[10px] relative bottom-1">
              Sign in with fingerprint
            </span>
          </div>
        </div>

        {/* Not a Member Text */}
        <p className="text-xs text-gray-600 mb-6">
          Not a member?{" "}
          <button
            onClick={() => {
              closeLoginModal();
              setShowRegisterModal(true);
            }}
            className="text-red-800 hover:text-red-600 font-medium"
          >
            Sign up!
          </button>
        </p>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Hi, Welcome Back!</h1>
        <p className="text-gray-600 text-xs">Start your day with us.</p>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-xs text-center mb-4">{error}</p>}

      {/* Social Buttons and Form */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 text-[11px]">
          <SocialButton provider="google" text="Sign In with Google" icon="bx bxl-google" />
          <SocialButton provider="facebook" text="Sign In with Facebook" icon="bx bxl-facebook" />
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-xs">Or</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        {/* Login Form */}
        <form className="space-y-5 text-xs" onSubmit={handleSubmit}>
          <InputField
            type="email"
            label="Email Address"
            placeholder="Email Address"
            icon="bx bx-at"
            name="email" 
            value={formData.email}
            onChange={handleChange}
          />

          <div className="relative">
            <InputField
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Password"
              icon="bx bx-lock-alt"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button 
              type="button"
              className="absolute right-3 top-3/4 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={showPassword ? "bx bx-hide" : "bx bx-show"} style={{ fontSize: "18px" }}></i>
            </button>
          </div>


          {/* Forgot Password Link */}
          <div className="relative flex justify-between text-[11px] -top-[77px]">
            <span></span>
            <button
              type="button"
              onClick={() => {
                closeLoginModal();
                setShowForgotPasswordModal(true);
              }}
              className="text-black hover:text-red-700"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="relative -top-5 w-full bg-red-900 text-white text-sm font-medium rounded-full px-5 py-2 transition-all hover:bg-red-800"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
