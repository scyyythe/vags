import type React from "react"
import SecurityNote from "./SecurityNote"
import ThirdPartyButton from "./ThirdPartyButton"

interface GCashFormProps {
  number: string
  pin: string
  onNumberChange: (value: string) => void
  onPinChange: (value: string) => void
}

const GCashForm: React.FC<GCashFormProps> = ({ number, pin, onNumberChange, onPinChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <input
          type="tel"
          value={number}
          onChange={(e) => onNumberChange(e.target.value)}
          placeholder="GCash mobile number"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
        />
      </div>
      <div>
        <input
          type="password"
          value={pin}
          onChange={(e) => onPinChange(e.target.value)}
          placeholder="GCash PIN"
          maxLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
        />
      </div>
      <ThirdPartyButton method="gcash" />
      <SecurityNote type="gcash" />
    </div>
  )
}

export default GCashForm
