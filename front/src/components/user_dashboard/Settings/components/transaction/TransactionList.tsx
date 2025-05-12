import React from "react";
import { Transaction, TransactionType, TransactionStatus } from "@/types/transaction";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Check, X } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case "sent":
        return <ArrowUp className="h-3 w-3 text-red-800" />;
      case "received":
        return <ArrowDown className="h-3 w-3 text-green-600" />;
      case "converted":
        return (
          <div className="h-3 w-3 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-[8px] text-white">↑↓</span>
          </div>
        );
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "success":
        return (
          <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="h-2 w-2 text-white" />
          </div>
        );
      case "failed":
        return (
          <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
            <X className="h-2 w-2 text-white" />
          </div>
        );
      case "incomplete":
        return (
          <div className="h-4 w-4 rounded-full bg-gray-300 flex items-center justify-center">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500" />
          </div>
        );
    }
  };

  const formatAmount = (amount: number, currency: string, type: TransactionType) => {
    const prefix = type === "sent" ? "- " : type === "received" ? "+ " : "";
    return `${prefix}${Math.abs(amount).toLocaleString()} ${currency}`;
  };

  const formatCardDigits = (digits?: string) => {
    return digits ? `•••• ${digits}` : "";
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[700px] text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 text-left font-semibold text-gray-600 pl-2">TYPE</th>
            <th className="py-3 text-left font-semibold text-gray-600">AMOUNT</th>
            <th className="py-3 text-left font-semibold text-gray-600">PAYMENT METHOD</th>
            <th className="py-3 text-left font-semibold text-gray-600">STATUS</th>
            <th className="py-3 text-left font-semibold text-gray-600">ACTIVITY</th>
            <th className="py-3 text-left font-semibold text-gray-600">PEOPLE</th>
            <th className="py-3 text-left font-semibold text-gray-600">DATE</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr 
              key={transaction.id} 
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 pl-2 align-middle">
                <div className="flex items-center space-x-2">
                  <div className="rounded-full h-5 w-5 bg-gray-100 flex items-center justify-center">
                    {getTypeIcon(transaction.type)}
                  </div>
                  <span className="capitalize">{transaction.type}</span>
                </div>
              </td>
              <td className="py-3">
                <div>
                  <div className={cn(
                    "font-medium",
                    transaction.type === "sent" && "text-red-700",
                    transaction.type === "received" && "text-green-700",
                    transaction.type === "converted" && "text-blue-700"
                  )}>
                    {formatAmount(transaction.amount, transaction.currency, transaction.type)}
                  </div>
                  {transaction.targetCurrency && (
                    <div className="text-[10px] text-gray-500">
                      {transaction.targetCurrency}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3">
                <div>
                  <div>{transaction.paymentMethod}</div>
                  {transaction.cardLastDigits && (
                    <div className="text-[10px] text-gray-500">
                      {formatCardDigits(transaction.cardLastDigits)}
                    </div>
                  )}
                </div>
              </td>
              <td className="py-3">
                <div className="flex items-center space-x-1.5">
                  {getStatusIcon(transaction.status)}
                  <span className={cn(
                    transaction.status === "success" && "text-green-600",
                    transaction.status === "failed" && "text-red-600",
                    transaction.status === "incomplete" && "text-gray-500"
                  )}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              </td>
              <td className="py-3">{transaction.activity}</td>
              <td className="py-3">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                    {transaction.recipient.avatar.startsWith('#') ? (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: transaction.recipient.avatar }}>
                        <span className="text-white text-[10px] font-medium">
                          {transaction.recipient.name.charAt(0)}
                        </span>
                      </div>
                    ) : (
                      <img src={transaction.recipient.avatar} alt={transaction.recipient.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span>{transaction.recipient.name}</span>
                </div>
              </td>
              <td className="py-3">{transaction.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
