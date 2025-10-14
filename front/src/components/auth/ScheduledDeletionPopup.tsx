import React, { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface ScheduledDeletionPopupProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  userEmail?: string;
  scheduledForDeletion?: string;
}

const ScheduledDeletionPopup: React.FC<ScheduledDeletionPopupProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  userEmail,
  scheduledForDeletion,
}) => {
  const { language: selectedLanguage } = useLanguage();

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!scheduledForDeletion) return 0;
    const deletionDate = new Date(scheduledForDeletion);
    const now = new Date();
    const diffTime = deletionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  // Format deletion date
  const formatDeletionDate = () => {
    if (!scheduledForDeletion) return "Unknown";
    const deletionDate = new Date(scheduledForDeletion);
    return deletionDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Translated labels
  const title = useAutoTranslation("Account Scheduled for Deletion", selectedLanguage);
  const description = useAutoTranslation(
    "Your account is scheduled for deletion. Would you like to reactivate it now?",
    selectedLanguage
  );
  const notice = useAutoTranslation(
    "Once you confirm, your account will be reactivated and the deletion will be cancelled. You can continue using all features.",
    selectedLanguage
  );
  const confirmBtn = useAutoTranslation("Yes, Reactivate Account", selectedLanguage);
  const cancelBtn = useAutoTranslation("Cancel", selectedLanguage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-10 shadow-xl max-w-md w-full text-center relative">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="text-xs font-semibold text-gray-900 mb-3">{title}</h2>
        <p className="text-[10px] text-gray-600 mb-4">{description}</p>

        {userEmail && <p className="text-[9px] text-gray-500 mb-4">Account: {userEmail}</p>}

        {/* Deletion Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
          <p className="text-[9px] text-yellow-800 font-medium mb-2">Deletion Details:</p>
          <p className="text-[9px] text-yellow-700">
            Scheduled for: <span className="font-medium">{formatDeletionDate()}</span>
          </p>
          <p className="text-[9px] text-yellow-700">
            Days remaining: <span className="font-medium">{daysRemaining}</span>
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <p className="text-[9px] text-blue-800 leading-relaxed">{notice}</p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-[10px] text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-md transition-colors"
          >
            {cancelBtn}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white text-[10px] rounded-md hover:bg-blue-700 transition-colors"
          >
            {confirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledDeletionPopup;
