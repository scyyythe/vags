import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/page/Logo";
import InputField from "../components/page/InputField";
import SocialButton from "../components/page/SocialButton";
import { useModal } from "../context/ModalContext";
import apiClient from "../utils/apiClient";
import SystemMessage from "../components/page/SystemMessage";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";

// Auto-translation imports
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";

const Register = ({ closeRegisterModal }: { closeRegisterModal: () => void }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const { setShowLoginModal } = useModal();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

  // Language context
  const { language } = useLanguage();

  // Translatable texts
  const alreadyMember = useAutoTranslation("Already a member?", language);
  const loginText = useAutoTranslation("Log in!", language);
  const createAccountTitle = useAutoTranslation("Create new account.", language);
  const signUpWithGoogle = useAutoTranslation("Sign Up with Google", language);
  const orText = useAutoTranslation("Or", language);
  const firstNameLabel = useAutoTranslation("First Name", language);
  const firstNamePlaceholder = useAutoTranslation("First name", language);
  const lastNameLabel = useAutoTranslation("Last Name", language);
  const lastNamePlaceholder = useAutoTranslation("Last name", language);
  const emailLabel = useAutoTranslation("Email Address", language);
  const emailPlaceholder = useAutoTranslation("Email Address", language);
  const passwordLabel = useAutoTranslation("Password", language);
  const passwordPlaceholder = useAutoTranslation("Password", language);
  const createAccountBtn = useAutoTranslation("Create account", language);
  const tosAgreement = useAutoTranslation("By signing up, I agree to the", language);
  const termsOfService = useAutoTranslation("Terms of Service", language);
  const andText = useAutoTranslation("and", language);
  const privacyPolicy = useAutoTranslation("Privacy Policy", language);

  // Toast messages (auto-translated)
  const registrationSuccessful = useAutoTranslation("Registration successful!", language);
  const registrationFailed = useAutoTranslation("Registration failed", language);
  const missingInfo = useAutoTranslation("Missing information", language);
  const missingInfoDesc = useAutoTranslation("Please fill in all required fields.", language);
  const passwordTooShort = useAutoTranslation("Password too short", language);
  const passwordTooShortDesc = useAutoTranslation("Password must be at least 8 characters long.", language);
  const passwordWeak = useAutoTranslation("Password must be stronger", language);
  const passwordWeakDesc = useAutoTranslation(
    "Password must contain at least one special character (e.g. !, @, #, $).",
    language
  );
  const processingRegistration = useAutoTranslation("Processing registration...", language);
  const loginNow = useAutoTranslation("You can now log in.", language);
  const invalidDetails = useAutoTranslation("Please check your details and try again.", language);
  const unexpectedError = useAutoTranslation("An unexpected error occurred. Please try again later.", language);
  const googleSignupFailed = useAutoTranslation("Google sign-up failed", language);
  const googleLoginFailed = useAutoTranslation("Google login failed", language);

  interface GoogleSignUpResponse {
    access_token: string;
    refresh_token: string;
  }

  const handleGoogleSignUp = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const googleToken = response.access_token;

        const { data }: { data: GoogleSignUpResponse } = await apiClient.post("user/google-register/", {
          google_token: googleToken,
        });

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          toast.success(registrationSuccessful, { closeButton: true });

          closeRegisterModal();
          setShowLoginModal(true);
        } else {
          toast.error(googleSignupFailed, { closeButton: true });
        }
      } catch (error) {
        console.error("Google sign-up error", error);
        toast.error(googleSignupFailed, { closeButton: true });
      }
    },
    onError: (error) => {
      console.error("Google login error", error);
      toast.error(googleLoginFailed, { closeButton: true });
    },
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const { firstName, lastName, email, password } = formData;

    // Validate required fields
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      toast.error(missingInfo, { description: missingInfoDesc, closeButton: true });
      return;
    }

    // Validate names
    const nameRegex = /^[A-Z][a-zA-Z]*$/;
    if (!nameRegex.test(firstName)) {
      toast.error("First name invalid", {
        description: "Must start with a capital letter and contain only letters",
        closeButton: true,
      });
      return;
    }
    if (!nameRegex.test(lastName)) {
      toast.error("Last name invalid", {
        description: "Must start with a capital letter and contain only letters",
        closeButton: true,
      });
      return;
    }

    // Validate email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format", { closeButton: true });
      return;
    }

    // Validate password
    if (password.length < 8) {
      toast.error(passwordTooShort, { description: passwordTooShortDesc, closeButton: true });
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      toast.error(passwordWeak, { description: passwordWeakDesc, closeButton: true });
      return;
    }

    const loadingToast = toast.loading(processingRegistration);

    try {
      const response = await apiClient.post("user/register/", {
        username: email.split("@")[0],
        email,
        first_name: firstName,
        last_name: lastName,
        password,
      });

      toast.success(registrationSuccessful, { description: loginNow, closeButton: true });
      closeRegisterModal();
      setShowLoginModal(true);
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      toast.error(registrationFailed, { description: invalidDetails, closeButton: true });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const [showFingerprintText, setShowFingerprintText] = useState(false);
  const handleFingerprintClick = () => {
    closeRegisterModal();
    navigate("/fingerprint-register");
  };

  return (
    <div className="flex flex-col justify-center rounded-2xl py-4 px-14 md:py-4 md:px-14 lg:py-4 lg:px-14 bg-white">
      <div className="flex justify-end">
        {/* Fingerprint Icon and Sliding Text Container */}
        {/* <div className="relative flex items-center gap-2"> 
          <div className="border border-gray-300 px-2 rounded-full hover:border-red-800 transition-colors cursor-pointer" 
          onMouseEnter={() => setShowFingerprintText(true)} onMouseLeave={() => setShowFingerprintText(false)} onClick={handleFingerprintClick} > 
            <i className="bx bx-fingerprint text-sm hover:text-red-800 cursor-pointer"></i> 
          </div> 
        </div> */}
        <p className="relative top-5 text-[10px] text-gray-600 mb-10">
          {alreadyMember}{" "}
          <button
            onClick={() => {
              closeRegisterModal();
              setShowLoginModal(true);
            }}
            className="text-red-800 hover:text-red-600 font-medium"
          >
            {loginText}
          </button>
        </p>
      </div>

      <div className="mb-4">
        <h1 className="text-lg text-center font-bold">{createAccountTitle}</h1>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 text-[9px]">
          <SocialButton provider="google" text={signUpWithGoogle} icon="bx bxl-google" onClick={handleGoogleSignUp} />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-[10px]">{orText}</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              type="text"
              label={firstNameLabel}
              placeholder={firstNamePlaceholder}
              icon="bx bx-user"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <InputField
              type="text"
              label={lastNameLabel}
              placeholder={lastNamePlaceholder}
              icon="bx bx-user"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <InputField
            type="email"
            label={emailLabel}
            placeholder={emailPlaceholder}
            icon="bx bx-at"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="relative">
            <InputField
              type={showPassword ? "text" : "password"}
              label={passwordLabel}
              placeholder={passwordPlaceholder}
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
              <i className={showPassword ? "bx bx-hide" : "bx bx-show"} style={{ fontSize: "15px" }}></i>
            </button>
          </div>

          <button
            type="submit"
            className="relative w-full bg-red-900 text-white text-xs font-medium rounded-full px-5 py-2 transition-all hover:bg-red-800"
          >
            {createAccountBtn}
          </button>

          {message && <SystemMessage type={message.type} message={message.text} />}

          <p className="relative text-[7px] text-center text-gray-500 -top-4">
            {tosAgreement}{" "}
            <a href="#" className="underline">
              {termsOfService}
            </a>{" "}
            {andText}{" "}
            <a href="#" className="underline">
              {privacyPolicy}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
