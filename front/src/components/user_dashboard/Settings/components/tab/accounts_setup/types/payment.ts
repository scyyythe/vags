export interface PaymentAccount {
  id: string;
  type: "paypal" | "stripe" | "bank" | "gcash" | "payoneer" | "card";
  name: string;
  accountInfo: string;
  maskedInfo: string;
  isDefault: boolean;
  status: "verified" | "pending" | "not_verified";
  dateAdded: string;
}

export interface NewAccountState {
  type: PaymentAccount["type"];
  name: string;
  accountInfo: string;
  isDefault: boolean;
  cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
  };
  details?: any;
}
