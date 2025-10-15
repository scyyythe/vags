export interface PaymentFormData {
  paymentMethod: "paypal" | "gcash" | "stripe" | "credit-card";
  // Credit Card fields
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  nameOnCard: string;
  country: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  saveCard: boolean;
  // PayPal fields
  paypalEmail: string;
  paypalPassword: string;
  rememberPayPal: boolean;
  // GCash fields
  gcashNumber: string;
  gcashPin: string;
  // Stripe fields
  stripeEmail: string;
}

export interface PaymentAccount {
  id: string;
  type: "paypal" | "stripe" | "bank" | "gcash" | "payoneer" | "card";
  name: string;
  accountInfo: string;
  qrCodeUrl?: string;
  maskedInfo: string;
  isDefault: boolean;
  status: "verified" | "pending" | "not_verified";
  dateAdded: string;
  stripeAccountId?: string;
}

export interface PaymentMethodProps {
  accounts?: PaymentAccount[];
  loading?: boolean;
  onBack: () => void;
  onContinue: (paymentData: PaymentFormData) => void;
}
