import { useState, useEffect } from "react";
import apiClient from "@/utils/apiClient";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  NewAccountState,
  PaymentAccount,
} from "@/components/user_dashboard/Settings/components/tab/accounts_setup/types/payment";

export const usePaymentAccounts = () => {
  const queryClient = useQueryClient();
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
          status: "pending",
          qrCodeUrl: acc.qr_image_url || null,
          dateAdded,
          details: acc.details || {},
        } as PaymentAccount;
      });

      console.log("Transformed accounts:", transformed);
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
    const formData = new FormData();

    formData.append("type", newAccount.type);
    formData.append("name", newAccount.name);
    formData.append(
      "account_info",
      newAccount.type === "card" ? newAccount.cardDetails.cardNumber : newAccount.accountInfo
    );
    formData.append("is_default", newAccount.isDefault ? "true" : "false");

    if (newAccount.type === "stripe" && newAccount.stripeAccountId) {
      formData.append("stripe_account_id", newAccount.stripeAccountId);
    }
    if (editing) {
      formData.append("id", editing.id);
    }

    if (newAccount.qrCodeUrl) {
      const response = await fetch(newAccount.qrCodeUrl);
      const blob = await response.blob();
      formData.append("qr_image", blob, "qr_image.png");
    }

    try {
      await apiClient.post("/accounts/save/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchAccounts();

      // Invalidate marketplace queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });

      toast({
        title: editing ? "Updated" : "Added",
        description: editing
          ? "Payment account updated successfully"
          : "Payment account added successfully. Verification pending.",
      });

      return true;
    } catch (err) {
      console.error("Failed to save account:", err);
      toast({
        title: "Error",
        description: "Failed to save payment account",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      await apiClient.delete(`/accounts/${accountId}/delete/`);
      await fetchAccounts();
      
      // Invalidate marketplace queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["marketplace-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["trending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["followedArtworks"] });
      queryClient.invalidateQueries({ queryKey: ["my-sell-art-cards"] });
      queryClient.invalidateQueries({ queryKey: ["user-sell-art-cards"] });
      
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

  return { accounts, addOrUpdateAccount, deleteAccount, setDefaultAccount, fetchAccounts };
};
