import type React from "react"
import { useState } from "react"
import { formatCardNumber, formatExpiryDate } from "@/utils/paymentUtils"
import { COUNTRIES } from "@/components/constants/payment"
import SecurityNote from "./SecurityNote"

interface CreditCardFormProps {
  cardNumber: string
  expiryDate: string
  cvc: string
  nameOnCard: string
  country: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  saveCard: boolean
  onFieldChange: (field: string, value: string | boolean) => void
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  cardNumber,
  expiryDate,
  cvc,
  nameOnCard,
  country,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  saveCard,
  onFieldChange,
}) => {
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  return (
    <div className="space-y-4">
      {/* Card Number, Expiry, CVC Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-1">
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => onFieldChange("cardNumber", formatCardNumber(e.target.value))}
              placeholder="1234 1234 1234 1234"
              maxLength={19}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
              style={{ fontSize: "10px" }}
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
          </div>
        </div>
        <div className="md:col-span-1 grid grid-cols-2 gap-4">
            <div>
                <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => onFieldChange("expiryDate", formatExpiryDate(e.target.value))}
                    placeholder="MM / YY"
                    maxLength={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
                    style={{ fontSize: "10px" }}
                />
            </div>
            <div>
                <input
                    type="text"
                    value={cvc}
                    onChange={(e) => onFieldChange("cvc", e.target.value.replace(/\D/g, ""))}
                    placeholder="CVC"
                    maxLength={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
                    style={{ fontSize: "10px" }}
                />
            </div>
        </div>
      </div>

      {/* Name on Card and Country Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            value={nameOnCard}
            onChange={(e) => onFieldChange("nameOnCard", e.target.value)}
            placeholder="Name on card"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
            style={{ fontSize: "10px" }}
          />
        </div>
        <div>
          <div className="relative flex gap-6">
            <span className="text-gray-500 text-[11px] relative top-3">Country</span>
            <button
              type="button"
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none text-left text-[11px] flex items-center justify-between"
            >
              <span>{country}</span>
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCountryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {COUNTRIES.map((countryOption) => (
                  <button
                    key={countryOption}
                    type="button"
                    onClick={() => {
                      onFieldChange("country", countryOption)
                      setShowCountryDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-[11px] hover:bg-gray-50"
                  >
                    {countryOption}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Lines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            value={addressLine1}
            onChange={(e) => onFieldChange("addressLine1", e.target.value)}
            placeholder="Address line 1"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
            style={{ fontSize: "10px" }}
          />
        </div>
        <div>
          <input
            type="text"
            value={addressLine2}
            onChange={(e) => onFieldChange("addressLine2", e.target.value)}
            placeholder="Address line 2 (optional)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
            style={{ fontSize: "10px" }}
          />
        </div>
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            value={city}
            onChange={(e) => onFieldChange("city", e.target.value)}
            placeholder="City"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
            style={{ fontSize: "10px" }}
          />
        </div>
        <div className="md:col-span-1 grid grid-cols-2 gap-4">
            <div>
            <input
                type="text"
                value={state}
                onChange={(e) => onFieldChange("state", e.target.value)}
                placeholder="State, province, or region"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
                style={{ fontSize: "10px" }}
            />
            </div>
            <div>
            <input
                type="text"
                value={postalCode}
                onChange={(e) => onFieldChange("postalCode", e.target.value)}
                placeholder="ZIP/Postal code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 outline-none"
                style={{ fontSize: "10px" }}
            />
            </div>
        </div>
      </div>

      {/* Save Card Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="saveCard"
          checked={saveCard}
          onChange={(e) => onFieldChange("saveCard", e.target.checked)}
          className="w-3 h-3 text-red-800 border-gray-300 rounded"
        />
        <label htmlFor="saveCard" className="text-[10px] text-gray-700">
          Save credit card for later use.
        </label>
      </div>

      <SecurityNote type="credit-card" />
    </div>
  )
}

export default CreditCardForm
