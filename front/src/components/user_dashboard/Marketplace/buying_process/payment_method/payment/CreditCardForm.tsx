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

interface CreditCardFormProps {
  cardNumber?: string;
  expiryDate?: string;
  nameOnCard?: string;
  country?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  cardType?: "visa" | "mastercard" | "amex" | "discover";
  isDefault?: boolean;
  accounts?: PaymentAccount[];
  onEditAccount?: (account: PaymentAccount) => void;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  cardNumber,
  expiryDate,
  nameOnCard,
  country,
  addressLine1,
  city,
  state,
  postalCode,
  cardType = "visa",
  isDefault = true,
  accounts = [],
  onEditAccount,
}) => {
  const navigate = useNavigate();

  // Language and translation
  const { language } = useLanguage();
  const visaText = useAutoTranslation("Visa", language);
  const mastercardText = useAutoTranslation("Mastercard", language);
  const amexText = useAutoTranslation("Amex", language);
  const discoverText = useAutoTranslation("Discover", language);
  const cardText = useAutoTranslation("Card", language);
  const defaultText = useAutoTranslation("Default", language);
  const cardNumberText = useAutoTranslation("Card Number", language);
  const expiresText = useAutoTranslation("Expires", language);
  const cardholderNameText = useAutoTranslation("Cardholder Name", language);
  const billingAddressText = useAutoTranslation("Billing Address", language);
  const updateAccountText = useAutoTranslation("Update Account", language);
  const noCreditCardText = useAutoTranslation("No Credit Card Saved", language);
  const addCreditCardDescText = useAutoTranslation("Add a credit card to make purchases quickly and securely", language);
  const addCreditCardText = useAutoTranslation("Add Credit Card", language);

  // Helper function to get translated card type
  const getTranslatedCardType = (type: string) => {
    switch (type.toLowerCase()) {
      case "visa":
        return visaText;
      case "mastercard":
        return mastercardText;
      case "amex":
        return amexText;
      case "discover":
        return discoverText;
      default:
        return type;
    }
  };

  // Mask the card number, showing only last 4 digits
  const maskedCardNumber = `•••• •••• •••• 5432${cardNumber.slice(-4)}`;

  const cardIcons = {
    visa: (
      <svg className="w-6 h-4" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#1434CB" />
        <path d="M20.5 11h-3.2l-2 10h3.2l2-10z" fill="white" />
      </svg>
    ),
    mastercard: (
      <svg className="w-6 h-4" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#EB001B" />
        <circle cx="18" cy="16" r="8" fill="#FF5F00" />
        <circle cx="30" cy="16" r="8" fill="#F79E1B" />
      </svg>
    ),
    amex: (
      <svg className="w-6 h-4" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#006FCF" />
      </svg>
    ),
    discover: (
      <svg className="w-8 h-6" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#FF6000" />
      </svg>
    ),
  };

  // Show saved cards using existing design or empty state
  if (!cardNumber && accounts.length > 0) {
    return (
      <div className="space-y-4">
        {accounts.map((account, index) => {
          // Translation for fetched data
          const translatedCardholderName = useAutoTranslation(account.name || "", language);
          const translatedCountry = useAutoTranslation(country || "", language);
          const translatedAddressLine1 = useAutoTranslation(addressLine1 || "215, Sitio Cabutoy, Pooc, Talisay", language);
          const translatedCityState = useAutoTranslation(`${city || "Cebu"}, ${state || "Philippines"} ${postalCode || "6045"}`, language);
          
          return (
          <div key={account.id}>
            <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg px-10 py-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border dark:border-gray-600">
                <div className="flex items-center gap-3">
                  {cardIcons[cardType]}
                  <h3 className="text-sm font-semibold text-foreground dark:text-gray-100 capitalize">{getTranslatedCardType(cardType)} {cardText}</h3>
                </div>
                {account.isDefault && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-medium">
                    {defaultText}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide">
                      {cardNumberText}
                    </label>
                    <p className="text-xs text-foreground dark:text-gray-100 font-mono font-medium mt-1">{account.maskedInfo}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide">
                      {expiresText}
                    </label>
                    <p className="text-xs text-foreground dark:text-gray-100 font-mono font-medium mt-1">03 / 23 / 26</p>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide">
                    {cardholderNameText}
                  </label>
                  <p className="text-xs text-foreground dark:text-gray-100 font-medium mt-1">{translatedCardholderName}</p>
                </div>

                <div className="pt-2 border-t border-border dark:border-gray-600">
                  <label className="text-[10px] font-medium text-muted-foreground dark:text-gray-400 uppercase tracking-wide mb-2 block">
                    {billingAddressText}
                  </label>
                  <div className="text-xs text-foreground dark:text-gray-100 space-y-0.5">
                    <p>{translatedAddressLine1}</p>
                    <p>{translatedCityState}</p>
                    <p>{translatedCountry}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border dark:border-gray-600 text-end">
                  <button
                    type="button"
                    onClick={() => onEditAccount?.(account)}
                    className="inline-flex items-center gap-2 px-4 py-1.5 text-black dark:text-gray-100 rounded-full text-[11px] font-medium 
                            active:scale-[0.98] transition-all duration-200 ease-in-out"
                  >
                    <i className="bx bx-edit text-[13px]"></i>
                    <p className="hover:underline">{updateAccountText}</p>
                  </button>
                </div>
              </div>
            </div>

            <SecurityNote type="credit-card" />
          </div>
          );
        })}
      </div>
    );
  }

  // Empty state when no card is saved
  if (!cardNumber) {
    return (
      <div className="space-y-4">
        <div className="bg-card dark:bg-gray-800 border border-border dark:border-gray-600 rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-muted-foreground/40 dark:text-gray-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground dark:text-gray-100 mb-2">{noCreditCardText}</h3>
            <p className="text-xs text-muted-foreground dark:text-gray-300">{addCreditCardDescText}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings/billing")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-[11px] transition-colors"
          >
            <Plus size={14} />
            {addCreditCardText}
          </button>
        </div>
      </div>
    );
  }
};

export default CreditCardForm;
