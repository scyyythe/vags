import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle2, Lock } from "lucide-react";
import { PaymentAccount, NewAccountState } from "./accounts_setup/types/payment";
import { PaymentAccountForm } from "./accounts_setup/PaymentAccountForm";
import { PaymentAccountTable } from "./accounts_setup/PaymentAccountTable";
import { usePaymentAccounts } from "@/hooks/paymentAccounts/usePaymentAccounts";

const PaymentAccountsTab = () => {
  const { accounts, addOrUpdateAccount, deleteAccount, setDefaultAccount } = usePaymentAccounts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [newAccount, setNewAccount] = useState<NewAccountState>({
    type: 'paypal',
    name: '',
    accountInfo: '',
    isDefault: false,
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      swiftCode: ''
    }
  });

  const resetForm = () => {
    setEditingAccount(null);
    setNewAccount({
      type: 'paypal',
      name: '',
      accountInfo: '',
      isDefault: false,
      cardDetails: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      },
      bankDetails: {
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: ''
      }
    });
  };

  const handleAddOrUpdateAccount = () => {
    const success = addOrUpdateAccount(newAccount, editingAccount);
    if (success) {
      resetForm();
      setShowAddForm(false);
    }
  };

  const handleEditAccount = (account: PaymentAccount) => {
    setEditingAccount(account);
    
    // Pre-populate the add form with existing account data
    setNewAccount({
      type: account.type,
      name: account.name,
      accountInfo: account.accountInfo,
      isDefault: account.isDefault,
      cardDetails: {
        cardNumber: account.type === 'card' ? account.accountInfo : '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      },
      bankDetails: {
        bankName: '',
        accountNumber: account.type === 'bank' ? account.accountInfo : '',
        routingNumber: '',
        swiftCode: ''
      }
    });
    
    // Show the add form instead of edit form
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-semibold text-foreground">My Payment Accounts</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Set up and manage your payout accounts. Donations, bids, and purchases will be sent directly to your preferred account.
          </p>
        </div>
        <Dialog open={showAddForm} onOpenChange={(open) => {
          setShowAddForm(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <button className="flex py-2 px-4 gap-2 text-[11px] text-white bg-red-700 rounded-full">
              <Plus className="relative w-3 h-3 top-0.5" />
              Add New Payment Method
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="text-[15px]">{editingAccount ? 'Edit Payment Method' : 'Add New Payment Method'}</DialogTitle>
              <DialogDescription className="text-[11px]">
                {editingAccount ? 'Update your payment account details' : 'Connect a new payment account to receive funds'}
              </DialogDescription>
            </DialogHeader>
            
            <PaymentAccountForm
              newAccount={newAccount}
              setNewAccount={setNewAccount}
              editingAccount={editingAccount}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={newAccount.isDefault}
                onChange={(e) => setNewAccount(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border border-input"
              />
              <label htmlFor="isDefault" className="text-[11px]">
                Set as default payment account
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 text-xs text-white rounded-full bg-red-700 hover:bg-red-800 px-4 py-2"
                onClick={handleAddOrUpdateAccount}
              >
                {editingAccount ? 'Update Account' : 'Add Account'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accounts Table */}
      <div>
        {/* <div className="mb-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            Payment Accounts
          </p>
          <p className="text-xs text-muted-foreground">
            Manage your connected payment methods and withdrawal preferences
          </p>
        </div> */}
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No payment accounts configured</p>
              <p className="text-sm">Add your first payment method to get started</p>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-semibold">Payment Information</CardTitle>
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
                  Verification Process
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  New payment accounts require verification before they can receive funds. 
                  This typically takes 1-3 business days.
                </p>
              </div>
            </div>

            {/* Security */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-md bg-green-50">
                <Lock className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-xs" style={{ fontSize: "11px" }}>
                  Security
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Your payment information is encrypted and stored securely. 
                  We only display masked account details for your privacy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentAccountsTab;