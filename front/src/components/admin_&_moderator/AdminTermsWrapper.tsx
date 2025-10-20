import React, { useState, useEffect } from "react";
import AdminTermsAndConditionsModal from "../modals/AdminTermsAndConditionsModal";

interface AdminTermsWrapperProps {
  children: React.ReactNode;
  role: "admin" | "moderator";
}

const AdminTermsWrapper: React.FC<AdminTermsWrapperProps> = ({ children, role }) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  useEffect(() => {
    // Check if user has already agreed to admin terms
    const adminTermsKey = `admin_terms_agreed_${role}`;
    const hasAgreed = localStorage.getItem(adminTermsKey) === "true";
    
    if (!hasAgreed) {
      setShowTermsModal(true);
    } else {
      setHasAgreedToTerms(true);
    }
  }, [role]);

  const handleTermsAgree = () => {
    // Mark that user has agreed to admin terms
    const adminTermsKey = `admin_terms_agreed_${role}`;
    localStorage.setItem(adminTermsKey, "true");
    setHasAgreedToTerms(true);
    setShowTermsModal(false);
  };

  const handleTermsExit = () => {
    // Redirect to unauthorized page or home if they don't agree
    window.location.href = "/unauthorized";
  };

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
