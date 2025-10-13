import React from "react";
import useUserDetails from "@/hooks/users/useUserDetails";
import { getLoggedInUserId } from "@/auth/decode";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useLanguage } from "@/context/LanguageContext";

interface AccountStatusCheckProps {
  children: React.ReactNode;
}

const AccountStatusCheck: React.FC<AccountStatusCheckProps> = ({ children }) => {
  const userId = getLoggedInUserId();
  const { userStatus, deactivatedAt, isLoading } = useUserDetails(userId);
  const { language: selectedLanguage } = useLanguage();

  const accountDeactivatedTitle = useAutoTranslation("Account Deactivated", selectedLanguage);
  const accountDeactivatedMessage = useAutoTranslation(
    "Your account has been deactivated. Please contact support or reactivate your account to continue using our services.",
    selectedLanguage
  );
  const reactivateAccountBtn = useAutoTranslation("Reactivate Account", selectedLanguage);
  const contactSupportBtn = useAutoTranslation("Contact Support", selectedLanguage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userStatus === "deactivated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{accountDeactivatedTitle}</h2>
            <p className="text-gray-600 mb-6">{accountDeactivatedMessage}</p>
            {deactivatedAt && (
              <p className="text-sm text-gray-500 mb-4">
                Deactivated on: {new Date(deactivatedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                // This will trigger the reactivation logic in AccountDetails
                window.location.href = "/user-dashboard/settings";
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              {reactivateAccountBtn}
            </button>

            <button
              onClick={() => {
                // Navigate to contact support page or open email client
                window.location.href = "mailto:support@example.com";
              }}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              {contactSupportBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccountStatusCheck;
