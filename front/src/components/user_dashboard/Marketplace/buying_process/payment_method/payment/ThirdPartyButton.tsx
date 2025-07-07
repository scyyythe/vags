import type React from "react"
import { handleThirdPartyPayment } from "@/utils/paymentUtils"

interface ThirdPartyButtonProps {
  method: "paypal" | "gcash" | "stripe"
}

const ThirdPartyButton: React.FC<ThirdPartyButtonProps> = ({ method }) => {
  const buttonConfig = {
    paypal: {
      text: "Continue with PayPal",
      className: "bg-blue-600 hover:bg-blue-700",
    },
    gcash: {
      text: "Continue with GCash",
      className: "bg-blue-500 hover:bg-blue-600",
    },
    stripe: {
      text: "Continue with Stripe",
      className: "bg-purple-600 hover:bg-purple-700",
    },
  }

  const config = buttonConfig[method]

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={() => handleThirdPartyPayment(method)}
        className={`${config.className} text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span>{config.text}</span>
      </button>
    </div>
  )
}

export default ThirdPartyButton
