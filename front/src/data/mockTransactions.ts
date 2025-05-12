import { Transaction } from "@/types/transaction";

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "sent",
    amount: 50000,
    currency: "IDR",
    paymentMethod: "Credit Card",
    cardLastDigits: "6969",
    status: "success",
    activity: "Sending money to Raihan Fikri",
    recipient: {
      name: "Raihan Zulkifli",
      avatar: "#f97316"
    },
    date: "Aug 28, 2023 3:40 PM"
  },
  {
    id: "2",
    type: "sent",
    amount: 200000,
    currency: "IDR",
    targetCurrency: "20 USD",
    paymentMethod: "Wire Transfer",
    cardLastDigits: "8020",
    status: "success",
    activity: "Sending money to Bani Zulhilmi",
    recipient: {
      name: "Bani Zulhilmi",
      avatar: "#10b981"
    },
    date: "Aug 28, 2023 3:40 PM"
  },
  {
    id: "3",
    type: "received",
    amount: 1500,
    currency: "USD",
    paymentMethod: "Bank Transfer",
    status: "success",
    activity: "Received money from Andrew",
    recipient: {
      name: "Andrew Top G",
      avatar: "/lovable-uploads/75e3b92b-403b-45e3-ae5b-a71b044e1b29.png"
    },
    date: "Aug 28, 2023 3:40 PM"
  },
  {
    id: "4",
    type: "received",
    amount: 2500,
    currency: "USD",
    paymentMethod: "PayPal",
    cardLastDigits: "8a2xtz",
    status: "success",
    activity: "Payment for product",
    recipient: {
      name: "Charista Jewl",
      avatar: "/placeholder.svg"
    },
    date: "Aug 28, 2023 3:40 PM"
  },
  {
    id: "5",
    type: "received",
    amount: 1500,
    currency: "USD",
    paymentMethod: "Payoneer",
    cardLastDigits: "1683",
    status: "incomplete",
    activity: "Payment for invoice",
    recipient: {
      name: "Andrew Top G",
      avatar: "/lovable-uploads/75e3b92b-403b-45e3-ae5b-a71b044e1b29.png"
    },
    date: "Aug 27, 2023 5:30 PM"
  },
  {
    id: "6",
    type: "converted",
    amount: 400000,
    currency: "IDR",
    targetCurrency: "40 USD",
    paymentMethod: "Debit Card",
    cardLastDigits: "3826",
    status: "failed",
    activity: "Convert money from USD to IDR",
    recipient: {
      name: "Bagus Fikri",
      avatar: "/placeholder.svg"
    },
    date: "Aug 27, 2023 3:35 PM"
  },
  {
    id: "7",
    type: "received",
    amount: 500,
    currency: "USD",
    paymentMethod: "Credit Card",
    cardLastDigits: "3426",
    status: "success",
    activity: "Received money from Bani Zulhilmi",
    recipient: {
      name: "Bani Zulhilmi",
      avatar: "#10b981"
    },
    date: "Aug 27, 2023 2:15 PM"
  },
  {
    id: "8",
    type: "received",
    amount: 1000,
    currency: "IDR",
    paymentMethod: "PayPal",
    cardLastDigits: "6a2337m",
    status: "success",
    activity: "Received money from Basilius Kelvin",
    recipient: {
      name: "Basilius Kelvin",
      avatar: "#8b5cf6"
    },
    date: "Aug 27, 2023 11:10 AM"
  },
  {
    id: "9",
    type: "sent",
    amount: 1500000,
    currency: "IDR",
    targetCurrency: "150 USD",
    paymentMethod: "Wire Transfer",
    cardLastDigits: "2324",
    status: "failed",
    activity: "Sending money to Raihan Fikri",
    recipient: {
      name: "Raihan Zulhilmi",
      avatar: "#f97316"
    },
    date: "Aug 27, 2023 09:40 AM"
  }
];

export default mockTransactions;
