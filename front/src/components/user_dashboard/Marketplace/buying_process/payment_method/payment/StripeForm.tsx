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

interface StripeFormProps {
  email?: string;
  accountId?: string;
  connectedDate?: string;
  accounts?: PaymentAccount[];
  onEditAccount?: (account: PaymentAccount) => void;
}

const StripeForm: React.FC<StripeFormProps> = ({
  email = "sample@gmail.com",
  accountId = "acct_1234567890",
  connectedDate = "January 20, 2025",
  accounts = [],
  onEditAccount,
}) => {
  const navigate = useNavigate();

  // Language and translation
  const { language } = useLanguage();
  const stripeAccountText = useAutoTranslation("Stripe Account", language);
  const connectedText = useAutoTranslation("Connected", language);
  const defaultText = useAutoTranslation("Default", language);
  const emailAddressText = useAutoTranslation("Email Address", language);
  const accountIdText = useAutoTranslation("Account ID", language);
  const connectedSinceText = useAutoTranslation("Connected Since", language);
  const updateAccountText = useAutoTranslation("Update Account", language);
  const noStripeAccountText = useAutoTranslation("No Stripe Account Connected", language);
  const connectStripeDescText = useAutoTranslation("Connect your Stripe account to accept payments and manage subscriptions", language);
  const setupStripeText = useAutoTranslation("Set Up Stripe Account", language);

  // Show saved Stripe accounts using existing design or empty state
  if (!email && accounts.length > 0) {
    return (
      <div className="space-y-4">
        {accounts.map((account) => {
          // Translation for fetched data
          const translatedEmail = useAutoTranslation(account.name || "", language);
          const translatedAccountId = useAutoTranslation(account.stripeAccountId || accountId, language);
          
          return (
          <div key={account.id} className="bg-card dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg px-10 py-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border dark:border-gray-600">
              <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-400">{stripeAccountText}</h3>
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
                <label className="text-[10px] font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide">
                  {emailAddressText}
                </label>
                <p className="text-xs text-foreground dark:text-gray-100 font-medium mt-1">{translatedEmail}</p>
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide">
                  {accountIdText}
                </label>
                <p className="text-xs text-foreground dark:text-gray-100 font-mono mt-1">{translatedAccountId}</p>
              </div>

              <div>
                <label className="text-[10px] font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide">
                  {connectedSinceText}
                </label>
                <p className="text-xs text-foreground dark:text-gray-100 font-medium mt-1">
                  {new Date(account.dateAdded).toLocaleDateString(language === "EN" ? "en-US" : language.toLowerCase(), {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="pt-4 border-t border-border dark:border-gray-600 text-end">
                <button
                  type="button"
                  onClick={() => onEditAccount?.(account)}
                  className="inline-flex items-center gap-2 px-4 py-1.5  text-violet-800 dark:text-violet-400 rounded-full text-[11px] font-medium 
                      active:scale-[0.98] transition-all duration-200 ease-in-out"
                >
                  <i className="bx bx-edit text-[13px]"></i>
                  <p className=" hover:underline">{updateAccountText}</p>
                </button>
              </div>
            </div>
          </div>
          );
        })}
        <SecurityNote type="stripe" />
      </div>
    );
  }

  // Empty state when no account is connected
  if (!email) {
    return (
      <div className="space-y-4">
        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-muted-foreground/40 dark:text-gray-500/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground dark:text-gray-100 mb-2">{noStripeAccountText}</h3>
            <p className="text-xs text-muted-foreground dark:text-gray-300">
              {connectStripeDescText}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings/billing")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-[11px] transition-colors"
          >
            <Plus size={14} />
            {setupStripeText}
          </button>
        </div>
      </div>
    );
  }
};

export default StripeForm;
