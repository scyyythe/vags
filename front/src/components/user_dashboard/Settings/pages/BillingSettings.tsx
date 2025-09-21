import React, { useState } from "react";
import PaymentAccountsTab from "../components/tab/PaymentAccountsTab";
import TransactionsTab from "../components/tab/TransactionTab";

const BillingSettings = () => {
  const [activeTab, setActiveTab] = useState<"transactions" | "payment-accounts">("payment-accounts");

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
          Payment Accounts
        </button>

        <button
          className={`pb-2 px-1 border-b-2 transition-colors duration-200 ${
            activeTab === "transactions"
              ? "text-red-800 border-red-800"
              : "text-muted-foreground hover:text-foreground border-transparent"
          }`}
          onClick={() => setActiveTab("transactions")}
        >
          Transaction History
        </button>
      </div>

      {activeTab === "transactions" && <TransactionsTab />}
      {activeTab === "payment-accounts" && <PaymentAccountsTab />}
    </div>
  );
};

export default BillingSettings;
