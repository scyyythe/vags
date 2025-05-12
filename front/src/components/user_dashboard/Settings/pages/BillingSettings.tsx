
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
  const [activeTab, setActiveTab] = useState<"plans" | "transactions">("plans");
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [originalPlan, setOriginalPlan] = useState(selectedPlan);

  const plans: Plan[] = [
    {
      id: "basic",
      name: "Basic plan",
      price: 10,
      description: "Includes up to ... and access to all features.",
      icon: "basic",
    },
    {
      id: "business",
      name: "Business plan",
      price: 20,
      description: "Includes up to ... and access to all features.",
      icon: "business",
    },
    {
      id: "enterprise",
      name: "Enterprise plan",
      price: 40,
      description: "Includes up to ... and access to all features.",
      icon: "enterprise",
    },
  ];

  const handleSave = () => setOriginalPlan(selectedPlan);
  const handleReset = () => setSelectedPlan(originalPlan);
  const hasChanges = () => selectedPlan !== originalPlan;

  const renderIcon = (icon: string) => {
    if (icon === "basic") return <i className="bx bx-layer-minus text-red-800 text-xl"></i>;
    if (icon === "business") return <i className="bx bx-layer text-red-800 text-xl"></i>;
    return <i className="bx bxs-bolt text-red-800 text-xl"></i>;
  };

  return (
    <div className="w-full max-w-full mx-auto px-4">
      {/* Tabs */}
      <div className="flex gap-8 mb-6 text-xs font-semibold">
        <button
          className={`pb-2 ${activeTab === "plans" ? "text-red-800 border-b-2 border-red-800" : "text-gray-600"}`}
          onClick={() => setActiveTab("plans")}
        >
          Plans
        </button>
        <button
          className={`pb-2 ${activeTab === "transactions" ? "text-red-800 border-b-2 border-red-800" : "text-gray-600"}`}
          onClick={() => setActiveTab("transactions")}
        >
          Transactions
        </button>
      </div>

      {activeTab === "plans" && (
        <div className="flex flex-col gap-6">

          {/* Account Plans */}
          <div>
            <h3 className="text-xs font-semibold">Account plans</h3>
            <p className="text-[10px] text-gray-600 mb-3">
              Pick an account plan that fits your workflow.
            </p>
          </div>
          
          <div className="border-b border-gray-300 mb-3" /> 

          <div>
            <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="flex flex-row gap-6">
              {/* Current Plan */}
              <div>
                <h3 className="text-xs font-semibold">Current plan</h3>
                <p className="text-[10px] text-gray-600">
                  We'll credit your account if you need to downgrade during the billing cycle.
                </p>
              </div>  

              <div className="w-full space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-lg border flex items-center justify-between p-4 ${
                      selectedPlan === plan.id
                        ? "bg-red-50 border-red-200"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 flex items-center justify-center">
                        {renderIcon(plan.icon)}
                      </div>
                      <div>
                        <div className="flex gap-1 items-center text-[11px] font-medium">
                          <span>{plan.name}</span>
                          <span className="text-gray-500">${plan.price}/month</span>
                        </div>
                        <p className="text-[10px] text-gray-600">{plan.description}</p>
                      </div>
                    </div>

                    {/* Custom radio button */}
                    <RadioGroupItem
                      value={plan.id}
                      id={plan.id}
                      className={`border border-red-800 text-red-800 ${
                        selectedPlan === plan.id ? "bg-red-800 text-white" : ""
                      }`}
                    />
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <ActionButtons
            hasChanges={hasChanges()}
            onSave={handleSave}
            onReset={handleReset}
          />
        </div>
      )}

      {activeTab === "transactions" && (
      <TransactionsTab />
    )}
    </div>
  );
};

export default BillingSettings;