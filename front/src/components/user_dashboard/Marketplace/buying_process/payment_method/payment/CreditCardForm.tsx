import type React from "react"
import { Plus } from "lucide-react" 
import { useNavigate } from "react-router-dom"
import SecurityNote from "./SecurityNote"

interface CreditCardFormProps {
  cardNumber?: string
  expiryDate?: string
  nameOnCard?: string
  country?: string
  addressLine1?: string
  city?: string
  state?: string
  postalCode?: string
  cardType?: "visa" | "mastercard" | "amex" | "discover"
  isDefault?: boolean
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  cardNumber,
  expiryDate,
  nameOnCard,
  country,
  addressLine1,
  city,
  state,
  postalCode,
  cardType = "visa",
  isDefault = true,
}) => {

  const navigate = useNavigate()

  // Empty state when no card is saved
  if (!cardNumber) {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground mb-2">No Credit Card Saved</h3>
            <p className="text-xs text-muted-foreground">
              Add a credit card to make purchases quickly and securely
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings/billing")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-[11px] transition-colors"
          >
            <Plus size={14} />
            Add Credit Card
          </button>
        </div>
      </div>
    )
  }

  // Mask the card number, showing only last 4 digits
  const maskedCardNumber = `•••• •••• •••• 5432${cardNumber.slice(-4)}`

  const cardIcons = {
    visa: (
      <svg className="w-6 h-4" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#1434CB" />
        <path d="M20.5 11h-3.2l-2 10h3.2l2-10z" fill="white" />
      </svg>
    ),
    mastercard: (
      <svg className="w-6 h-4" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#EB001B" />
        <circle cx="18" cy="16" r="8" fill="#FF5F00" />
        <circle cx="30" cy="16" r="8" fill="#F79E1B" />
      </svg>
    ),
    amex: (
      <svg className="w-6 h-4" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#006FCF" />
      </svg>
    ),
    discover: (
      <svg className="w-8 h-6" viewBox="0 0 48 32" fill="none">
        <rect width="48" height="32" rx="4" fill="#FF6000" />
      </svg>
    ),
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg px-10 py-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            {cardIcons[cardType]}
            <h3 className="text-sm font-semibold text-foreground capitalize">{cardType} Card</h3>
          </div>
          {isDefault && (
            <span className="inline-flex items-center px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-medium">
              Default
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Card Number
              </label>
              <p className="text-xs text-foreground font-mono font-medium mt-1">{maskedCardNumber}</p>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Expires
              </label>
              <p className="text-xs text-foreground font-mono font-medium mt-1">03 / 23 / 26</p>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Cardholder Name
            </label>
            <p className="text-xs text-foreground font-medium mt-1">Sample Name</p>
          </div>

          <div className="pt-2 border-t border-border">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              Billing Address
            </label>
            <div className="text-xs text-foreground space-y-0.5">
              <p>215, Sitio Cabutoy, Pooc, Talisay</p>
              <p>
                Cebu, Philippines 6045
              </p>
              <p>{country}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-1.5  text-black rounded-full text-[11px] font-medium 
                      active:scale-[0.98] transition-all duration-200 ease-in-out"
            >
              <i className="bx bx-edit text-[13px]"></i>
              <p className=" hover:underline">Update Account</p>
            </button>
          </div>
        </div>
      </div>

      <SecurityNote type="credit-card" />
    </div>
  )
}

export default CreditCardForm
