import type React from "react"
import { Plus } from "lucide-react" 
import { useNavigate } from "react-router-dom"
import SecurityNote from "./SecurityNote"

interface PayPalFormProps {
  email?: string
  connectedDate?: string
}

const PayPalForm: React.FC<PayPalFormProps> = ({ email, connectedDate = "January 15, 2025" }) => {
  const navigate = useNavigate()

  // Empty state when no account is connected
  if (!email) {
    return (
      <div className="space-y-4">
        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-muted-foreground/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.653h8.58c2.834 0 4.79.828 5.644 2.395.77 1.413.688 3.177-.23 4.97-.988 1.93-2.73 3.348-4.917 4.004-1.316.395-2.853.592-4.574.592H8.38a.77.77 0 0 0-.76.653l-.542 3.426a.641.641 0 0 1-.633.74h-.37z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground mb-2">No PayPal Account Connected</h3>
            <p className="text-xs text-muted-foreground">
              Connect your PayPal account to enable quick and secure payments
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings/billing")}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 font-medium text-[11px] transition-colors"
          >
            <Plus size={14} />
            Set Up PayPal Account
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg px-10 py-8 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="text-sm font-semibold text-blue-700">PayPal Account</h3>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-[10px] font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Connected
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Email Address
            </label>
            <p className="text-xs text-foreground font-medium mt-1">sample@gmail.com</p>
          </div>

          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Connected Since
            </label>
            <p className="text-xs text-foreground font-medium mt-1">{connectedDate}</p>
          </div>

          <div className="pt-4 border-t border-border text-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-1.5  text-blue-700 rounded-full text-[11px] font-medium 
                      active:scale-[0.98] transition-all duration-200 ease-in-out"
            >
              <i className="bx bx-edit text-[13px]"></i>
              <p className=" hover:underline">Update Account</p>
            </button>
          </div>
        </div>
      </div>

      <SecurityNote type="paypal" />
    </div>
  )
}

export default PayPalForm
