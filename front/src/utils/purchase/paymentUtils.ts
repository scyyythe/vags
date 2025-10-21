export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ""
  const parts = []
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  if (parts.length) {
    return parts.join(" ")
  } else {
    return v
  }
}

export const formatExpiryDate = (value: string): string => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  if (v.length >= 2) {
    return v.substring(0, 2) + "/" + v.substring(2, 4)
  }
  return v
}

export const handleThirdPartyPayment = (method: string): void => {
  switch (method) {
    case "paypal":
      window.open("https://www.paypal.com/signin", "_blank")
      break
    case "gcash":
      window.open("https://www.gcash.com", "_blank")
      break
    case "stripe":
      window.open("https://checkout.stripe.com", "_blank")
      break
    default:
      break
  }
}

// export const validatePaymentForm = (formData: any): boolean => {
//   switch (formData.paymentMethod) {
//     case "paypal":
//       return formData.paypalEmail.length > 0 && formData.paypalPassword.length > 0
//     case "stripe":
//       return formData.stripeEmail.length > 0
//     case "credit-card":
//       return (
//         formData.cardNumber.length > 0 &&
//         formData.expiryDate.length > 0 &&
//         formData.cvc.length > 0 &&
//         formData.nameOnCard.length > 0 &&
//         formData.addressLine1.length > 0 &&
//         formData.city.length > 0 &&
//         formData.postalCode.length > 0
//       )
//     default:
//       return false
//   }
// }
