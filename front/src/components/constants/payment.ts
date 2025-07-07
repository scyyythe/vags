export const COUNTRIES = ["Philippines", "United States", "Canada", "United Kingdom", "Australia"]

export const PAYMENT_METHODS = [
  {
    id: "paypal",
    name: "PayPal",
    icon: "P",
    bgColor: "bg-blue-600",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
  {
    id: "gcash",
    name: "GCash",
    icon: "G",
    bgColor: "bg-blue-500 rounded-full",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: "S",
    bgColor: "bg-purple-600",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
  },
  {
    id: "credit-card",
    name: "Credit Card",
    icon: "card",
    bgColor: "bg-blue-400",
    buttonColor: "",
  },
] as const
