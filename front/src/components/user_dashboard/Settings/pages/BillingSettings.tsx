import React, { useState } from "react";
import PaymentAccountsTab from "../components/tab/PaymentAccountsTab";
import TransactionsTab from "../components/tab/TransactionTab";
import ShippingAddressesTab from "../components/tab/ShippingAddressesTab";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const BillingSettings = () => {
  const [activeTab, setActiveTab] = useState<"transactions" | "payment-accounts" | "shipping-addresses">("payment-accounts");

  const { language: selectedLanguage } = useLanguage();

  // Auto-translated tab labels
  const paymentAccountsLabel = useAutoTranslation("Payment Accounts", selectedLanguage);
  const transactionsLabel = useAutoTranslation("Transaction History", selectedLanguage);
  const shippingAddressesLabel = useAutoTranslation("Shipping Addresses", selectedLanguage); 

  return (
    <div className="w-full max-w-full mx-auto px-4">
      {/* Tabs */}
      <div className="flex gap-8 mb-6 text-xs font-semibold border-border">
        <button
          className={`pb-2 px-1 border-b-2 transition-colors duration-200 ${
            activeTab === "payment-accounts"
              ? "text-red-800 border-red-800"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
          onClick={() => setActiveTab("payment-accounts")}
        >
          {paymentAccountsLabel}
        </button>

        <button
          className={`pb-2 px-1 border-b-2 transition-colors duration-200 ${
            activeTab === "transactions"
              ? "text-red-800 border-red-800"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          {transactionsLabel}
        </button>

        <button
          className={`pb-2 px-1 border-b-2 transition-colors duration-200 ${
            activeTab === "shipping-addresses"
              ? "text-red-800 border-red-800"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
          onClick={() => setActiveTab("shipping-addresses")}
        >
          {shippingAddressesLabel}
        </button>
      </div>

      {activeTab === "transactions" && <TransactionsTab />}
      {activeTab === "payment-accounts" && <PaymentAccountsTab />}
      {activeTab === "shipping-addresses" && <ShippingAddressesTab />}
    </div>
  );
};

export default BillingSettings;
