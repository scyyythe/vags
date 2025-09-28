import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const getProviderName = (type: PaymentAccount["type"]) => {
    switch (type) {
      case "paypal":
        return "PayPal";
      case "stripe":
        return "Stripe";
      case "bank":
        return "Bank Transfer";
      case "gcash":
        return "GCash";
      case "payoneer":
        return "Payoneer";
      case "card":
        return "Credit/Debit Card";
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="text-[11px]">Provider</TableHead>
            <TableHead className="text-[11px]">Account</TableHead>
            <TableHead className="text-[11px]">Status</TableHead>
            <TableHead className="text-[11px]">Added</TableHead>
            <TableHead className="text-right text-[11px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg flex items-center justify-center">
                    {paymentMethodIcons[account.type]}
                  </div>
                  <div>
                    <div className="font-medium text-[11px] text-gray-800">{getProviderName(account.type)}</div>
                    <div className="text-[10px] text-gray-500">{account.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-[11px]">{account.maskedInfo}</span>
                  {account.isDefault && (
                    <Badge variant="outline" className="w-fit mt-1 gap-1 text-[10px] border-gray-300">
                      <Shield className="w-3 h-3" />
                      Default
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className={getStatusColor(account.status || "pending")}>
                  {(account.status || "pending").replace("_", " ")}
                </span>
              </TableCell>
              <TableCell className="text-gray-500 text-[11px]">{account.dateAdded || "N/A"}</TableCell>

              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-6">
                  {!account.isDefault && (
                    <button
                      onClick={() => onSetDefault(account.id)}
                      className="text-[10px] text-blue-600 hover:underline px-1"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => onEditAccount(account)}
                    className="flex text-[10px] text-gray-700 hover:underline gap-1 px-1"
                  >
                    <Edit3 className="w-3 h-3 relative top-1" />
                    Edit
                  </button>

                  {/* Delete Confirmation Dialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex text-[10px] text-red-500 hover:underline gap-1 px-1">
                        <Trash2 className="w-3 h-3 relative top-1" />
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-[350px] bg-opacity-60">
                      <AlertDialogHeader className="mb-2">
                        <AlertDialogTitle className="text-[13px] text-center">Delete Payment Account</AlertDialogTitle>
                        <AlertDialogDescription className="text-[11px] text-center">
                          Are you sure you want to delete "{account.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      {/* Centered Buttons */}
                      <div className="flex items-center justify-center gap-4">
                        <AlertDialogCancel className="w-full rounded-full text-[11px] bg-gray-300">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteAccount(account.id)}
                          className="w-full rounded-full bg-red-700 text-white hover:bg-red-600 text-[11px]"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
