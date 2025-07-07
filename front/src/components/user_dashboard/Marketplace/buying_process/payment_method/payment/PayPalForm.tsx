import type React from "react"
import SecurityNote from "./SecurityNote"
import ThirdPartyButton from "./ThirdPartyButton"

interface PayPalFormProps {
  email: string
  password: string
  rememberMe: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onRememberMeChange: (value: boolean) => void
}

const PayPalForm: React.FC<PayPalFormProps> = ({
  email,
  password,
  rememberMe,
  onEmailChange,
  onPasswordChange,
  onRememberMeChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="PayPal email address"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
          required
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="PayPal password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rememberPayPal"
          checked={rememberMe}
          onChange={(e) => onRememberMeChange(e.target.checked)}
          className="w-4 h-4 text-red-800 border-gray-300 rounded"
        />
        <label htmlFor="rememberPayPal" className="text-sm text-gray-700">
          Keep me logged in for faster checkout
        </label>
      </div>
      <ThirdPartyButton method="paypal" />
      <SecurityNote type="paypal" />
    </div>
  )
}

export default PayPalForm
