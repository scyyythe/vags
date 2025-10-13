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
import useDeactivateAccount from "@/hooks/mutate/users/useDeactivateAccount";
import useSoftDeleteAccount from "@/hooks/mutate/users/useSoftDeleteAccount";
import ReactivationConfirmationPopup from "@/components/auth/ReactivationConfirmationPopup";
import ScheduledDeletionPopup from "@/components/auth/ScheduledDeletionPopup";
import { useQueryClient } from "@tanstack/react-query";

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
  const [showReactivationPopup, setShowReactivationPopup] = useState(false);
  const [showScheduledDeletionPopup, setShowScheduledDeletionPopup] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<any>(null);

  const { mutate: deactivateAccount } = useDeactivateAccount();
  const { mutate: softDeleteAccount } = useSoftDeleteAccount();
  const queryClient = useQueryClient();

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
  const accountDeactivatedTitle = useAutoTranslation("Account Deactivated", language);
  const accountDeactivatedDesc = useAutoTranslation(
    "Your account is currently deactivated. Please reactivate it to continue.",
    language
  );
  const reactivationSuccessTitle = useAutoTranslation("Account Reactivated", language);
  const reactivationSuccessDesc = useAutoTranslation("Your account has been reactivated successfully!", language);

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
        user_status: string;
        scheduled_for_deletion?: string;
        firebase_token: string;
      }>("token/", formData);

      const { access_token, refresh_token, user_id, email, role, user_status, scheduled_for_deletion, firebase_token } =
        response.data;

      if (!access_token || !refresh_token || !firebase_token) {
        throw new Error("Missing tokens from backend");
      }

      // Check if account is deactivated
      if (user_status && user_status.toLowerCase() === "deactivated") {
        // Store user data for reactivation
        setPendingUserData({
          access_token,
          refresh_token,
          user_id,
          email,
          role,
          firebase_token,
        });

        // Show reactivation popup
        setShowReactivationPopup(true);
        return;
      }

      // Check if account is scheduled for deletion
      if (user_status && user_status.toLowerCase() === "scheduled_for_deletion") {
        // Store user data for reactivation
        setPendingUserData({
          access_token,
          refresh_token,
          user_id,
          email,
          role,
          scheduled_for_deletion,
          firebase_token,
        });

        // Show scheduled deletion popup
        setShowScheduledDeletionPopup(true);
        return;
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

  const handleReactivationConfirm = async () => {
    if (!pendingUserData) return;

    try {
      // First, save tokens and authenticate the user
      localStorage.setItem("access_token", pendingUserData.access_token);
      localStorage.setItem("refresh_token", pendingUserData.refresh_token);
      localStorage.setItem("user_id", pendingUserData.user_id);
      localStorage.setItem("email", pendingUserData.email);
      localStorage.setItem("role", pendingUserData.role);

      // Sign in to Firebase
      await signInWithCustomToken(auth, pendingUserData.firebase_token);

      // Now reactivate the account (user is authenticated)
      deactivateAccount(
        {
          userId: pendingUserData.user_id,
          data: {
            user_status: "active",
            deactivated_at: undefined,
          },
        },
        {
          onSuccess: async () => {
            // Invalidate ALL queries to refresh content visibility
            queryClient.invalidateQueries({ queryKey: ["user", pendingUserData.user_id] });
            queryClient.invalidateQueries({ queryKey: ["userDetails", pendingUserData.user_id] });

            // Invalidate artwork-related queries
            queryClient.invalidateQueries({ queryKey: ["artworks"] });
            queryClient.invalidateQueries({ queryKey: ["popularArtworks"] });
            queryClient.invalidateQueries({ queryKey: ["artCards"] });
            queryClient.invalidateQueries({ queryKey: ["trendingArtworks"] });
            queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });

            // Invalidate auction-related queries
            queryClient.invalidateQueries({ queryKey: ["auctions"] });
            queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
            queryClient.invalidateQueries({ queryKey: ["followedAuctions"] });

            // Invalidate exhibit-related queries
            queryClient.invalidateQueries({ queryKey: ["exhibits"] });
            queryClient.invalidateQueries({ queryKey: ["exhibitCards"] });

            // Invalidate marketplace queries
            queryClient.invalidateQueries({ queryKey: ["marketplace"] });
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            queryClient.invalidateQueries({ queryKey: ["followedArtworksOnSale"] });

            // Invalidate search and filter queries
            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ["filter"] });

            // Invalidate all queries to be safe
            queryClient.invalidateQueries();

            // Close popup and redirect
            setShowReactivationPopup(false);
            setPendingUserData(null);

            toast.success(reactivationSuccessTitle, {
              description: reactivationSuccessDesc,
              closeButton: true,
            });

            // Redirect based on role
            if (pendingUserData.role === "Admin") {
              navigate("/admin");
            } else if (pendingUserData.role === "Moderator") {
              navigate("/moderator");
            } else {
              navigate("/explore");
            }
          },
          onError: () => {
            // If reactivation fails, clear the tokens and show error
            localStorage.clear();
            toast.error(accountDeactivatedTitle, {
              description: accountDeactivatedDesc,
              closeButton: true,
            });
          },
        }
      );
    } catch (error) {
      console.error("Reactivation failed:", error);
      // Clear tokens if there's an error
      localStorage.clear();
      toast.error(accountDeactivatedTitle, {
        description: accountDeactivatedDesc,
        closeButton: true,
      });
    }
  };

  const handleReactivationCancel = () => {
    setShowReactivationPopup(false);
    setPendingUserData(null);
    // Clear form
    setFormData({ email: "", password: "" });
  };

  const handleScheduledDeletionConfirm = async () => {
    if (!pendingUserData) return;

    try {
      // First, save tokens and authenticate the user
      localStorage.setItem("access_token", pendingUserData.access_token);
      localStorage.setItem("refresh_token", pendingUserData.refresh_token);
      localStorage.setItem("user_id", pendingUserData.user_id);
      localStorage.setItem("email", pendingUserData.email);
      localStorage.setItem("role", pendingUserData.role);

      // Sign in to Firebase
      await signInWithCustomToken(auth, pendingUserData.firebase_token);

      // Now cancel the scheduled deletion (user is authenticated)
      softDeleteAccount(
        {
          userId: pendingUserData.user_id,
          data: {
            action: "cancel_deletion",
          },
        },
        {
          onSuccess: async () => {
            // Invalidate ALL queries to refresh content visibility
            queryClient.invalidateQueries({ queryKey: ["user", pendingUserData.user_id] });
            queryClient.invalidateQueries({ queryKey: ["userDetails", pendingUserData.user_id] });

            // Invalidate artwork-related queries
            queryClient.invalidateQueries({ queryKey: ["artworks"] });
            queryClient.invalidateQueries({ queryKey: ["popularArtworks"] });
            queryClient.invalidateQueries({ queryKey: ["artCards"] });
            queryClient.invalidateQueries({ queryKey: ["trendingArtworks"] });
            queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });

            // Invalidate auction-related queries
            queryClient.invalidateQueries({ queryKey: ["auctions"] });
            queryClient.invalidateQueries({ queryKey: ["biddingArtworks"] });
            queryClient.invalidateQueries({ queryKey: ["followedAuctions"] });

            // Invalidate exhibit-related queries
            queryClient.invalidateQueries({ queryKey: ["exhibits"] });
            queryClient.invalidateQueries({ queryKey: ["exhibitCards"] });

            // Invalidate marketplace queries
            queryClient.invalidateQueries({ queryKey: ["marketplace"] });
            queryClient.invalidateQueries({ queryKey: ["wishlist"] });
            queryClient.invalidateQueries({ queryKey: ["followedArtworksOnSale"] });

            // Invalidate search and filter queries
            queryClient.invalidateQueries({ queryKey: ["search"] });
            queryClient.invalidateQueries({ queryKey: ["filter"] });

            // Invalidate all queries to be safe
            queryClient.invalidateQueries();

            // Close popup and redirect
            setShowScheduledDeletionPopup(false);
            setPendingUserData(null);

            toast.success("Account deletion cancelled. Account is now active!", {
              closeButton: true,
            });

            // Close login modal and redirect based on role
            closeLoginModal();
            if (pendingUserData.role === "Admin") {
              navigate("/admin");
            } else if (pendingUserData.role === "Moderator") {
              navigate("/moderator");
            } else {
              navigate("/explore");
            }
          },
          onError: () => {
            // If cancellation fails, clear the tokens and show error
            localStorage.clear();
            toast.error("Account Deletion Scheduled", {
              description: "Failed to cancel account deletion. Please try again.",
              closeButton: true,
            });
          },
        }
      );
    } catch (error) {
      console.error("Scheduled deletion cancellation failed:", error);
      // Clear tokens if there's an error
      localStorage.clear();
      toast.error("Account Deletion Scheduled", {
        description: "Failed to cancel account deletion. Please try again.",
        closeButton: true,
      });
    }
  };

  const handleScheduledDeletionCancel = () => {
    setShowScheduledDeletionPopup(false);
    setPendingUserData(null);
    // Clear form
    setFormData({ email: "", password: "" });
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

      {/* Reactivation Confirmation Popup */}
      <ReactivationConfirmationPopup
        isOpen={showReactivationPopup}
        onConfirm={handleReactivationConfirm}
        onCancel={handleReactivationCancel}
        userEmail={pendingUserData?.email}
      />

      {/* Scheduled Deletion Popup */}
      <ScheduledDeletionPopup
        isOpen={showScheduledDeletionPopup}
        onConfirm={handleScheduledDeletionConfirm}
        onCancel={handleScheduledDeletionCancel}
        userEmail={pendingUserData?.email}
        scheduledForDeletion={pendingUserData?.scheduled_for_deletion}
      />
    </div>
  );
};

export default Login;
