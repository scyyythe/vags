import React, { useState, useEffect } from "react";
import { Plus, Maximize2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SecurityNote from "./SecurityNote";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

interface PaymentAccount {
  id: string;
  type: "paypal" | "stripe" | "bank" | "gcash" | "payoneer" | "card";
  name: string;
  accountInfo: string;
  qrCodeUrl?: string;
  maskedInfo: string;
  isDefault: boolean;
  status: "verified" | "pending" | "not_verified";
  dateAdded: string;
  stripeAccountId?: string;
}

interface GCashFormProps {
  number?: string;
  qrCodeUrl?: string;
  onNumberChange?: (value: string) => void;
  accounts?: PaymentAccount[];
  onEditAccount?: (account: PaymentAccount) => void;
}

const GCashForm: React.FC<GCashFormProps> = ({
  number,
  qrCodeUrl = "/pics/qr.jpg",
  onNumberChange,
  accounts = [],
  onEditAccount,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  // Language and translation
  const { language } = useLanguage();
  const scanToPayText = useAutoTranslation("Scan to Pay via QR Code", language);
  const gcashQrCodeText = useAutoTranslation("GCash QR Code", language);
  const expandQrText = useAutoTranslation("Expand QR", language);
  const gcashMobileNumberText = useAutoTranslation("GCash Mobile Number", language);
  const defaultText = useAutoTranslation("Default", language);
  const updateAccountText = useAutoTranslation("Update Account", language);
  const expandedQrCodeText = useAutoTranslation("Expanded QR Code", language);
  const closeExpandedQrText = useAutoTranslation("Close expanded QR", language);
  const noGcashAccountText = useAutoTranslation("No GCash Account Added", language);
  const addGcashDescText = useAutoTranslation("Add your GCash QR or mobile number to receive payments easily", language);
  const setupGcashText = useAutoTranslation("Set Up GCash Account", language);

  // Disable scrolling when expanded
  useEffect(() => {
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  // Show saved GCash accounts using existing design or empty state
  if (accounts.length > 0) {
    console.log("GCashForm: Rendering saved accounts");
    return (
      <>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-card px-10 pb-6 space-y-4">
              {/* Header with Default Badge and Update Account */}
              <div className="flex items-center justify-end gap-2 pb-3">
                {account.isDefault && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-medium">
                    {defaultText}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => onEditAccount?.(account)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-green-700 rounded-full text-[11px] font-medium 
                          active:scale-[0.98] transition-all duration-200 ease-in-out"
                >
                  <i className="bx bx-edit text-[13px]"></i>
                  <p className="hover:underline">{updateAccountText}</p>
                </button>
              </div>

              {/* QR Code Section */}
              <div className="flex justify-center mb-2.5">
                <div className="relative inline-block group">
                  <p className="text-gray-700 text-[11px] text-center mb-2">{scanToPayText}</p>

                  {/* QR Image (Click to Expand) */}
                  <img
                    src={account.qrCodeUrl || "/pics/qr.jpg"}
                    alt={gcashQrCodeText}
                    className="w-60 h-60 object-cover rounded-md border border-gray-200 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                  />

                  {/* Expand Button (Hover to show) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsExpanded(true);
                    }}
                    aria-label={expandQrText}
                    className="absolute bottom-2 right-2 rounded-full p-2 bg-black/70 text-white 
                               opacity-0 scale-95 pointer-events-none transition-all duration-200 
                               group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* GCash Number */}
              <div className="text-center space-y-2">
                <p className="text-gray-700 text-[10px]">{gcashMobileNumberText}</p>
                <p className="text-[13px] font-semibold text-black">{account.accountInfo}</p>
              </div>
            </div>
          ))}
        </div>

        <SecurityNote type="gcash" />

        {/* Expanded QR Modal */}
        {isExpanded && (
          <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center overflow-hidden">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-6 z-[60] bg-white rounded-full p-1.5 shadow-md transition-colors duration-200"
              aria-label={closeExpandedQrText}
            >
              <X className="w-4 h-4 text-gray-900" />
            </button>

            <div className="relative w-full h-full px-4 py-16 flex justify-center items-center">
              <img
                src={accounts[0]?.qrCodeUrl || "/pics/qr.jpg"}
                alt={expandedQrCodeText}
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Empty state if no accounts are saved
  if (accounts.length === 0) {
    console.log("GCashForm: Rendering empty state");
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-muted-foreground/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.485 2 2 6.485 2 12s4.485 10 10 10 10-4.485 10-10S17.515 2 12 2zm.75 5v4.25H17v1.5h-4.25V17h-1.5v-4.25H7v-1.5h4.25V7h1.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground mb-2">{noGcashAccountText}</h3>
            <p className="text-xs text-muted-foreground">
              {addGcashDescText}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings/billing")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-[11px] transition-colors"
          >
            <Plus size={14} />
            {setupGcashText}
          </button>
        </div>
      </div>
    );
  }

  // Fallback - this should never happen but just in case
  console.log("GCashForm: Fallback case - no accounts and no empty state");
  return null;
};

export default GCashForm;
