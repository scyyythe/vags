export interface Artwork {
  id: string;
  title: string;
  image: string;
  artist: {
    name: string;
    id: string;
  };
  description?: string;
  owner: string;
}

export interface Bid {
  id: string;
  artworkId: string;
  amount: number;
  currency: string;
  auctionEndedAt: string;
  referenceNumber: string;
  auctionId: string;
  paymentDeadline: string;
}

export type PaymentMethod = "creditCard" | "gcash" | "paypal" | "stripe";

export interface ShippingInfo {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface PaymentState {
  selectedPaymentMethod: PaymentMethod | null;
  shippingInfo: ShippingInfo;
  isEditingShipping: boolean;
}
