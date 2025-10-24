import React from "react";
import { X, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface PaymentSetupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentSetupPopup: React.FC<PaymentSetupPopupProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const titleText = useAutoTranslation("Payment Account Required", language);
  const messageText = useAutoTranslation("Please set up a payment account first before making a purchase", language);
  const setupButtonText = useAutoTranslation("Set up Payment Account", language);
  const cancelButtonText = useAutoTranslation("Cancel", language);
  const descriptionText = useAutoTranslation("You need to add a payment method to complete purchases on our platform", language);

  if (!isOpen) return null;

  const handleSetupPayment = () => {
    onClose();
    navigate("/settings?tab=payment-accounts");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {titleText}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {messageText}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {descriptionText}
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 py-2"
          >
            {cancelButtonText}
          </Button>
          <Button
            onClick={handleSetupPayment}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {setupButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSetupPopup;
