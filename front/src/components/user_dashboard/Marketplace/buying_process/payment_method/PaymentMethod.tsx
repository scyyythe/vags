import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { PaymentFormData, PaymentMethodProps, PaymentAccount } from "@/components/types/payment";
import PaymentMethodSelector from "./payment/PaymentMethodSelector";
import PayPalForm from "./payment/PayPalForm";
import GCashForm from "./payment/GCashForm";
import StripeForm from "./payment/StripeForm";
import CreditCardForm from "./payment/CreditCardForm";
import Header from "@/components/user_dashboard/navbar/Header";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const PaymentMethod: React.FC<PaymentMethodProps> = ({ accounts = [], loading = false, onBack, onContinue }) => {
  console.log("PaymentMethod received accounts:", accounts);
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: "paypal",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    nameOnCard: "",
    country: "Philippines",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    saveCard: false,
    paypalEmail: "",
    paypalPassword: "",
    rememberPayPal: false,
    gcashNumber: "",
    gcashPin: "",
    stripeEmail: "",
  });

  const navigate = useNavigate();
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);

  // Language and translation
  const { language } = useLanguage();
  const paymentMethodText = useAutoTranslation("Payment Method", language);
  const paymentDetailsText = useAutoTranslation("Payment Details", language);
  const noteText = useAutoTranslation("Note:", language);
  const shippingAddressSharedText = useAutoTranslation("Your shipping address is only shared with the artist after your complete payment.", language);
  const saveAndContinueText = useAutoTranslation("Save and Continue", language);

  // Populate form with selected account data
  const populateFormWithAccount = useCallback((account: PaymentAccount) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: account.type === "card" ? "credit-card" : (account.type as any),
      ...(account.type === "paypal" && { paypalEmail: account.accountInfo }),
      ...(account.type === "gcash" && { gcashNumber: account.accountInfo }),
      ...(account.type === "stripe" && { stripeEmail: account.accountInfo }),
      ...(account.type === "card" && { cardNumber: account.accountInfo }),
    }));
  }, []);

  // Auto-select default account when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const defaultAccount = accounts.find((acc) => acc.isDefault);
      if (defaultAccount) {
        setSelectedAccount(defaultAccount);
        // Pre-populate form with default account
        populateFormWithAccount(defaultAccount);
      }
    }
  }, [accounts, populateFormWithAccount]); // Include populateFormWithAccount dependency

  // Identify selected payment details
  const selectedPaymentMethod = {
    type:
      formData.paymentMethod === "paypal"
        ? "PayPal"
        : formData.paymentMethod === "gcash"
        ? "GCash"
        : formData.paymentMethod === "stripe"
        ? "Stripe"
        : "Credit Card",
    details:
      formData.paymentMethod === "paypal"
        ? formData.paypalEmail
        : formData.paymentMethod === "gcash"
        ? formData.gcashNumber
        : formData.paymentMethod === "stripe"
        ? formData.stripeEmail
        : formData.cardNumber,
  };

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onContinue(formData);
    navigate("/reviewpurchase", { state: { selectedPaymentMethod } });
  };

  const handleEditAccount = (account: PaymentAccount) => {
    // Navigate to settings billing page to edit the account
    navigate("/settings/billing");
  };

  // Determine if an account is set up (used for enabling/disabling the button)
  const hasAccountSetup = () => {
    // Check if there are existing accounts for the selected payment method
    const existingAccounts = accounts.filter((acc) => {
      switch (formData.paymentMethod) {
        case "paypal":
          return acc.type === "paypal";
        case "gcash":
          return acc.type === "gcash";
        case "stripe":
          return acc.type === "stripe";
        case "credit-card":
          return acc.type === "card";
        default:
          return false;
      }
    });

    // If there are existing accounts, allow continue
    if (existingAccounts.length > 0) {
      return true;
    }

    // Otherwise, check if form fields are filled (for new accounts)
    switch (formData.paymentMethod) {
      case "paypal":
        return !!formData.paypalEmail;
      case "gcash":
        return !!formData.gcashNumber;
      case "stripe":
        return !!formData.stripeEmail;
      case "credit-card":
        return !!formData.cardNumber;
      default:
        return false;
    }
  };

  const renderPaymentForm = () => {
    switch (formData.paymentMethod) {
      case "paypal":
        return (
          <PayPalForm
            email={formData.paypalEmail}
            accounts={accounts.filter((acc) => acc.type === "paypal")}
            onEditAccount={handleEditAccount}
          />
        );
      case "gcash":
        return (
          <GCashForm
            number={formData.gcashNumber}
            onNumberChange={(value) => handleInputChange("gcashNumber", value)}
            accounts={accounts.filter((acc) => acc.type === "gcash")}
            onEditAccount={handleEditAccount}
          />
        );
      case "stripe":
        return (
          <StripeForm
            email={formData.stripeEmail}
            accounts={accounts.filter((acc) => acc.type === "stripe")}
            onEditAccount={handleEditAccount}
          />
        );
      case "credit-card":
        return (
          <CreditCardForm
            cardNumber={formData.cardNumber}
            expiryDate={formData.expiryDate}
            nameOnCard={formData.nameOnCard}
            country={formData.country}
            addressLine1={formData.addressLine1}
            city={formData.city}
            state={formData.state}
            postalCode={formData.postalCode}
            accounts={accounts.filter((acc) => acc.type === "card")}
            onEditAccount={handleEditAccount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-white">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        {/* Back Button */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            {paymentMethodText}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6">
          {/* Payment Method Selection */}
          <PaymentMethodSelector
            selectedMethod={formData.paymentMethod}
            onMethodChange={(method) => handleInputChange("paymentMethod", method as any)}
          />

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="text-xs font-medium text-gray-900 mb-6">{paymentDetailsText}</h3>
            {renderPaymentForm()}
          </div>

          {/* Note and Continue Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-4">
            <p className="text-[11px] text-gray-600 italic">
              <strong>{noteText}</strong> {shippingAddressSharedText}
            </p>
            <button
              type="submit"
              disabled={!hasAccountSetup()}
              className={`px-10 py-2.5 rounded-full text-[11px] font-medium transition-colors ${
                hasAccountSetup()
                  ? "bg-red-800 text-white hover:bg-red-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saveAndContinueText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethod;
