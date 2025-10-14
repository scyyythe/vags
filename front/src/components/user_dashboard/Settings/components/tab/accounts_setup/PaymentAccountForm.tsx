import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewAccountState, PaymentAccount } from "../accounts_setup/types/payment";
import { usePaymentAccounts } from "@/hooks/accounts/usePaymentAccounts";
import { useStripeConnect } from "@/hooks/tips/useStripeConnect";
import { X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

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
  const { language: selectedLanguage } = useLanguage();

  // Auto-translated texts
  const paymentProviderLabel = useAutoTranslation("Payment Provider", selectedLanguage);
  const accountNameLabel = useAutoTranslation("Account Name", selectedLanguage);
  const accountNamePlaceholder = useAutoTranslation("e.g., Personal PayPal, Primary Bank", selectedLanguage);
  const cardNumberLabel = useAutoTranslation("Card Number", selectedLanguage);
  const cardNumberPlaceholder = useAutoTranslation("1234 5678 9012 3456", selectedLanguage);
  const cardholderNameLabel = useAutoTranslation("Cardholder Name", selectedLanguage);
  const cardholderNamePlaceholder = useAutoTranslation("Full Name on Card", selectedLanguage);
  const expiryDateLabel = useAutoTranslation("Expiration Date", selectedLanguage);
  const expiryDatePlaceholder = useAutoTranslation("MM/YY", selectedLanguage);
  const cvvLabel = useAutoTranslation("CVV", selectedLanguage);
  const cvvPlaceholder = useAutoTranslation("3 digits", selectedLanguage);
  const paypalEmailLabel = useAutoTranslation("PayPal Email Address", selectedLanguage);
  const paypalEmailPlaceholder = useAutoTranslation("your-email@domain.com", selectedLanguage);
  const bankNameLabel = useAutoTranslation("Bank Name", selectedLanguage);
  const bankNamePlaceholder = useAutoTranslation("e.g., Wells Fargo, Chase Bank", selectedLanguage);
  const accountNumberLabel = useAutoTranslation("Account Number", selectedLanguage);
  const accountNumberPlaceholder = useAutoTranslation("Account Number or IBAN", selectedLanguage);
  const routingNumberLabel = useAutoTranslation("Routing Number", selectedLanguage);
  const routingNumberPlaceholder = useAutoTranslation("9-digit routing number", selectedLanguage);
  const swiftCodeLabel = useAutoTranslation("SWIFT/BIC Code", selectedLanguage);
  const swiftCodePlaceholder = useAutoTranslation("International transfers", selectedLanguage);
  const gcashAccountNameLabel = useAutoTranslation("Account Name", selectedLanguage);
  const gcashAccountNamePlaceholder = useAutoTranslation("e.g., Your Account Name", selectedLanguage);
  const gcashNumberLabel = useAutoTranslation("GCash Mobile Number", selectedLanguage);
  const gcashNumberPlaceholder = useAutoTranslation("09XXXXXXXXX", selectedLanguage);
  const gcashQrLabel = useAutoTranslation("GCash QR Code", selectedLanguage);
  const qrCodePreviewLabel = useAutoTranslation("QR Code Preview:", selectedLanguage);
  const changeImageText = useAutoTranslation("Change Image", selectedLanguage);
  const payoneerLabel = useAutoTranslation("Payoneer Email or Account ID", selectedLanguage);
  const payoneerPlaceholder = useAutoTranslation("email@domain.com or Account ID", selectedLanguage);
  const accountInfoLabel = useAutoTranslation("Account Information", selectedLanguage);
  const connectedText = useAutoTranslation("Connected (ID:", selectedLanguage);
  const connectStripeText = useAutoTranslation("Connect with Stripe", selectedLanguage);
  const stripeInfoText = useAutoTranslation("Stripe connection will be handled automatically via OAuth", selectedLanguage);
  const paypalText = useAutoTranslation("PayPal", selectedLanguage);
  const bankText = useAutoTranslation("Bank Transfer", selectedLanguage);
  const gcashText = useAutoTranslation("GCash", selectedLanguage);
  const payoneerText = useAutoTranslation("Payoneer", selectedLanguage);
  const stripeText = useAutoTranslation("Stripe", selectedLanguage);
  const cardText = useAutoTranslation("Credit/Debit Card", selectedLanguage);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] font-medium">{paymentProviderLabel}</p>
        <Select
          value={newAccount.type}
          onValueChange={(value) => setNewAccount((prev) => ({ ...prev, type: value as PaymentAccount["type"] }))}
        >
          <SelectTrigger className="text-[10px] rounded-full focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paypal" className="text-[10px]">{paypalText}</SelectItem>
            <SelectItem value="bank" className="text-[10px]">{bankText}</SelectItem>
            <SelectItem value="gcash" className="text-[10px]">{gcashText}</SelectItem>
            <SelectItem value="payoneer" className="text-[10px]">{payoneerText}</SelectItem>
            <SelectItem value="stripe" className="text-[10px]">{stripeText}</SelectItem>
            <SelectItem value="card" className="text-[10px]">{cardText}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {newAccount.type !== "gcash" && (
        <div className="space-y-2">
          <p className="text-[11px] font-medium">{accountNameLabel}</p>
          <Input
            id="name"
            value={newAccount.name}
            onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={accountNamePlaceholder}
            style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
          />
        </div>
      )}

      {newAccount.type === "card" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">{cardNumberLabel}</p>
            <Input
              id="cardNumber"
              value={newAccount.cardDetails.cardNumber}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  cardDetails: { ...prev.cardDetails, cardNumber: e.target.value },
                }))
              }
              placeholder={cardNumberPlaceholder}
              maxLength={19}
              style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">{cardholderNameLabel}</p>
            <Input
              id="cardHolder"
              value={newAccount.cardDetails.cardholderName}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  cardDetails: { ...prev.cardDetails, cardHolder: e.target.value },
                }))
              }
              placeholder={cardholderNamePlaceholder}
              style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">{expiryDateLabel}</p>
            <Input
              id="expiry"
              value={newAccount.cardDetails.expiryDate}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  cardDetails: { ...prev.cardDetails, expiry: e.target.value },
                }))
              }
              placeholder={expiryDatePlaceholder}
              maxLength={5}
              style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">{cvvLabel}</p>
            <Input
              id="cvv"
              value={newAccount.cardDetails.cvv}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  cardDetails: { ...prev.cardDetails, cvv: e.target.value },
                }))
              }
              placeholder={cvvPlaceholder}
              maxLength={3}
              style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
            />
          </div>
        </div>
      ) : newAccount.type === "paypal" ? (
        <div className="space-y-2">
          <p className="text-[11px] font-medium">{paypalEmailLabel}</p>
          <Input
            id="accountInfo"
            type="email"
            value={newAccount.accountInfo}
            onChange={(e) => setNewAccount((prev) => ({ ...prev, accountInfo: e.target.value }))}
            placeholder={paypalEmailPlaceholder}
            style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
          />
        </div>
      ) : newAccount.type === "bank" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">{bankNameLabel}</p>
            <Input
              id="bankName"
              value={newAccount.bankDetails.bankName}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, bankName: e.target.value },
                }))
              }
              placeholder={bankNamePlaceholder}
              style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">{accountNumberLabel}</p>
            <Input
              id="accountNumber"
              value={newAccount.bankDetails.accountNumber}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, accountNumber: e.target.value },
                  accountInfo: e.target.value,
                }))
              }
              placeholder={accountNumberPlaceholder}
              style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">{routingNumberLabel}</p>
            <Input
              id="routingNumber"
              value={newAccount.bankDetails.routingNumber}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, routingNumber: e.target.value },
                }))
              }
              placeholder={routingNumberPlaceholder}
              style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <p className="text-[11px] font-medium">{swiftCodeLabel}</p>
            <Input
              id="swiftCode"
              value={newAccount.bankDetails.swiftCode}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  bankDetails: { ...prev.bankDetails, swiftCode: e.target.value },
                }))
              }
              placeholder={swiftCodePlaceholder}
              style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
            />
          </div>
        </div>
      ) : newAccount.type === "gcash" ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="w-1/2 space-y-1">
              <p className="text-[11px] font-medium">{gcashAccountNameLabel}</p>
              <Input
                id="name"
                value={newAccount.name}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={gcashAccountNamePlaceholder}
                style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
              />
            </div>
            <div className="w-1/2 space-y-1">
              <p className="text-[11px] font-medium">{gcashNumberLabel}</p>
              <Input
                id="accountInfo"
                value={newAccount.accountInfo}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, accountInfo: e.target.value }))}
                placeholder={gcashNumberPlaceholder}
                style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium">{gcashQrLabel}</p>
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
                        setNewAccount((prev) => ({ ...prev, qrCodeUrl: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
                />
              ) : (
                <div className="mt-2 p-3 border rounded-lg space-y-2 relative">
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center shadow-md z-10"
                    onClick={() => setNewAccount((prev) => ({ ...prev, qrCodeUrl: undefined }))}
                    aria-label="Delete QR Code"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-muted-foreground">{qrCodePreviewLabel}</p>
                  <label htmlFor="qrCodeChange" className="block relative mx-auto w-40 h-40 cursor-pointer group">
                    <img
                      src={newAccount.qrCodeUrl}
                      alt="GCash QR Code"
                      className="w-full h-full object-contain border rounded transition-opacity group-hover:opacity-50"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <span className="text-[10px] font-medium text-foreground bg-background/90 px-3 py-1.5 rounded-full shadow-lg">
                        {changeImageText}
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
                            setNewAccount((prev) => ({ ...prev, qrCodeUrl: reader.result as string }));
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
          <p className="text-[11px] font-medium">{payoneerLabel}</p>
          <Input
            id="accountInfo"
            value={newAccount.accountInfo}
            onChange={(e) => setNewAccount((prev) => ({ ...prev, accountInfo: e.target.value }))}
            placeholder={payoneerPlaceholder}
            style={{ fontSize: "10px", borderRadius: "9999px", outline: "none", boxShadow: "none" }}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] font-medium">{accountInfoLabel}</p>
          {newAccount.type === "stripe" && (
            <div className="space-y-2">
              {newAccount.stripeAccountId ? (
                <p className="text-[10px] text-green-600">
                  {connectedText} {newAccount.stripeAccountId})
                </p>
              ) : (
                <button
                  type="button"
                  className="px-3 py-1 text-[10px] rounded-full bg-blue-600 text-white"
                  onClick={connectStripe}
                >
                  {connectStripeText}
                </button>
              )}
              <p className="text-[10px] text-muted-foreground">{stripeInfoText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
