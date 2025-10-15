import React from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreditCard, DollarSign, Banknote, Smartphone, Trash2, Edit3, Shield } from "lucide-react";
import { PaymentAccount } from "../accounts_setup/types/payment";

// Separate component for each table row to avoid hooks in loops
const PaymentAccountRow: React.FC<{
  account: PaymentAccount;
  onEditAccount: (account: PaymentAccount) => void;
  onDeleteAccount: (id: string) => void;
  onSetDefault: (id: string) => void;
  getProviderName: (type: PaymentAccount["type"]) => string;
  getStatusColor: (status: PaymentAccount["status"]) => string;
  getStatusText: (status: PaymentAccount["status"]) => string;
  paymentMethodIcons: Record<string, React.ReactNode>;
  defaultLabel: string;
  setDefaultLabel: string;
  editLabel: string;
  deleteLabel: string;
  deletePaymentTitle: string;
  deletePaymentDescription: string;
  cancelLabel: string;
  confirmDeleteLabel: string;
  naLabel: string;
}> = ({
  account,
  onEditAccount,
  onDeleteAccount,
  onSetDefault,
  getProviderName,
  getStatusColor,
  getStatusText,
  paymentMethodIcons,
  defaultLabel,
  setDefaultLabel,
  editLabel,
  deleteLabel,
  deletePaymentTitle,
  deletePaymentDescription,
  cancelLabel,
  confirmDeleteLabel,
  naLabel,
}) => {
  const { language: selectedLanguage } = useLanguage();
  const translatedAccountName = useAutoTranslation(account.name || "", selectedLanguage);

  return (
    <TableRow key={account.id} className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg flex items-center justify-center">
            {paymentMethodIcons[account.type]}
          </div>
          <div>
            <div className="font-medium text-[11px] text-gray-800">{getProviderName(account.type)}</div>
            <div className="text-[10px] text-gray-500">{translatedAccountName}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-[11px]">{account.maskedInfo}</span>
          {account.isDefault && (
            <Badge variant="outline" className="w-fit mt-1 gap-1 text-[10px] border-gray-300">
              <Shield className="w-3 h-3" />
              {defaultLabel}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className={getStatusColor(account.status || "pending")}>
          {getStatusText(account.status || "pending")}
        </span>
      </TableCell>
      <TableCell className="text-gray-500 text-[11px]">{account.dateAdded || naLabel}</TableCell>

      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-6">
          {!account.isDefault && (
            <button onClick={() => onSetDefault(account.id)} className="text-[10px] text-blue-600 hover:underline px-1">
              {setDefaultLabel}
            </button>
          )}
          <button
            onClick={() => onEditAccount(account)}
            className="flex text-[10px] text-gray-700 hover:underline gap-1 px-1"
          >
            <Edit3 className="w-3 h-3 relative top-1" />
            {editLabel}
          </button>

          {/* Delete Confirmation Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex text-[10px] text-red-500 hover:underline gap-1 px-1">
                <Trash2 className="w-3 h-3 relative top-1" />
                {deleteLabel}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[350px] bg-opacity-60">
              <AlertDialogHeader className="mb-2">
                <AlertDialogTitle className="text-[13px] text-center">{deletePaymentTitle}</AlertDialogTitle>
                <AlertDialogDescription className="text-[11px] text-center">
                  {deletePaymentDescription}
                </AlertDialogDescription>
              </AlertDialogHeader>

              {/* Centered Buttons */}
              <div className="flex items-center justify-center gap-4">
                <AlertDialogCancel className="w-full rounded-full text-[11px] bg-gray-300">
                  {cancelLabel}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDeleteAccount(account.id)}
                  className="w-full rounded-full bg-red-700 text-white hover:bg-red-600 text-[11px]"
                >
                  {confirmDeleteLabel}
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );
};

interface PaymentAccountTableProps {
  accounts: PaymentAccount[];
  onEditAccount: (account: PaymentAccount) => void;
  onDeleteAccount: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const PaymentAccountTable: React.FC<PaymentAccountTableProps> = ({
  accounts,
  onEditAccount,
  onDeleteAccount,
  onSetDefault,
}) => {
  const { language: selectedLanguage } = useLanguage();
  // Translatable texts
  const providerLabel = useAutoTranslation("Provider", selectedLanguage);
  const accountLabel = useAutoTranslation("Account", selectedLanguage);
  const statusLabel = useAutoTranslation("Status", selectedLanguage);
  const addedLabel = useAutoTranslation("Added", selectedLanguage);
  const actionsLabel = useAutoTranslation("Actions", selectedLanguage);
  const defaultLabel = useAutoTranslation("Default", selectedLanguage);
  const setDefaultLabel = useAutoTranslation("Set Default", selectedLanguage);
  const editLabel = useAutoTranslation("Edit", selectedLanguage);
  const deleteLabel = useAutoTranslation("Delete", selectedLanguage);
  const deletePaymentTitle = useAutoTranslation("Delete Payment Account", selectedLanguage);
  const deletePaymentDescription = useAutoTranslation(
    "Are you sure you want to delete this payment account? This action cannot be undone.",
    selectedLanguage
  );
  const cancelLabel = useAutoTranslation("Cancel", selectedLanguage);
  const confirmDeleteLabel = useAutoTranslation("Delete", selectedLanguage);
  const verifiedLabel = useAutoTranslation("verified", selectedLanguage);
  const pendingLabel = useAutoTranslation("pending", selectedLanguage);
  const notVerifiedLabel = useAutoTranslation("not verified", selectedLanguage);
  const naLabel = useAutoTranslation("N/A", selectedLanguage);

  // Provider names
  const paypalLabel = useAutoTranslation("PayPal", selectedLanguage);
  const stripeLabel = useAutoTranslation("Stripe", selectedLanguage);
  const bankLabel = useAutoTranslation("Bank Transfer", selectedLanguage);
  const gcashLabel = useAutoTranslation("GCash", selectedLanguage);
  const payoneerLabel = useAutoTranslation("Payoneer", selectedLanguage);
  const cardLabel = useAutoTranslation("Credit/Debit Card", selectedLanguage);

  const paymentMethodIcons = {
    paypal: <DollarSign className="w-3 h-3 text-red-500" />,
    stripe: <CreditCard className="w-3 h-3 text-red-500" />,
    bank: <Banknote className="w-3 h-3 text-red-500" />,
    gcash: <Smartphone className="w-3 h-3 text-red-500" />,
    payoneer: <DollarSign className="w-3 h-3 text-red-500" />,
    card: <CreditCard className="w-3 h-3 text-red-500" />,
  };

  const getStatusColor = (status: PaymentAccount["status"]) => {
    switch (status) {
      case "verified":
        return "bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full";
      case "pending":
        return "bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded-full";
      case "not_verified":
        return "bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full";
    }
  };

  const getStatusText = (status: PaymentAccount["status"]) => {
    switch (status) {
      case "verified":
        return verifiedLabel;
      case "pending":
        return pendingLabel;
      case "not_verified":
        return notVerifiedLabel;
      default:
        return pendingLabel;
    }
  };

  const getProviderName = (type: PaymentAccount["type"]) => {
    switch (type) {
      case "paypal":
        return paypalLabel;
      case "stripe":
        return stripeLabel;
      case "bank":
        return bankLabel;
      case "gcash":
        return gcashLabel;
      case "payoneer":
        return payoneerLabel;
      case "card":
        return cardLabel;
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-[11px]">{providerLabel}</TableHead>
            <TableHead className="text-[11px]">{accountLabel}</TableHead>
            <TableHead className="text-[11px]">{statusLabel}</TableHead>
            <TableHead className="text-[11px]">{addedLabel}</TableHead>
            <TableHead className="text-right text-[11px]">{actionsLabel}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {accounts.map((account) => (
            <PaymentAccountRow
              key={account.id}
              account={account}
              onEditAccount={onEditAccount}
              onDeleteAccount={onDeleteAccount}
              onSetDefault={onSetDefault}
              getProviderName={getProviderName}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              paymentMethodIcons={paymentMethodIcons}
              defaultLabel={defaultLabel}
              setDefaultLabel={setDefaultLabel}
              editLabel={editLabel}
              deleteLabel={deleteLabel}
              deletePaymentTitle={deletePaymentTitle}
              deletePaymentDescription={deletePaymentDescription}
              cancelLabel={cancelLabel}
              confirmDeleteLabel={confirmDeleteLabel}
              naLabel={naLabel}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
