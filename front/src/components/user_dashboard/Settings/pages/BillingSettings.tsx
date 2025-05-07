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
    if (icon === "basic") {
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <i className='bx bx-layer-minus text-red-800'></i>
        </div>
      );
    } if (icon === "business") {
      return (
        <div className="w-8 h-8 flex items-center justify-center">
          <i className='bx bx-layer text-red-800'></i>
        </div>
      );
    }
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <i className='bx bxs-bolt text-red-800'></i>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">Billing</h2>
      
      <div className="mb-8">
        <h3 className="text-[13px] font-semibold mb-1">Account plans</h3>
        <p className="text-gray-600 text-[11px] mb-6">
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
                      <span className="font-medium text-xs">{plan.name}</span>
                      <span className="text-gray-500 text-xs">${plan.price}/month</span>
                    </div>
                    <p className=" text-gray-600 text-[10px]">{plan.description}</p>
                  </div>
                </div>
                <RadioGroupItem value={plan.id} id={plan.id} className="text-red-800 border border-red-800" />
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-[13px] font-semibold mb-1">Current plan</h3>
        <p className="text-gray-600 text-[11px] mb-6">
          We'll credit your account if you need to downgrade during the billing cycle.
        </p>
      </div>
      
      <ActionButtons
        hasChanges={hasChanges()}
        onSave={handleSave}
        onReset={handleReset}
      />
    </div>
  );
};

export default BillingSettings;
