import type React from "react";
import { Plus } from "lucide-react";
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

interface PayPalFormProps {
  email?: string;
  connectedDate?: string;
  accounts?: PaymentAccount[];
  onEditAccount?: (account: PaymentAccount) => void;
}

const PayPalForm: React.FC<PayPalFormProps> = ({
  email,
  connectedDate = "January 15, 2025",
  accounts = [],
  onEditAccount,
}) => {
  const navigate = useNavigate();

  // Language and translation
  const { language } = useLanguage();
  const paypalAccountText = useAutoTranslation("PayPal Account", language);
  const connectedText = useAutoTranslation("Connected", language);
  const defaultText = useAutoTranslation("Default", language);
  const emailAddressText = useAutoTranslation("Email Address", language);
  const connectedSinceText = useAutoTranslation("Connected Since", language);
  const updateAccountText = useAutoTranslation("Update Account", language);
  const noPaypalAccountText = useAutoTranslation("No PayPal Account Connected", language);
  const connectPaypalDescText = useAutoTranslation("Connect your PayPal account to enable quick and secure payments", language);
  const setupPaypalText = useAutoTranslation("Set Up PayPal Account", language);

  // Show saved PayPal accounts using existing design or empty state
  if (accounts.length > 0) {
    return (
      <div className="space-y-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-card border border-border rounded-lg px-10 py-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-blue-700">{paypalAccountText}</h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {connectedText}
                </span>
                {account.isDefault && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-medium">
                    {defaultText}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {emailAddressText}
                </label>
                <p className="text-xs text-foreground font-medium mt-1">{account.accountInfo}</p>
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  {connectedSinceText}
                </label>
                <p className="text-xs text-foreground font-medium mt-1">
                  {new Date(account.dateAdded).toLocaleDateString(language === "EN" ? "en-US" : language.toLowerCase(), {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="pt-4 border-t border-border text-end">
                <button
                  type="button"
                  onClick={() => onEditAccount?.(account)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-blue-700 rounded-full text-[11px] font-medium 
                          active:scale-[0.98] transition-all duration-200 ease-in-out"
                >
                  <i className="bx bx-edit text-[13px]"></i>
                  <p className="hover:underline">{updateAccountText}</p>
                </button>
              </div>
            </div>
            <SecurityNote type="paypal" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state when no account is connected and no email is provided
  if (accounts.length === 0 && !email) {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-muted-foreground/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.653h8.58c2.834 0 4.79.828 5.644 2.395.77 1.413.688 3.177-.23 4.97-.988 1.93-2.73 3.348-4.917 4.004-1.316.395-2.853.592-4.574.592H8.38a.77.77 0 0 0-.76.653l-.542 3.426a.641.641 0 0 1-.633.74h-.37z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground mb-2">{noPaypalAccountText}</h3>
            <p className="text-xs text-muted-foreground">
              {connectPaypalDescText}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings/billing")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-[11px] transition-colors"
          >
            <Plus size={14} />
            {setupPaypalText}
          </button>
        </div>
      </div>
    );
  }
};

export default PayPalForm;
