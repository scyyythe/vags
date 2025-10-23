import React, { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface BanNotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  banData: {
    ban_reason?: string;
    banned_until?: string;
    is_permanent: boolean;
    days_remaining?: number;
  };
}

const BanNotificationPopup: React.FC<BanNotificationPopupProps> = ({
  isOpen,
  onClose,
  banData,
}) => {
  const { language: selectedLanguage } = useLanguage();

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Format ban end date
  const formatBanEndDate = () => {
    if (!banData.banned_until) return "Permanent";
    const banEndDate = new Date(banData.banned_until);
    return banEndDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Translated labels
  const title = useAutoTranslation("Account Banned", selectedLanguage);
  const permanentTitle = useAutoTranslation("Account Permanently Banned", selectedLanguage);
  const temporaryTitle = useAutoTranslation("Account Temporarily Banned", selectedLanguage);
  const permanentDescription = useAutoTranslation(
    "Your account has been permanently banned and cannot be accessed.",
    selectedLanguage
  );
  const temporaryDescription = useAutoTranslation(
    "Your account has been temporarily banned and will be restored after the ban period.",
    selectedLanguage
  );
  const reasonLabel = useAutoTranslation("Reason:", selectedLanguage);
  const banEndLabel = useAutoTranslation("Ban ends:", selectedLanguage);
  const daysRemainingLabel = useAutoTranslation("Days remaining:", selectedLanguage);
  const contactSupportLabel = useAutoTranslation(
    "If you believe this is an error, please contact support.",
    selectedLanguage
  );
  const closeBtn = useAutoTranslation("Close", selectedLanguage);

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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="text-xs font-semibold text-gray-900 mb-3">
          {banData.is_permanent ? permanentTitle : temporaryTitle}
        </h2>
        <p className="text-[10px] text-gray-600 mb-4">
          {banData.is_permanent ? permanentDescription : temporaryDescription}
        </p>

        {/* Ban Details */}
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-[9px] text-red-800 font-medium mb-2">Ban Details:</p>
          
          {banData.ban_reason && (
            <p className="text-[9px] text-red-700 mb-1">
              {reasonLabel} <span className="font-medium">{banData.ban_reason}</span>
            </p>
          )}
          
          {!banData.is_permanent && banData.banned_until && (
            <p className="text-[9px] text-red-700 mb-1">
              {banEndLabel} <span className="font-medium">{formatBanEndDate()}</span>
            </p>
          )}
          
          {!banData.is_permanent && banData.days_remaining !== undefined && (
            <p className="text-[9px] text-red-700">
              {daysRemainingLabel} <span className="font-medium">{banData.days_remaining}</span>
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <p className="text-[9px] text-blue-800 leading-relaxed">{contactSupportLabel}</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-red-700 hover:bg-red-600 text-white text-[10px] px-8 py-2 rounded-full transition-colors duration-200"
          >
            {closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BanNotificationPopup;
