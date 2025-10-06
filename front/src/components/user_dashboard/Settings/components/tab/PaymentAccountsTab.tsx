import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, CheckCircle2, Lock } from "lucide-react";
import { PaymentAccount, NewAccountState } from "./accounts_setup/types/payment";
import { PaymentAccountForm } from "./accounts_setup/PaymentAccountForm";
import { PaymentAccountTable } from "./accounts_setup/PaymentAccountTable";
import { usePaymentAccounts } from "@/hooks/accounts/usePaymentAccounts";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const PaymentAccountsTab = () => {
  const { accounts, addOrUpdateAccount, deleteAccount, setDefaultAccount } = usePaymentAccounts();
  const { language: selectedLanguage } = useLanguage();

  // Auto-translated labels
  const myPaymentAccountsLabel = useAutoTranslation("My Payment Accounts", selectedLanguage);
  const addNewPaymentMethodLabel = useAutoTranslation("Add New Payment Method", selectedLanguage);
  const editPaymentMethodLabel = useAutoTranslation("Edit Payment Method", selectedLanguage);
  const addNewPaymentMethodDesc = useAutoTranslation(
    "Connect a new payment account to receive funds",
    selectedLanguage
  );
  const editPaymentMethodDesc = useAutoTranslation("Update your payment account details", selectedLanguage);
  const setAsDefaultLabel = useAutoTranslation("Set as default payment account", selectedLanguage);
  const updateAccountLabel = useAutoTranslation("Update Account", selectedLanguage);
  const addAccountLabel = useAutoTranslation("Add Account", selectedLanguage);
  const noAccountsLabel = useAutoTranslation("No payment accounts configured", selectedLanguage);
  const addFirstAccountLabel = useAutoTranslation("Add your first payment method to get started", selectedLanguage);
  const paymentInfoLabel = useAutoTranslation("Payment Information", selectedLanguage);
  const verificationProcessLabel = useAutoTranslation("Verification Process", selectedLanguage);
  const verificationDescLabel = useAutoTranslation(
    "New payment accounts require verification before they can receive funds. This typically takes 1-3 business days.",
    selectedLanguage
  );
  const securityLabel = useAutoTranslation("Security", selectedLanguage);
  const securityDescLabel = useAutoTranslation(
    "Your payment information is encrypted and stored securely. We only display masked account details for your privacy.",
    selectedLanguage
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [newAccount, setNewAccount] = useState<NewAccountState>({
    type: "paypal",
    name: "",
    accountInfo: "",
    isDefault: false,
    cardDetails: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    },
    bankDetails: {
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
    },
  });

  const resetForm = () => {
    setEditingAccount(null);
    setNewAccount({
      type: "paypal",
      name: "",
      accountInfo: "",
      isDefault: false,
      cardDetails: {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
      },
      bankDetails: {
        bankName: "",
        accountNumber: "",
        routingNumber: "",
        swiftCode: "",
      },
    });
  };

  const handleAddOrUpdateAccount = async () => {
    const success = await addOrUpdateAccount(newAccount, editingAccount);
    if (success) {
      resetForm();
      setShowAddForm(false);
    }
  };

  const handleEditAccount = (account: PaymentAccount & { details: any }) => {
    setEditingAccount(account);

    setNewAccount({
      type: account.type,
      name: account.name,
      accountInfo: account.accountInfo,
      isDefault: account.isDefault,
      cardDetails:
        account.type === "card"
          ? {
              cardNumber: account.details?.cardNumber || "",
              expiryDate: account.details?.expiryDate || "",
              cvv: account.details?.cvv || "",
              cardholderName: account.details?.cardholderName || "",
            }
          : { cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" },
      bankDetails:
        account.type === "bank"
          ? {
              bankName: account.details?.bankName || "",
              accountNumber: account.details?.accountNumber || "",
              routingNumber: account.details?.routingNumber || "",
              swiftCode: account.details?.swiftCode || "",
            }
          : { bankName: "", accountNumber: "", routingNumber: "", swiftCode: "" },
    });

    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start mt-8">
        <div>
          <h3 className="text-xs font-semibold text-foreground">{myPaymentAccountsLabel}</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            {useAutoTranslation(
              "Set up and manage your payout accounts. Donations, bids, and purchases will be sent directly to your preferred account.",
              selectedLanguage
            )}
          </p>
        </div>
        <Dialog
          open={showAddForm}
          onOpenChange={(open) => {
            setShowAddForm(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <button className="flex py-2 px-4 gap-2 text-[11px] text-white bg-red-700 rounded-full">
              <Plus className="relative w-3 h-3 top-0.5" />
              {addNewPaymentMethodLabel}
            </button>
          </DialogTrigger>
          <DialogContent  className="max-w-md sm:rounded-md rounded-lg" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-[15px]">
                {editingAccount ? editPaymentMethodLabel : addNewPaymentMethodLabel}
              </DialogTitle>
              <DialogDescription className="text-[11px]">
                {editingAccount ? editPaymentMethodDesc : addNewPaymentMethodDesc}
              </DialogDescription>
            </DialogHeader>

            <PaymentAccountForm newAccount={newAccount} setNewAccount={setNewAccount} editingAccount={editingAccount} />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAccount.isDefault}
                onChange={(e) => setNewAccount((prev) => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border border-input"
              />
              <label htmlFor="isDefault" className="text-[11px]">
                {setAsDefaultLabel}
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 text-xs text-white rounded-full bg-red-700 hover:bg-red-800 px-4 py-2"
                onClick={handleAddOrUpdateAccount}
              >
                {editingAccount ? updateAccountLabel : addAccountLabel}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Table */}
      <div>
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">{noAccountsLabel}</p>
              <p className="text-xs">{addFirstAccountLabel}</p>
            </div>
          ) : (
            <PaymentAccountTable
              accounts={accounts}
              onEditAccount={handleEditAccount}
              onDeleteAccount={deleteAccount}
              onSetDefault={setDefaultAccount}
            />
          )}
        </CardContent>
      </div>

      {/* Information Section */}
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle className="text-xs font-semibold">{paymentInfoLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Verification Process */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-blue-50">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-xs" style={{ fontSize: "11px" }}>
                  {verificationProcessLabel}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{verificationDescLabel}</p>
              </div>
            </div>

            {/* Security */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-green-50">
                <Lock className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-xs" style={{ fontSize: "11px" }}>
                  {securityLabel}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{securityDescLabel}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentAccountsTab;
