import type React from "react"
import { PAYMENT_METHODS } from "@/components/constants/payment"
import { useLanguage } from "@/context/LanguageContext"
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation"

// Helper component for translating payment method names
const TranslatedPaymentMethod: React.FC<{ methodName: string }> = ({ methodName }) => {
  const { language } = useLanguage();
  const translatedMethod = useAutoTranslation(methodName, language);
  return <>{translatedMethod}</>;
};

interface PaymentMethodSelectorProps {
  selectedMethod: string
  onMethodChange: (method: string) => void
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
      {PAYMENT_METHODS.map((method) => (
        <label
          key={method.id}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <input
            type="radio"
            name="paymentMethod"
            value={method.id}
            checked={selectedMethod === method.id}
            onChange={() => onMethodChange(method.id)}
            className="w-3 h-3 accent-red-800"
          />
          <div className="flex items-center space-x-2">
            <img
              src={method.icon}
              alt={method.name}
              className="w-8 h-8 object-contain"
            />
            <span className="text-xs font-medium text-gray-800">
              <TranslatedPaymentMethod methodName={method.name} />
            </span>
          </div>
        </label>
      ))}
    </div>
  )
}

export default PaymentMethodSelector
