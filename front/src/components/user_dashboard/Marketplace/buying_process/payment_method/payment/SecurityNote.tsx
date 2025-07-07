import type React from "react"

interface SecurityNoteProps {
  type: "paypal" | "gcash" | "stripe" | "credit-card"
}

const SecurityNote: React.FC<SecurityNoteProps> = ({ type }) => {
  const securityNotes = {
    paypal: {
      bgColor: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      titleColor: "text-blue-800",
      textColor: "text-blue-700",
      title: "Secure PayPal Payment",
      text: "Your payment will be processed securely through PayPal. You can also pay with your credit card through PayPal without creating an account.",
    },
    gcash: {
      bgColor: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      titleColor: "text-green-800",
      textColor: "text-green-700",
      title: "Secure GCash Payment",
      text: "Your payment is protected by GCash's advanced security features including biometric authentication and real-time fraud monitoring.",
    },
    stripe: {
      bgColor: "bg-purple-50 border-purple-200",
      iconColor: "text-purple-600",
      titleColor: "text-purple-800",
      textColor: "text-purple-700",
      title: "Secure Stripe Payment",
      text: "Stripe uses industry-leading security measures including PCI DSS compliance and advanced fraud detection to protect your payment information.",
    },
    "credit-card": {
      bgColor: "bg-gray-50 border-gray-200",
      iconColor: "text-gray-600",
      titleColor: "text-gray-800",
      textColor: "text-gray-700",
      title: "Secure Credit Card Payment",
      text: "Your credit card information is encrypted and processed securely. We use SSL encryption and are PCI DSS compliant to protect your financial data.",
    },
  }

  const note = securityNotes[type]

  const getIcon = () => {
    if (type === "gcash" || type === "credit-card") {
      return (
        <path
          fillRule="evenodd"
          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
          clipRule="evenodd"
        />
      )
    } else if (type === "stripe") {
      return (
        <path
          fillRule="evenodd"
          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      )
    } else {
      return (
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      )
    }
  }

  return (
    <div className={`${note.bgColor} border rounded-lg p-4`}>
      <div className="flex items-start space-x-3">
        <svg className={`w-3 h-3 ${note.iconColor} mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
          {getIcon()}
        </svg>
        <div>
          <h4 className={`text-xs font-medium ${note.titleColor}`}>{note.title}</h4>
          <p className={`text-[10px] ${note.textColor} mt-1`}>{note.text}</p>
        </div>
      </div>
    </div>
  )
}

export default SecurityNote
