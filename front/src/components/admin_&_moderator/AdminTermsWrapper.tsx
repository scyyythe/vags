import React, { useState, useEffect } from "react";
import AdminTermsAndConditionsModal from "../modals/AdminTermsAndConditionsModal";
import { getLoggedInUserId } from "@/auth/decode";
import apiClient from "@/utils/apiClient";

interface AdminTermsWrapperProps {
  children: React.ReactNode;
  role: "admin" | "moderator";
}

const AdminTermsWrapper: React.FC<AdminTermsWrapperProps> = ({ children, role }) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminTermsStatus = async () => {
      try {
        const userId = getLoggedInUserId();
        if (!userId) {
          setHasAgreedToTerms(false);
          setIsLoading(false);
          return;
        }

        // Fetch user data to check admin_terms_accepted
        const response = await apiClient.get(`/user/${userId}/`);
        const userData = response.data;
        
        if (userData.admin_terms_accepted) {
          setHasAgreedToTerms(true);
        } else {
          setShowTermsModal(true);
        }
      } catch (error) {
        console.error("Error checking admin terms status:", error);
        // If there's an error, assume terms haven't been accepted
        setShowTermsModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminTermsStatus();
  }, []);

  const handleTermsAgree = async () => {
    try {
      const userId = getLoggedInUserId();
      if (!userId) return;

      // Call API to mark admin terms as accepted
      await apiClient.patch(`/user/${userId}/accept-admin-terms/`, {
        admin_terms_accepted: true,
        admin_terms_accepted_at: new Date().toISOString(),
      });

      setHasAgreedToTerms(true);
      setShowTermsModal(false);
    } catch (error) {
      console.error("Failed to accept admin terms:", error);
      // Still close the modal even if API call fails
      setHasAgreedToTerms(true);
      setShowTermsModal(false);
    }
  };

  const handleTermsExit = () => {
    // Redirect to unauthorized page or home if they don't agree
    window.location.href = "/unauthorized";
  };

  // Show loading while checking terms status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until terms are agreed
  if (!hasAgreedToTerms) {
    return (
      <AdminTermsAndConditionsModal
        isOpen={showTermsModal}
        onAgree={handleTermsAgree}
        onExit={handleTermsExit}
      />
    );
  }

  return <>{children}</>;
};

export default AdminTermsWrapper;
