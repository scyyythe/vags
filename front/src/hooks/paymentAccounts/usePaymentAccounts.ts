import { useState } from "react";
import { PaymentAccount, NewAccountState } from "@/components/user_dashboard/Settings/components/tab/accounts_setup/types/payment";
import { useToast } from "@/hooks/use-toast";

const initialAccounts: PaymentAccount[] = [
  {
    id: '1',
    type: 'paypal',
    name: 'Personal PayPal',
    accountInfo: 'jamaicaanuba3@gmail.com',
    maskedInfo: 'jamaicaanuba3@gmail.com',
    isDefault: true,
    status: 'verified',
    dateAdded: '2024-01-15'
  },
  {
    id: '2',
    type: 'bank',
    name: 'Wells Fargo Checking',
    accountInfo: '1234567890123456',
    maskedInfo: '**** 3456',
    isDefault: false,
    status: 'verified',
    dateAdded: '2024-02-10'
  },
  {
    id: '3',
    type: 'gcash',
    name: 'GCash Mobile Wallet',
    accountInfo: '09123456789',
    maskedInfo: '09*******89',
    isDefault: false,
    status: 'verified',
    dateAdded: '2024-02-15'
  },
  {
    id: '4',
    type: 'card',
    name: 'Visa Credit Card',
    accountInfo: '4532123456789012',
    maskedInfo: '**** **** **** 9012',
    isDefault: false,
    status: 'verified',
    dateAdded: '2024-03-01'
  },
  {
    id: '5',
    type: 'payoneer',
    name: 'Payoneer Business',
    accountInfo: 'business@example.com',
    maskedInfo: 'business@example.com',
    isDefault: false,
    status: 'pending',
    dateAdded: '2024-03-10'
  }
];

export const usePaymentAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<PaymentAccount[]>(initialAccounts);

  const maskAccountInfo = (info: string, type: PaymentAccount['type']) => {
    switch (type) {
      case 'paypal':
        return info; // Show full email for PayPal
      case 'bank':
        return `**** ${info.slice(-4)}`;
      case 'gcash':
        const start = info.slice(0, 2);
        const end = info.slice(-2);
        return `${start}*******${end}`;
      case 'card':
        return `**** **** **** ${info.slice(-4)}`;
      default:
        return info;
    }
  };

  const addOrUpdateAccount = (newAccount: NewAccountState, editingAccount?: PaymentAccount | null) => {
    // Validation for card type
    if (newAccount.type === 'card') {
      if (!newAccount.name || !newAccount.cardDetails.cardNumber || !newAccount.cardDetails.expiryDate || !newAccount.cardDetails.cvv || !newAccount.cardDetails.cardholderName) {
        toast({
          title: "Error",
          description: "Please fill in all required card fields",
          variant: "destructive"
        });
        return false;
      }
    } else {
      if (!newAccount.name || !newAccount.accountInfo) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return false;
      }
    }

    const accountInfo = newAccount.type === 'card' ? newAccount.cardDetails.cardNumber : newAccount.accountInfo;
    
    // If this is set as default, update others
    if (newAccount.isDefault) {
      setAccounts(prev => prev.map(acc => ({ ...acc, isDefault: false })));
    }

    if (editingAccount) {
      // Update existing account
      setAccounts(prev => prev.map(acc => 
        acc.id === editingAccount.id 
          ? {
              ...acc,
              type: newAccount.type,
              name: newAccount.name,
              accountInfo: accountInfo,
              maskedInfo: maskAccountInfo(accountInfo, newAccount.type),
              isDefault: newAccount.isDefault,
              status: accountInfo !== editingAccount.accountInfo ? 'pending' : acc.status
            }
          : acc
      ));
      
      toast({
        title: "Success",
        description: "Payment account updated successfully",
        variant: "default"
      });
    } else {
      // Add new account
      const account: PaymentAccount = {
        id: Date.now().toString(),
        type: newAccount.type,
        name: newAccount.name,
        accountInfo: accountInfo,
        maskedInfo: maskAccountInfo(accountInfo, newAccount.type),
        isDefault: newAccount.isDefault,
        status: 'pending',
        dateAdded: new Date().toISOString().split('T')[0]
      };

      setAccounts(prev => [...prev, account]);
      
      toast({
        title: "Success",
        description: "Payment account added successfully. Verification pending.",
        variant: "default"
      });
    }

    return true;
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    toast({
      title: "Account Deleted",
      description: "Payment account has been removed",
      variant: "default"
    });
  };

  const setDefaultAccount = (id: string) => {
    setAccounts(prev => prev.map(acc => ({
      ...acc,
      isDefault: acc.id === id
    })));
    toast({
      title: "Default Updated",
      description: "Default payment account has been changed",
      variant: "default"
    });
  };

  return {
    accounts,
    addOrUpdateAccount,
    deleteAccount,
    setDefaultAccount
  };
};