import type React from "react"
import { PAYMENT_METHODS } from "@/components/constants/payment"

interface PaymentMethodSelectorProps {
  selectedMethod: string
  onMethodChange: (method: string) => void
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selectedMethod, onMethodChange }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {PAYMENT_METHODS.map((method) => (
        <div
          key={method.id}
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onMethodChange(method.id)}
        >
          <input
            type="radio"
            checked={selectedMethod === method.id}
            onChange={() => onMethodChange(method.id)}
            className="w-4 h-4 accent-red-800"
          />
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 ${method.bgColor} flex items-center justify-center`}>
              {method.icon === "card" ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              ) : (
                <span className="text-white text-xs font-bold">{method.icon}</span>
              )}
            </div>
            <span className="text-sm font-medium">{method.name}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PaymentMethodSelector