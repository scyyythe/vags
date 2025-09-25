import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { useToast } from "@/hooks/use-toast";
import {
  NewAccountState,
  PaymentAccount,
} from "@/components/user_dashboard/Settings/components/tab/accounts_setup/types/payment";

export const usePaymentAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);

  const maskAccountInfo = (info: string, type: PaymentAccount["type"]) => {
    switch (type) {
      case "paypal":
        return info;
      case "bank":
        return `**** ${info.slice(-4)}`;
      case "gcash":
        return `${info.slice(0, 2)}*******${info.slice(-2)}`;
      case "card":
        return `**** **** **** ${info.slice(-4)}`;
      default:
        return info;
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await apiClient.get("/accounts/");

      const transformed = res.data.map((acc: any) => {
        const rawDate = acc.created_at?.$date || acc.created_at;
        const dateAdded = rawDate ? new Date(rawDate).toLocaleDateString("en-PH") : "N/A";

        return {
          id: acc.id,
          type: acc.type,
          name: acc.name,
          accountInfo: acc.account_info,
          maskedInfo: maskAccountInfo(acc.account_info, acc.type),
          isDefault: acc.is_default,
          status: "pending", // default if backend doesn't provide
          dateAdded,
          details: acc.details || {},
        } as PaymentAccount;
      });

      setAccounts(transformed);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      toast({
        title: "Error",
        description: "Failed to load payment accounts",
        variant: "destructive",
      });
    }
  };

  const addOrUpdateAccount = async (newAccount: NewAccountState, editing?: PaymentAccount) => {
    // Validation
    if (newAccount.type === "card") {
      const { cardNumber, expiryDate, cvv, cardholderName } = newAccount.cardDetails;
      if (!newAccount.name || !cardNumber || !expiryDate || !cvv || !cardholderName) {
        toast({ title: "Error", description: "Please fill in all required card fields", variant: "destructive" });
        return false;
      }
    } else if (!newAccount.name || !newAccount.accountInfo) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return false;
    }

    const payload = {
      type: newAccount.type,
      name: newAccount.name,
      account_info: newAccount.type === "card" ? newAccount.cardDetails.cardNumber : newAccount.accountInfo,
      is_default: newAccount.isDefault,
      details: newAccount.type === "card" ? newAccount.cardDetails : newAccount.bankDetails,
      ...(editing ? { id: editing.id } : {}),
    };

    try {
      await apiClient.post("/accounts/save/", payload);
      await fetchAccounts();
      toast({
        title: editing ? "Updated" : "Added",
        description: editing
          ? "Payment account updated successfully"
          : "Payment account added successfully. Verification pending.",
        variant: "default",
      });
      return true;
    } catch (err) {
      console.error("Failed to save account:", err);
      toast({ title: "Error", description: "Failed to save payment account", variant: "destructive" });
      return false;
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      await apiClient.delete(`/accounts/${accountId}/delete/`);
      await fetchAccounts();
      toast({ title: "Deleted", description: "Payment account has been removed", variant: "default" });
    } catch (err) {
      console.error("Failed to delete account:", err);
      toast({ title: "Error", description: "Failed to delete account", variant: "destructive" });
    }
  };

  const setDefaultAccount = async (id: string) => {
    const account = accounts.find((acc) => acc.id === id);
    if (!account) return;

    const newAccountState: NewAccountState = {
      type: account.type,
      name: account.name,
      accountInfo: account.accountInfo,
      isDefault: true,
      cardDetails: {
        cardNumber: account.type === "card" ? account.accountInfo : "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
      },
      bankDetails: {
        bankName: account.type === "bank" ? account.accountInfo : "",
        accountNumber: account.type === "bank" ? account.accountInfo : "",
        routingNumber: "",
        swiftCode: "",
      },
    };

    const success = await addOrUpdateAccount(newAccountState, account); // <-- pass existing account
    if (success) {
      toast({ title: "Default Updated", description: "Default payment account has been changed", variant: "default" });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return { accounts, addOrUpdateAccount, deleteAccount, setDefaultAccount };
};
