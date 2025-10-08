import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewAccountState, PaymentAccount } from "../accounts_setup/types/payment";
import { usePaymentAccounts } from "@/hooks/accounts/usePaymentAccounts";
import { useStripeConnect } from "@/hooks/tips/useStripeConnect";
import { X } from "lucide-react";

interface PaymentAccountFormProps {
  newAccount: NewAccountState;
  setNewAccount: React.Dispatch<React.SetStateAction<NewAccountState>>;
  editingAccount?: PaymentAccount | null;
}

export const PaymentAccountForm: React.FC<PaymentAccountFormProps> = ({
  newAccount,
  setNewAccount,
  editingAccount,
}) => {
  const { connectStripe } = useStripeConnect();
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] font-medium">Payment Provider</p>
        <Select
          value={newAccount.type}
          onValueChange={(value) => setNewAccount((prev) => ({ ...prev, type: value as PaymentAccount["type"] }))}
        >
          <SelectTrigger className="text-[10px] rounded-full focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paypal" className="text-[10px]">
              PayPal
            </SelectItem>
            <SelectItem value="bank" className="text-[10px]">
              Bank Transfer
            </SelectItem>
            <SelectItem value="gcash" className="text-[10px]">
              GCash
            </SelectItem>
            <SelectItem value="payoneer" className="text-[10px]">
              Payoneer
            </SelectItem>
            <SelectItem value="stripe" className="text-[10px]">
              Stripe
            </SelectItem>
            <SelectItem value="card" className="text-[10px]">
              Credit/Debit Card
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {newAccount.type !== "gcash" && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium">Account Name</p>
          <Input
            id="name"
            value={newAccount.name}
            onChange={(e) =>
              setNewAccount((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="e.g., Personal PayPal, Primary Bank"
            style={{
              fontSize: "10px",
              borderRadius: "9999px",
              outline: "none",
              boxShadow: "none",
            }}
          />
        </div>
      )}

      {newAccount.type === "card" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">Card Number</p>
            <Input
              id="cardNumber"
              value={newAccount.cardDetails.cardNumber}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  cardDetails: { ...prev.cardDetails, cardNumber: e.target.value },
                }))
              }
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              style={{
                fontSize: "10px",
                borderRadius: "9999px",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">Cardholder Name</p>
            <Input
              id="cardHolder"
              value={newAccount.cardDetails.cardholderName}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  cardDetails: { ...prev.cardDetails, cardHolder: e.target.value },
                }))
              }
              placeholder="Full Name on Card"
              style={{
                fontSize: "10px",
                borderRadius: "9999px",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">Expiration Date</p>
            <Input
              id="expiry"
              value={newAccount.cardDetails.expiryDate}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  cardDetails: { ...prev.cardDetails, expiry: e.target.value },
                }))
              }
              placeholder="MM/YY"
              maxLength={5}
              style={{
                fontSize: "10px",
                borderRadius: "9999px",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">CVV</p>
            <Input
              id="cvv"
              value={newAccount.cardDetails.cvv}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  cardDetails: { ...prev.cardDetails, cvv: e.target.value },
                }))
              }
              placeholder="3 digits"
              maxLength={3}
              style={{
                fontSize: "10px",
                borderRadius: "9999px",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>
        </div>
      ) : newAccount.type === "paypal" ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium">PayPal Email Address</p>
          <Input
            id="accountInfo"
            type="email"
            value={newAccount.accountInfo}
            onChange={(e) => setNewAccount((prev) => ({ ...prev, accountInfo: e.target.value }))}
            placeholder="your-email@domain.com"
            style={{
              fontSize: "10px",
              borderRadius: "9999px",
              outline: "none",
              boxShadow: "none",
            }}
          />
        </div>
      ) : newAccount.type === "bank" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">Bank Name</p>
            <Input
              id="bankName"
              value={newAccount.bankDetails.bankName}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, bankName: e.target.value },
                }))
              }
              placeholder="e.g., Wells Fargo, Chase Bank"
              style={{
                fontSize: "10px",
                borderRadius: "9999px",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">Account Number</p>
            <Input
              id="accountNumber"
              value={newAccount.bankDetails.accountNumber}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  bankDetails: {
                    ...prev.bankDetails,
                    accountNumber: e.target.value,
                  },
                  accountInfo: e.target.value,
                }))
              }
              placeholder="Account Number or IBAN"
              style={{
                fontSize: "10px",
                borderRadius: "9999px",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">Routing Number</p>
            <Input
              id="routingNumber"
              value={newAccount.bankDetails.routingNumber}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, routingNumber: e.target.value },
                }))
              }
              placeholder="9-digit routing number"
              style={{
                fontSize: "10px",
                borderRadius: "9999px",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">SWIFT/BIC Code</p>
            <Input
              id="swiftCode"
              value={newAccount.bankDetails.swiftCode}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, swiftCode: e.target.value },
                }))
              }
              placeholder="International transfers"
              style={{
                fontSize: "10px",
                borderRadius: "9999px",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>
        </div>
      ) : newAccount.type === "gcash" ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="w-1/2 space-y-1">
              <p className="text-[11px] font-medium">Account Name</p>
              <Input
                id="name"
                value={newAccount.name}
                onChange={(e) =>
                  setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Your Account Name"
                style={{
                  fontSize: "10px",
                  borderRadius: "9999px",
                  outline: "none",
                  boxShadow: "none",
                }}
              />
            </div>
            <div className="w-1/2 space-y-1">
              <p className="text-[11px] font-medium">GCash Mobile Number</p>
              <Input
                id="accountInfo"
                value={newAccount.accountInfo}
                onChange={(e) =>
                  setNewAccount((prev) => ({
                    ...prev,
                    accountInfo: e.target.value,
                  }))
                }
                placeholder="09XXXXXXXXX"
                style={{
                  fontSize: "10px",
                  borderRadius: "9999px",
                  outline: "none",
                  boxShadow: "none",
                }}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-[11px] font-medium">GCash QR Code</p>
            <div className="space-y-2">
              {!newAccount.qrCodeUrl ? (
                <Input
                  id="qrCode"
                  type="file"
                  accept="image/*"
                  title=""
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewAccount((prev) => ({
                          ...prev,
                          qrCodeUrl: reader.result as string,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{
                    fontSize: "10px",
                    borderRadius: "9999px",
                    outline: "none",
                    boxShadow: "none",
                  }}
                />
              ) : (
                <div className="mt-2 p-3 border rounded-lg space-y-2 relative">
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center shadow-md z-10"
                    onClick={() => {
                      setNewAccount((prev) => ({
                        ...prev,
                        qrCodeUrl: undefined,
                      }));
                    }}
                    aria-label="Delete QR Code"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-muted-foreground">QR Code Preview:</p>
                  <label htmlFor="qrCodeChange" className="block relative mx-auto w-40 h-40 cursor-pointer group">
                    <img
                      src={newAccount.qrCodeUrl}
                      alt="GCash QR Code"
                      className="w-full h-full object-contain border rounded transition-opacity group-hover:opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-[10px] font-medium text-foreground bg-background/90 px-3 py-1.5 rounded-full shadow-lg">
                        Change Image
                      </span>
                    </div>
                    <Input
                      id="qrCodeChange"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewAccount((prev) => ({
                              ...prev,
                              qrCodeUrl: reader.result as string,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : newAccount.type === "payoneer" ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium">Payoneer Email or Account ID</p>
          <Input
            id="accountInfo"
            value={newAccount.accountInfo}
            onChange={(e) => setNewAccount((prev) => ({ ...prev, accountInfo: e.target.value }))}
            placeholder="email@domain.com or Account ID"
            style={{
              fontSize: "10px",
              borderRadius: "9999px",
              outline: "none",
              boxShadow: "none",
            }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] font-medium">Account Information</p>
          {newAccount.type === "stripe" && (
            <div className="space-y-2">
              {newAccount.stripeAccountId ? (
                <p className="text-[10px] text-green-600">Connected (ID: {newAccount.stripeAccountId})</p>
              ) : (
                <button
                  type="button"
                  className="px-3 py-1 text-[10px] rounded-full bg-blue-600 text-white"
                  onClick={connectStripe}
                >
                  Connect with Stripe
                </button>
              )}
              <p className="text-[10px] text-muted-foreground">
                Stripe connection will be handled automatically via OAuth
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
