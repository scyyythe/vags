import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ActionButtons from "../components/ActionButtons";

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: "basic" | "business" | "enterprise";
}

const BillingSettings = () => {
  const [plans, setPlans] = useState<Plan[]>([
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
  ]);
  
  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [originalPlan, setOriginalPlan] = useState(selectedPlan);

  const handleSave = () => {
    setOriginalPlan(selectedPlan);
  };

  const handleReset = () => {
    setSelectedPlan(originalPlan);
  };

  const hasChanges = () => {
    return selectedPlan !== originalPlan;
  };

  const renderIcon = (icon: string) => {
    if (icon === "basic" || icon === "business") {
      return (
        <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-red-500"
          >
            <path
              d="M22.5 0L45 22.5L33.75 33.75L22.5 22.5L11.25 33.75L0 22.5L22.5 0Z"
              fill="currentColor"
              transform="scale(0.5)"
            />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 flex items-center justify-center bg-red-100 rounded">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="text-red-500"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Billing</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Account plans</h3>
        <p className="text-gray-600 mb-6">
          Pick an account plan that fits your workflow.
        </p>
        
        <div className="space-y-4">
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  border rounded-lg p-4 flex items-center justify-between
                  ${selectedPlan === plan.id ? "border-red-200 bg-red-50" : "border-gray-200"}
                `}
              >
                <div className="flex items-start gap-4">
                  {renderIcon(plan.icon)}
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-gray-500">${plan.price}/month</span>
                    </div>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                  </div>
                </div>
                <RadioGroupItem value={plan.id} id={plan.id} className="text-red-500" />
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Current plan</h3>
        <p className="text-gray-600">
          We'll credit your account if you need to downgrade during the billing cycle.
        </p>
      </div>
      
      <ActionButtons
        hasChanges={hasChanges()}
        onSave={handleSave}
        onReset={handleReset}
        saveText="Update Settings"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BillingSettings;
