export const COUNTRIES = ["Philippines", "United States", "Canada", "United Kingdom", "Australia"];

export const PAYMENT_METHODS = [
  {
    id: "paypal",
    name: "PayPal",
    icon: "/pics/paypal.png",
  },
  {
    id: "gcash",
    name: "GCash",
    icon: "/pics/gcash.png",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: "/pics/stripe.png",
  },
  {
    id: "credit-card",
    name: "Credit Card",
    icon: "https://img.icons8.com/skeuomorphism/96/bank-card-back-side.png",
  },
] as const;
