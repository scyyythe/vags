import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/page/Logo";
import InputField from "../components/page/InputField";
import SocialButton from "../components/page/SocialButton";
import { useModal } from "../context/ModalContext";
import apiClient from "../utils/apiClient";
import SystemMessage from "../components/page/SystemMessage";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { secureTokenStorage } from "@/utils/security/secureStorage";
import TermsAndConditionsModal from "../components/modals/TermsAndConditionsModal";

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
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [registrationData, setRegistrationData] = useState<any>(null);

  useEffect(() => {
    // Disable scrolling when the Register modal opens
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when the modal closes or unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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
  const gmailRequired = useAutoTranslation("Gmail required", language);
  const gmailRequiredDesc = useAutoTranslation("Please use a Gmail address (@gmail.com) to register", language);

  interface GoogleSignUpResponse {
    message: string;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      username: string;
    };
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
          // Store Google registration data and show success message
          setRegistrationData({ 
            response: { data }, 
            formData: { 
              firstName: data.user?.first_name || "", 
              lastName: data.user?.last_name || "", 
              email: data.user?.email || "", 
              password: "",
            },
            isGoogleSignUp: true,
          });
          toast.success(registrationSuccessful, {
            description: "Please accept the Terms & Conditions to continue.",
            closeButton: true,
          });
          
          // Show Terms & Conditions modal
          setShowTermsModal(true);
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

    // Check for spaces in first name
    if (firstName.includes(" ")) {
      toast.error("First name invalid", {
        description: "First name must not contain spaces",
        closeButton: true,
      });
      return;
    }

    // Check for spaces in last name
    if (lastName.includes(" ")) {
      toast.error("Last name invalid", {
        description: "Last name must not contain spaces",
        closeButton: true,
      });
      return;
    }

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
    // Check for spaces in email
    if (email.includes(" ")) {
      toast.error("Email invalid", {
        description: "Email must not contain spaces",
        closeButton: true,
      });
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error("Invalid email format", { closeButton: true });
      return;
    }

    // Check if email is from Gmail domain
    if (!email.toLowerCase().endsWith("@gmail.com")) {
      toast.error(gmailRequired, {
        description: gmailRequiredDesc,
        closeButton: true,
      });
      return;
    }

    // Check email uniqueness
    try {
      const checkResponse = await apiClient.post("user/check-email/", { email });
      if (checkResponse.data.exists) {
        toast.error("Email already exists", {
          description: "This email address is already registered. Please use a different email.",
          closeButton: true,
        });
        return;
      }
    } catch (error) {
      // If the check-email endpoint doesn't exist or fails, continue with registration
      // The backend will handle duplicate email validation during registration
      console.warn("Email uniqueness check failed, proceeding with registration");
    }

    // Validate password
    if (password.length < 8) {
      toast.error(passwordTooShort, { description: passwordTooShortDesc, closeButton: true });
      return;
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain uppercase letter", {
        description: "Password must contain at least one uppercase letter (A-Z)",
        closeButton: true,
      });
      return;
    }

    // Check for at least one number
    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain number", {
        description: "Password must contain at least one number (0-9)",
        closeButton: true,
      });
      return;
    }

    // Check for at least one special character
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

      // Store registration data and show success message
      setRegistrationData({ response, formData: { firstName, lastName, email, password } });
      toast.success(registrationSuccessful, {
        description: "Please accept the Terms & Conditions to continue.",
        closeButton: true,
      });
      
      // Show Terms & Conditions modal
      setShowTermsModal(true);
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

  const handleTermsAgree = () => {
    if (registrationData?.isGoogleSignUp) {
      // Handle Google sign-up completion
      secureTokenStorage.setAccessToken(registrationData.response.data.access_token);
      secureTokenStorage.setRefreshToken(registrationData.response.data.refresh_token);
    }
    
    // Close terms modal and proceed to login
    setShowTermsModal(false);
    closeRegisterModal();
    setShowLoginModal(true);
    setRegistrationData(null);
  };

  const handleTermsExit = () => {
    // Close terms modal and return to registration
    setShowTermsModal(false);
    setRegistrationData(null);
  };

  return (
    <div className="flex flex-col justify-center rounded-2xl py-4 px-14 md:py-4 md:px-14 lg:py-4 lg:px-14 bg-white dark:bg-gray-800">
      <div className="flex justify-end">
        {/* Fingerprint Icon and Sliding Text Container */}
        {/* <div className="relative flex items-center gap-2"> 
          <div className="border border-gray-300 px-2 rounded-full hover:border-red-800 transition-colors cursor-pointer" 
          onMouseEnter={() => setShowFingerprintText(true)} onMouseLeave={() => setShowFingerprintText(false)} onClick={handleFingerprintClick} > 
            <i className="bx bx-fingerprint text-sm hover:text-red-800 cursor-pointer"></i> 
          </div> 
        </div> */}
        <p className="relative top-5 text-[10px] text-gray-600 dark:text-gray-300 mb-10">
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
        <h1 className="text-lg text-center font-bold text-gray-900 dark:text-white">{createAccountTitle}</h1>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 text-[9px]">
          <SocialButton provider="google" text={signUpWithGoogle} icon="bx bxl-google" onClick={handleGoogleSignUp} />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-[10px]">{orText}</span>
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
              className="absolute right-3 top-3/4 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img 
                src={showPassword ? "https://img.icons8.com/fluency-systems-regular/48/visible--v1.png" : "https://img.icons8.com/fluency-systems-regular/48/closed-eye.png"} 
                alt={showPassword ? "Hide password" : "Show password"}
                className="w-4 h-4 mb-1"
              />
            </button>
          </div>

          <button
            type="submit"
            className="relative w-full bg-red-900 text-white text-xs font-medium rounded-full px-5 py-2 transition-all hover:bg-red-800"
          >
            {createAccountBtn}
          </button>

          {message && <SystemMessage type={message.type} message={message.text} />}

          <p className="relative text-[7px] text-center text-gray-500 dark:text-gray-400 -top-4">
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

      {/* Terms & Conditions Modal */}
      <TermsAndConditionsModal isOpen={showTermsModal} onAgree={handleTermsAgree} onExit={handleTermsExit} />
    </div>
  );
};

export default Register;
