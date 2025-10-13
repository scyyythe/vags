import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface SoftDeleteConfirmationPopupProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  user?: {
    userStatus?: string;
    scheduledForDeletion?: string;
  };
}

const SoftDeleteConfirmationPopup: React.FC<SoftDeleteConfirmationPopupProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  user,
}) => {
  const { language: selectedLanguage } = useLanguage();
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (user?.userStatus) {
      setStatus(user.userStatus.toLowerCase());
    }
  }, [user?.userStatus]);

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!user?.scheduledForDeletion) return 0;
    const deletionDate = new Date(user.scheduledForDeletion);
    const now = new Date();
    const diffTime = deletionDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();

  // Translated labels
  const title = useAutoTranslation("Schedule Account Deletion", selectedLanguage);
  const description = useAutoTranslation(
    "Are you sure you want to schedule your account for deletion?",
    selectedLanguage
  );
  const notice = useAutoTranslation(
    "IMPORTANT: Your account will be scheduled for deletion in 60 days. You can cancel this anytime by logging in again before the deletion date. After 60 days, your account and all data will be permanently deleted and cannot be recovered.",
    selectedLanguage
  );
  const confirmBtn = useAutoTranslation("Yes, Schedule Deletion", selectedLanguage);
  const cancelBtn = useAutoTranslation("Cancel", selectedLanguage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 overflow-hidden">
      <div className="bg-white rounded-lg py-7 px-10 shadow-xl max-w-md w-full text-center relative">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>

        <h2 className="text-xs font-semibold text-gray-900 mb-3">{title}</h2>
        <p className="text-[10px] text-gray-500 mb-3">{description}</p>

        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
          <p className="text-[9px] text-red-800 leading-relaxed">{notice}</p>
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
            className="px-6 py-2 bg-red-600 text-white text-[10px] rounded-md hover:bg-red-700 transition-colors"
          >
            {confirmBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoftDeleteConfirmationPopup;
