export type TransactionType = "sent" | "received" | "converted";
export type TransactionStatus = "success" | "failed" | "incomplete";
export type PaymentMethod = 
  | "Credit Card" 
  | "Wire Transfer" 
  | "Bank Transfer" 
  | "PayPal" 
  | "Payoneer" 
  | "Debit Card";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  targetCurrency?: string;
  paymentMethod: PaymentMethod;
  cardLastDigits?: string;
  status: TransactionStatus;
  activity: string;
  recipient: {
    name: string;
    avatar: string;
  };
  date: string;
}