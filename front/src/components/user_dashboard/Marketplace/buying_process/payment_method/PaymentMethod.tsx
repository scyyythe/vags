import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import type { PaymentFormData, PaymentMethodProps } from "@/components/types/payment"
import { validatePaymentForm } from "@/utils/paymentUtils"
import PaymentMethodSelector from "./payment/PaymentMethodSelector"
import PayPalForm from "./payment/PayPalForm"
import GCashForm from "./payment/GCashForm"
import StripeForm from "./payment/StripeForm"
import CreditCardForm from "./payment/CreditCardForm"
import Header from "@/components/user_dashboard/navbar/Header";

const PaymentMethod: React.FC<PaymentMethodProps> = ({ onBack, onContinue }) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentMethod: "paypal",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    nameOnCard: "",
    country: "Philippines",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    saveCard: false,
    paypalEmail: "",
    paypalPassword: "",
    rememberPayPal: false,
    gcashNumber: "",
    gcashPin: "",
    stripeEmail: "",
  })

  const navigate = useNavigate();

  const handleInputChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onContinue(formData)
  }

  const renderPaymentForm = () => {
    switch (formData.paymentMethod) {
      case "paypal":
        return (
          <PayPalForm
            email={formData.paypalEmail}
            password={formData.paypalPassword}
            rememberMe={formData.rememberPayPal}
            onEmailChange={(value) => handleInputChange("paypalEmail", value)}
            onPasswordChange={(value) => handleInputChange("paypalPassword", value)}
            onRememberMeChange={(value) => handleInputChange("rememberPayPal", value)}
          />
        )
      case "gcash":
        return (
          <GCashForm
            number={formData.gcashNumber}
            pin={formData.gcashPin}
            onNumberChange={(value) => handleInputChange("gcashNumber", value)}
            onPinChange={(value) => handleInputChange("gcashPin", value)}
          />
        )
      case "stripe":
        return (
          <StripeForm email={formData.stripeEmail} onEmailChange={(value) => handleInputChange("stripeEmail", value)} />
        )
      case "credit-card":
        return (
          <CreditCardForm
            cardNumber={formData.cardNumber}
            expiryDate={formData.expiryDate}
            cvc={formData.cvc}
            nameOnCard={formData.nameOnCard}
            country={formData.country}
            addressLine1={formData.addressLine1}
            addressLine2={formData.addressLine2}
            city={formData.city}
            state={formData.state}
            postalCode={formData.postalCode}
            saveCard={formData.saveCard}
            onFieldChange={handleInputChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
              Payment Method
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6">
          {/* Payment Method Selection */}
          <PaymentMethodSelector
            selectedMethod={formData.paymentMethod}
            onMethodChange={(method) => handleInputChange("paymentMethod", method as any)}
          />

          {/* Payment Details */}
          <div className="mb-8">
            <h3 className="text-xs font-medium text-gray-900 mb-6">Payment Details</h3>
            {renderPaymentForm()}
          </div>

          {/* Note and Continue Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-4">
            <p className="text-[11px] text-gray-600 italic">
              <strong>Note:</strong> Your shipping address is only shared with the artist after your complete payment.
            </p>
            <button
              type="submit"
              disabled={!validatePaymentForm(formData)}
              className="bg-red-800 text-white px-10 py-2.5 rounded-full text-[11px] font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save and Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PaymentMethod
