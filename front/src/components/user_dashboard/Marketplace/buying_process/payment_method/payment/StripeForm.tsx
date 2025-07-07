import type React from "react"
import SecurityNote from "./SecurityNote"
import ThirdPartyButton from "./ThirdPartyButton"

interface StripeFormProps {
  email: string
  onEmailChange: (value: string) => void
}

const StripeForm: React.FC<StripeFormProps> = ({ email, onEmailChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Email address for Stripe"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
          style={{ fontSize: "10px" }}
        />
      </div>
      <ThirdPartyButton method="stripe" />
      <SecurityNote type="stripe" />
    </div>
  )
}

export default StripeForm
