import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../components/page/InputField";
import SocialButton from "../components/page/SocialButton";
import { useModal } from "../context/ModalContext";
import apiClient from "../utils/apiClient";
import SystemMessage from "../components/page/SystemMessage";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

// Translation hooks
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";

const Login = ({ closeLoginModal }: { closeLoginModal: () => void }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setShowRegisterModal, setShowForgotPasswordModal } = useModal();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Disable scrolling when the modal opens
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when the modal unmounts (closes)
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);


  const [showFingerprintText, setShowFingerprintText] = useState(false);

  // language context
  const { language } = useLanguage();

  // Translate static texts
  const notMember = useAutoTranslation("Not a member?", language);
  const signUp = useAutoTranslation("Sign up!", language);
  const welcomeTitle = useAutoTranslation("Hi, Welcome Back!", language);
  const welcomeSubtitle = useAutoTranslation("Start your day with us.", language);
  const signInWithGoogle = useAutoTranslation("Sign In with Google", language);
  const orText = useAutoTranslation("Or", language);
  const emailLabel = useAutoTranslation("Email Address", language);
  const passwordLabel = useAutoTranslation("Password", language);
  const forgotPassword = useAutoTranslation("Forgot Password?", language);
  const loginBtn = useAutoTranslation("Login", language);

  // Translate all toast messages
  const missingInfoTitle = useAutoTranslation("Missing information", language);
  const missingInfoDesc = useAutoTranslation("Please fill in all required fields.", language);
  const loginSuccessTitle = useAutoTranslation("Login successful!", language);
  const loginSuccessDesc = useAutoTranslation("You are now logged in.", language);
  const firebaseSuccessTitle = useAutoTranslation("Firebase login successful!", language);
  const firebaseSuccessDesc = useAutoTranslation("Welcome back!", language);
  const loginFailedTitle = useAutoTranslation("Login failed", language);
  const loginFailedDesc = useAutoTranslation("Please check your credentials and try again.", language);
  const googleLoginFailedTitle = useAutoTranslation("Google login failed", language);
  const googleLoginFailedDesc = useAutoTranslation("Google authentication was unsuccessful.", language);
  const googleLoginErrorDesc = useAutoTranslation("Please try again later.", language);
  const googleMissingTokenDesc = useAutoTranslation("Missing tokens in response.", language);

  interface GoogleLoginResponse {
    access_token: string;
    refresh_token: string;
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      username: string;
    };
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setMessage(null);

  if (!formData.email || !formData.password) {
    toast.error(missingInfoTitle, {
      description: missingInfoDesc,
      closeButton: true,
    });
    return;
  }

  try {
    const response = await apiClient.post<{
      access_token: string;
      refresh_token: string;
      user_id: string;
      email: string;
      role: string;
      firebase_token: string;
    }>("token/", formData);

    const {
      access_token,
      refresh_token,
      user_id,
      email,
      role,
      firebase_token,
    } = response.data;

    if (!access_token || !refresh_token || !firebase_token) {
      throw new Error("Missing tokens from backend");
    }

    // Save Django tokens
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    localStorage.setItem("user_id", user_id);
    localStorage.setItem("email", email);
    localStorage.setItem("role", role);

    // Sign in to Firebase with the custom token
    await signInWithCustomToken(auth, firebase_token);

    toast.success(loginSuccessTitle, {
      description: loginSuccessDesc,
      closeButton: true,
    });

    // Redirect based on role
    if (role === "Admin") {
      navigate("/admin");
    } else if (role === "Moderator") {
      navigate("/moderator");
    } else {
      navigate("/explore");
    }

  } catch (err: any) {
    console.error("Login failed:", err);
    toast.error(loginFailedTitle, {
      description: err.message || loginFailedDesc,
      closeButton: true,
    });
  }
};

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const googleToken = response.access_token;

        const { data }: { data: GoogleLoginResponse } = await apiClient.post("user/google-login/", {
          google_token: googleToken,
        });

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          localStorage.setItem("email", data.user.email);
          localStorage.setItem("user_id", data.user.id);

          toast.success(loginSuccessTitle, {
            description: firebaseSuccessDesc,
            closeButton: true,
          });

          closeLoginModal();
          navigate("/explore");
        } else {
          toast.error(googleLoginFailedTitle, {
            description: googleMissingTokenDesc,
            closeButton: true,
          });
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast.error(googleLoginFailedTitle, {
          description: googleLoginErrorDesc,
          closeButton: true,
        });
      }
    },
    onError: (error) => {
      console.error("Google login error", error);
      toast.error(googleLoginFailedTitle, {
        description: googleLoginFailedDesc,
        closeButton: true,
      });
    },
  });

  const handleFingerprintClick = () => {
    navigate("/fingerprint-auth");
  };

  return (
    <div className="w-full flex flex-col justify-center py-8 px-14 md:py-8 md:px-14 lg:py-8 lg:px-14 bg-white rounded-2xl">
      <div className="flex justify-end">
        {/* <div className="relative bottom-2 flex items-center gap-2">
          <div
            className="border border-gray-300 px-2 rounded-full mb-1 hover:border-red-800 transition-colors cursor-pointer"
            onMouseEnter={() => setShowFingerprintText(true)}
            onMouseLeave={() => setShowFingerprintText(false)}
            onClick={handleFingerprintClick}
          >
            <i className="bx bx-fingerprint text-sm hover:text-red-800 cursor-pointer"></i>
          </div>
        </div> */}

        {/* Not a Member Text */}
        <p className="text-[10px] text-gray-600 mb-6">
          {notMember}{" "}
          <button
            onClick={() => {
              closeLoginModal();
              setShowRegisterModal(true);
            }}
            className="text-red-800 hover:text-red-600 font-medium"
          >
            {signUp}
          </button>
        </p>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold mb-2">{welcomeTitle}</h1>
        <p className="text-gray-600 text-[11px]">{welcomeSubtitle}</p>
      </div>

      {error && <p className="text-red-600 text-xs text-center mb-4">{error}</p>}

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 text-[9px]">
          <SocialButton
            provider="google"
            text={signInWithGoogle}
            icon="bx bxl-google"
            onClick={() => handleGoogleLogin()}
          />
        </div>

        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-gray-500"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-[10px]">{orText}</span>
          <div className="flex-grow border-t border-gray-500"></div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <InputField
            type="email"
            label={emailLabel}
            placeholder={emailLabel}
            icon="bx bx-at"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="relative">
            <InputField
              type={showPassword ? "text" : "password"}
              label={passwordLabel}
              placeholder={passwordLabel}
              icon="bx bx-lock-alt"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={showPassword ? "bx bx-hide" : "bx bx-show"} style={{ fontSize: "15px" }}></i>
            </button>
            <div className="relative flex justify-between text-[9px] -top-[60px]">
              <span></span>
              <button
                type="button"
                onClick={() => {
                  closeLoginModal();
                  setShowForgotPasswordModal(true);
                }}
                className="text-black hover:text-red-700"
              >
                {forgotPassword}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-900 text-white text-xs font-medium rounded-full px-5 py-2 transition-all hover:bg-red-800"
          >
            {loginBtn}
          </button>
          {message && <SystemMessage type={message.type} message={message.text} />}
        </form>
      </div>
    </div>
  );
};

export default Login;
