
import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ActionButtons from "../components/ActionButtons";
import TransactionsTab from "../components/tab/TransactionTab";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: "basic" | "business" | "enterprise";
}

const BillingSettings = () => {
  const [activeTab, setActiveTab] = useState<"transactions">("transactions");

  return (
    <div className="w-full max-w-full mx-auto px-4">
      {/* Tabs */}
      <div className="flex gap-8 mb-6 text-xs font-semibold">
        <button
          className={`pb-2 ${activeTab === "transactions" ? "text-red-800 border-b-2 border-red-800" : "text-gray-600"}`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
      </div>

      {activeTab === "transactions" && (
      <TransactionsTab />
    )}
    </div>
  );
};

export default BillingSettings;