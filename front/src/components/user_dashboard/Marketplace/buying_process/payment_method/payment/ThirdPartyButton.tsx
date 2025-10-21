import type React from "react";
import { handleThirdPartyPayment } from "@/utils/purchase/paymentUtils";

interface ThirdPartyButtonProps {
  method: "paypal" | "gcash" | "stripe";
}

const ThirdPartyButton: React.FC<ThirdPartyButtonProps> = ({ method }) => {
  const buttonConfig = {
    paypal: {
      text: "Continue with PayPal",
      className: "text-red-800 underline",
    },
    gcash: {
      text: "Continue with GCash",
      className: "text-red-800 underline",
    },
    stripe: {
      text: "Continue with Stripe",
      className: "text-red-800 underline",
    },
  };

  const config = buttonConfig[method];

  return (
    <div className="flex justify-start">
      <button
        type="button"
        onClick={() => handleThirdPartyPayment(method)}
        className={`${config.className} text-xs py-3 rounded-lg font-medium transition-colors flex items-center space-x-2`}
      >
        <span>{config.text}</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ThirdPartyButton;
