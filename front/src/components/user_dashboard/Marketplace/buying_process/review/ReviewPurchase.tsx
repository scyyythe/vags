import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import useDefaultAddress from "@/hooks/users/address/useDefaultAddress";
import { usePurchase } from "@/context/PurchaseContext";
import usePurchaseArtwork from "@/hooks/purchase/usePurchaseArtwork";
import useUpdateArtwork from "@/hooks/mutate/artwork/useArtworkMutate";
import { usePayPalPurchase } from "@/hooks/paypal/usePayPalPurchase";
import { useLocation } from "react-router-dom";
import { useArtistPaymentAccounts, type PaymentAccount } from "@/hooks/accounts/useArtistPaymentAccounts";
import { PurchaseProvider } from "@/context/PurchaseContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

import { toast } from "sonner";
interface ReviewPurchaseProps {
  onBack: () => void;
  onSubmit: () => void;
  selectedAddress?: {
    name: string;
    address: string;
    city: string;
  };
  selectedPaymentMethod?: {
    type: string;
    details: string;
  };
  artwork?: {
    id: string;
    artworkImage: string;
    title: string;
    artist: string;
    artistId?: string;
    size: string;
    style: string;
    medium: string;
    edition: string;
    yearCreated: number;
    price: number;
    originalPrice?: number;
    default_paypal_email?: string;
    quantity?: number;
  };
}

const ReviewPurchase: React.FC<ReviewPurchaseProps> = ({
  onBack,
  onSubmit,
  selectedAddress,
  selectedPaymentMethod,
  artwork,
}) => {
  const navigate = useNavigate();
  const { artwork: contextArtwork } = usePurchase();
  const { data: defaultAddress, isLoading: isAddressLoading } = useDefaultAddress();
  const { artwork: purchasedArtwork } = usePurchase();
  const purchaseMutation = usePurchaseArtwork();
  const updateArtworkMutation = useUpdateArtwork(1, true, "All", "Public");
  const [step, setStep] = useState<"review" | "paypal">("review");
  const [showReceiptPopup, setShowReceiptPopup] = useState(false);
  const [paymentValidationError, setPaymentValidationError] = useState<string | null>(null);

  // Language and translation
  const { language } = useLanguage();
  const reviewPurchaseText = useAutoTranslation("Review Purchase", language);
  const addressText = useAutoTranslation("Address", language);
  const changeText = useAutoTranslation("Change", language);
  const orderConfirmedText = useAutoTranslation("After your order is confirmed, a specialist will contact you to coordinate your purchase.", language);
  const paymentMethodText = useAutoTranslation("Payment Method", language);
  const sendMoneyToText = useAutoTranslation("Send money to:", language);
  const loadingPaymentDetailsText = useAutoTranslation("Loading payment details...", language);
  const loadingAddressText = useAutoTranslation("Loading address...", language);
  const noDefaultAddressText = useAutoTranslation("No default address set.", language);
  const purchaseProtectedText = useAutoTranslation("Your purchase is protected.", language);
  const learnMoreText = useAutoTranslation("Learn more about Worxist's buyer protection", language);
  const sizeText = useAutoTranslation("Size", language);
  const styleText = useAutoTranslation("Style", language);
  const mediumText = useAutoTranslation("Medium", language);
  const editionText = useAutoTranslation("Edition", language);
  const yearCreatedText = useAutoTranslation("Year Created", language);
  const quantityText = useAutoTranslation("Quantity", language);
  const totalPriceText = useAutoTranslation("TOTAL PRICE", language);
  const priceText = useAutoTranslation("PRICE", language);
  const submitText = useAutoTranslation("Submit", language);
  const agreeTermsText = useAutoTranslation("By clicking Submit, I agree to Worxist's", language);
  const termsConditionsText = useAutoTranslation("General Terms and Conditions of Sale", language);
  const paymentCompleteText = useAutoTranslation("Payment Complete!", language);
  const sendReceiptText = useAutoTranslation("You can now send your receipt to the owner as proof.", language);
  const payWithPayPalText = useAutoTranslation("Pay with PayPal", language);
  const cancelGoBackText = useAutoTranslation("Cancel and go back", language);
  const paymentMethodErrorText = useAutoTranslation("Payment Method Error:", language);
  const changePaymentMethodText = useAutoTranslation("Change Payment Method", language);
  const byText = useAutoTranslation("by", language);
  
  // Toast messages
  const missingInfoText = useAutoTranslation("Missing required information.", language);
  const artistPaymentNotAvailableText = useAutoTranslation("Artist payment information is not available. Please contact support or try again later.", language);
  const purchaseSuccessText = useAutoTranslation("Your purchase has been successfully completed!", language);
  const purchaseFailedText = useAutoTranslation("Failed to complete purchase.", language);
  const paymentSuccessText = useAutoTranslation("Payment completed successfully!", language);
  const paymentFailedText = useAutoTranslation("Payment failed, try again.", language);
  
  // Validation messages
  const noPaymentMethodsText = useAutoTranslation("Artist has no payment methods configured", language);
  const artistDoesntSupportText = useAutoTranslation("Artist doesn't support", language);
  const supportedMethodsText = useAutoTranslation("Supported methods:", language);
  const noPaymentDetailsText = useAutoTranslation("No payment details available", language);
  const paymentDetailsNotAvailableText = useAutoTranslation("Payment details not available", language);
  const artistPaymentInfoNotAvailableText = useAutoTranslation("Artist payment information not available", language);
  const accountConnectedText = useAutoTranslation("account connected", language);
  
  // Payment method names
  const paypalText = useAutoTranslation("PayPal", language);
  const gcashText = useAutoTranslation("GCash", language);
  const stripeText = useAutoTranslation("Stripe", language);
  const creditCardText = useAutoTranslation("Credit Card", language);

  // Get artist ID from artwork
  const artistId = contextArtwork?.artistId || artwork?.artistId;
  const { accounts: artistAccounts, loading: artistAccountsLoading } = useArtistPaymentAccounts(artistId);

  const handleAddressChange = () => {
    navigate("/shipping");
  };
  useEffect(() => {
    console.log("ReviewPurchase - Artist ID:", artistId);
    console.log("ReviewPurchase - Context Artwork:", contextArtwork);
    console.log("ReviewPurchase - Artwork Prop:", artwork);
    console.log("ReviewPurchase - Artist Accounts:", artistAccounts);
  }, [artistId, contextArtwork, artwork, artistAccounts]);
  const handlePaymentMethodChange = () => {
    navigate("/payment-method");
  };

  // Validate if artist supports the selected payment method
  const validatePaymentMethod = (selectedMethod: string) => {
    if (!artistAccounts || artistAccounts.length === 0) {
      return { isValid: false, error: noPaymentMethodsText };
    }

    const supportedMethods = artistAccounts.map((acc) => acc.type.toLowerCase());
    const selectedMethodLower = selectedMethod.toLowerCase();

    // Map payment method names to account types
    const methodMapping: Record<string, string> = {
      paypal: "paypal",
      gcash: "gcash",
      stripe: "stripe",
      "credit card": "creditcard",
    };

    const mappedMethod = methodMapping[selectedMethodLower];
    if (!mappedMethod || !supportedMethods.includes(mappedMethod)) {
      const supportedMethodNames = supportedMethods
        .map((method) => {
          switch (method) {
            case "paypal":
              return paypalText;
            case "gcash":
              return gcashText;
            case "stripe":
              return stripeText;
            case "creditcard":
              return creditCardText;
            default:
              return method;
          }
        })
        .join(", ");

      return {
        isValid: false,
        error: `${artistDoesntSupportText} ${selectedMethod}. ${supportedMethodsText} ${supportedMethodNames}`,
      };
    }

    return { isValid: true, error: null };
  };

  // Get artist's payment account details for display
  const getArtistPaymentDetails = (paymentMethod: string) => {
    // If no artistId is available, show error message
    if (!artistId) {
      return artistPaymentInfoNotAvailableText;
    }

    if (!artistAccounts || artistAccounts.length === 0) return noPaymentDetailsText;

    const methodMapping: Record<string, string> = {
      paypal: "paypal",
      gcash: "gcash",
      stripe: "stripe",
      "credit card": "creditcard",
    };

    const mappedMethod = methodMapping[paymentMethod.toLowerCase()];
    const account = artistAccounts.find((acc) => acc.type.toLowerCase() === mappedMethod);

    if (!account) return paymentDetailsNotAvailableText;

    // Display non-sensitive information
    switch (account.type.toLowerCase()) {
      case "paypal":
        // For PayPal, account_info might be the email directly, or check email field
        if (account.email) {
          return account.email; // Email addresses should not be translated
        }
        if (typeof account.account_info === "string") {
          return account.account_info; // If account_info is the email string
        }
        if (account.account_info?.email) {
          return account.account_info.email;
        }
        return `${paypalText} ${accountConnectedText}`;
      case "gcash":
        if (account.name) {
          return account.name; // Return the name directly, will be translated in the display
        }

        const gcashNumber =
          account.accountNumber ||
          (typeof account.account_info === "string" ? account.account_info : account.account_info?.accountNumber);
        return gcashNumber ? `${gcashNumber.slice(0, 2)}*******${gcashNumber.slice(-2)}` : `${gcashText} ${accountConnectedText}`;
      case "stripe":
        return account.email || account.account_info?.email || `${stripeText} ${accountConnectedText}`; // Email not translated
      case "creditcard":
        const cardNumber = account.accountNumber || account.account_info?.accountNumber;
        return cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : `${creditCardText} ${accountConnectedText}`;
      default:
        return accountConnectedText;
    }
  };

  const handleSubmit = async () => {
    const defaultArtwork = artwork || purchasedArtwork;
    const paymentMethod = defaultPaymentMethod?.type; // e.g. "Stripe", "GCash", etc.

    if (!finalAddress || !defaultArtwork?.id || !paymentMethod) {
      console.error("Missing required information.", {
        finalAddress,
        defaultArtwork,
        paymentMethod,
      });
      toast.error(missingInfoText);
      return;
    }

    // Check if artist ID is available for payment validation
    if (!artistId) {
      setPaymentValidationError(artistPaymentNotAvailableText);
      toast.error(artistPaymentNotAvailableText);
      return;
    }

    // Validate payment method compatibility
    const validation = validatePaymentMethod(paymentMethod);
    if (!validation.isValid) {
      setPaymentValidationError(validation.error);
      toast.error(validation.error);
      return;
    }

    // Clear any previous validation errors
    setPaymentValidationError(null);

    // If PayPal → go to PayPal flow
    if (paymentMethod === "PayPal") {
      setStep("paypal");
      return;
    }

    // If GCash → show receipt popup
    if (paymentMethod === "GCash") {
      setShowReceiptPopup(true);
      setTimeout(() => {
        setShowReceiptPopup(false);
      }, 10000);
    }

    // Otherwise (Stripe, Credit Card) → normal purchase API
    const payload = {
      artwork_id: defaultArtwork.id,
      payment_method: paymentMethod,
      is_paid: true,
      quantity: defaultArtwork.quantity || 1,
      shipping_address: {
        name: finalAddress.name,
        address: finalAddress.address,
        city: finalAddress.city,
        state: finalAddress.state || "N/A",
        country: "Philippines",
        postal_code: finalAddress.postalCode || "0000",
        phone: finalAddress.phone || "0000-000-0000",
      },
    };

    try {
      console.log("Submitting purchase payload:", payload);

      await purchaseMutation.mutateAsync(payload);

      toast.success(purchaseSuccessText);

      const userId = localStorage.getItem("user_id");
      if (userId) {
        navigate(`/userprofile/${userId}`, {
          state: {
            mainTab: "myPurchase",
            subTab: "paid",
            activeSubGroup: "listings",
          },
        });
      } else {
        navigate("/marketplace");
      }
    } catch (error: any) {
      console.error("Purchase Error Full:", error?.response?.data || error);
      const errorMessage = JSON.stringify(error?.response?.data) || error?.message || purchaseFailedText;
      toast.error(errorMessage);
    }
  };

  // // Default data if not provided
  const fallbackAddress = {
    name: "No Name",
    address: "No Address",
    city: "No City",
  };

  const displayAddress = defaultAddress || fallbackAddress;
  const location = useLocation();
  const passedPaymentMethod = location.state?.selectedPaymentMethod;

  const defaultPaymentMethod = passedPaymentMethod ||
    selectedPaymentMethod || {
      type: "PayPal",
      details: "(display the major short details of the payment method)",
    };

  const defaultArtwork = contextArtwork ||
    artwork ||
    purchasedArtwork || {
      id: "placeholder-id",
      artworkImage: "/placeholder.svg?height=200&width=200",
      title: "Butterfly",
      artist: "Angie Canete",
      size: "11 x 8.5 inches",
      style: "Painting",
      medium: "Canvas",
      edition: "Limited Edition",
      yearCreated: 2025,
      price: 100000,
      originalPrice: 100000,
      default_paypal_email: "no email provided",
      quantity: 1,
    };

  // Translation for fetched artwork data
  const translatedArtworkTitle = useAutoTranslation(defaultArtwork?.title || "", language);
  const translatedArtist = useAutoTranslation(defaultArtwork?.artist || "", language);
  const translatedSize = useAutoTranslation(defaultArtwork?.size || "", language);
  const translatedStyle = useAutoTranslation(defaultArtwork?.style || "", language);
  const translatedMedium = useAutoTranslation(defaultArtwork?.medium || "", language);
  const translatedEdition = useAutoTranslation(defaultArtwork?.edition || "", language);

  // Translation for fetched address data
  const translatedAddressCity = useAutoTranslation(displayAddress?.city || "", language);
  const translatedAddressLine = useAutoTranslation(displayAddress?.address || "", language);

  const { paypalRef, startPayment } = usePayPalPurchase({
    amount: defaultArtwork?.price || 0, // Price is already the total (price × quantity)
    buyerId: localStorage.getItem("user_id")!,
    artworkId: defaultArtwork?.id || "",
    defaultPayPalEmail: defaultArtwork?.default_paypal_email || "",
    onSuccess: (details) => {
      toast.success(paymentSuccessText);

      // Navigate to user profile with MY PURCHASE tab and Paid subtab selected
      const userId = localStorage.getItem("user_id");
      if (userId) {
        navigate(`/userprofile/${userId}`, {
          state: {
            mainTab: "myPurchase",
            subTab: "paid",
            activeSubGroup: "listings",
          },
        });
      } else {
        navigate("/marketplace");
      }
    },
    onError: (err) => {
      toast.error(paymentFailedText);
      console.error(err);
    },
  });
  const selectedAddressFromState = location.state?.selectedAddress;

  const finalAddress = selectedAddressFromState || defaultAddress;

  // Get payment details and translate if needed (must be after defaultPaymentMethod is defined)
  const paymentDetails = getArtistPaymentDetails(defaultPaymentMethod.type);
  const translatedPaymentDetails = useAutoTranslation(paymentDetails, language);

  useEffect(() => {
    if (step === "paypal" && paypalRef.current) {
      startPayment();
    }
  }, [step]);

  // Disable scrolling when modal OR receipt popup is open
  useEffect(() => {
    if (showReceiptPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showReceiptPopup]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 pt-20 max-w-6xl">
        <div className="mb-8">
          <button onClick={() => navigate("/payment-method")} className="flex items-center text-sm font-semibold">
            <i className="bx bx-chevron-left text-lg mr-2"></i>
            {reviewPurchaseText}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-6">
          {/* Left Column - Address and Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center mb-4 gap-6">
                {isAddressLoading ? (
                  <p className="text-[11px] text-gray-400">{loadingAddressText}</p>
                ) : defaultAddress ? (
                  <>
                    <h3 className="text-xs font-semibold text-gray-900">{addressText} [{translatedAddressCity}]</h3>
                    <p className="text-[11px] text-gray-600">{translatedAddressLine}</p>
                  </>
                ) : (
                  <p className="text-[11px] text-red-600">{noDefaultAddressText}</p>
                )}
              </div>
                <button
                  onClick={handleAddressChange}
                  className="text-xs font-medium text-gray-900 underline hover:text-gray-700"
                >
                  {changeText}
                </button>
              </div>
              <p className="text-[11px] text-gray-600">
                {orderConfirmedText}
              </p>
            </div>

            {/* Payment Method Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-900">{paymentMethodText}</h3>
                <button
                  onClick={handlePaymentMethodChange}
                  className="text-xs font-medium text-gray-900 underline hover:text-gray-700"
                >
                  {changeText}
                </button>
              </div>

              <div className="flex items-center space-x-3 mb-3">
                {defaultPaymentMethod.type === "PayPal" && (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/pics/paypal.png" alt="paypal" />
                  </div>
                )}
                {defaultPaymentMethod.type === "GCash" && (
                  <div className="w-8 h-8 flex items-center justify-center">
                    <img src="/pics/gcash.png" alt="paypal" />
                  </div>
                )}
                {defaultPaymentMethod.type === "Stripe" && (
                  <div className="w-8 h-8 items-center justify-center">
                    <img src="/pics/stripe.png" alt="paypal" />
                  </div>
                )}
                {defaultPaymentMethod.type === "Credit Card" && (
                  <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="https://img.icons8.com/skeuomorphism/96/bank-card-back-side.png" />
                    </svg>
                  </div>
                )}
                <span className="text-xs font-medium">{defaultPaymentMethod.type}</span>
              </div>

              <p className="text-[11px] text-gray-600">
                {artistAccountsLoading
                  ? loadingPaymentDetailsText
                  : `${sendMoneyToText} ${translatedPaymentDetails}`}
              </p>

              {/* Payment validation error */}
              {paymentValidationError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-[10px] text-red-600">
                  <p className="font-medium">{paymentMethodErrorText}</p>
                  <p>{paymentValidationError}</p>
                  <button
                    onClick={handlePaymentMethodChange}
                    className="mt-1 text-red-700 underline hover:text-red-800"
                  >
                    {changePaymentMethodText}
                  </button>
                </div>
              )}
            </div>

            {/* Buyer Protection */}
            <div className="flex items-center space-x-2 text-[11px] text-gray-600">
              <i className="bx bxs-check-circle text-black text-sm"></i>
              <span>{purchaseProtectedText}</span>
              <button className="text-blue-600 underline hover:text-blue-700">
                {learnMoreText}
              </button>
            </div>
          </div>

          {/* Right Column - Artwork Details */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg py-8 px-10 space-y-4">
              {/* Artwork Image */}
              <div className="flex justify-center">
                <div className="w-32 h-32 bg-black rounded-lg overflow-hidden">
                  <img
                    src={defaultArtwork.artworkImage || "/placeholder.svg"}
                    alt={translatedArtworkTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Artwork Title and Artist */}
              <div className="text-center mb-4">
                <h3 className="text-md font-semibold text-gray-900">{translatedArtworkTitle}</h3>
                <p className="text-xs text-gray-600">{byText} {translatedArtist}</p>
              </div>

              {/* Artwork Details */}
              <div className="space-y-2 text-xs pt-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{sizeText}</span>
                  <span className="font-medium">{translatedSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{styleText}</span>
                  <span className="font-medium">{translatedStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{mediumText}</span>
                  <span className="font-medium">{translatedMedium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{editionText}</span>
                  <span className="font-medium">{translatedEdition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{yearCreatedText}</span>
                  <span className="font-medium">{defaultArtwork.yearCreated}</span>
                </div>
                {defaultArtwork.quantity && defaultArtwork.quantity > 1 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{quantityText}</span>
                    <span className="font-medium">{defaultArtwork.quantity}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="pt-6">
                {defaultArtwork.quantity && defaultArtwork.quantity > 1 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{totalPriceText}</span>
                      <span className="text-xl font-bold text-red-800">
                        ₱{defaultArtwork.price >= 1000 ? `${defaultArtwork.price / 1000}k` : defaultArtwork.price}
                      </span>
                    </div>
                    {defaultArtwork.originalPrice && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                          ({defaultArtwork.quantity} × ₱
                          {defaultArtwork.originalPrice >= 1000
                            ? `${defaultArtwork.originalPrice / 1000}k`
                            : defaultArtwork.originalPrice}
                          )
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">{priceText}</span>
                    <span className="text-xl font-bold text-red-800">
                      ₱{defaultArtwork.price >= 1000 ? `${defaultArtwork.price / 1000}k` : defaultArtwork.price}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="px-6 py-8">
          <div className="flex flex-col items-start space-y-4">
            <button
              onClick={handleSubmit}
              className="bg-red-800 text-white text-[11px] px-16 py-2.5 rounded-full font-medium hover:bg-red-700 transition-colors"
            >
              {submitText}
            </button>
            <p className="text-[11px] text-gray-500 text-center max-w-md whitespace-nowrap">
              {agreeTermsText}{" "}
              <button className="text-blue-600 underline hover:text-blue-700">
                {termsConditionsText}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Receipt Popup */}
      {showReceiptPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 text-center max-w-xs mx-auto">
            <h2 className="text-sm font-semibold text-red-700 mb-2">{paymentCompleteText}</h2>
            <p className="text-xs text-black">{sendReceiptText}</p>
          </div>
        </div>
      )}

      {step === "paypal" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-center">
            <h2 className="text-xs font-small mb-4">{payWithPayPalText}</h2>
            <div ref={paypalRef} className="mx-auto" />
            <button onClick={() => setStep("review")} className="mt-4 text-xs text-gray-500 underline">
              {cancelGoBackText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component to ensure PurchaseProvider context is available
const ReviewPurchaseWrapper: React.FC<ReviewPurchaseProps> = (props) => {
  return (
    <PurchaseProvider>
      <ReviewPurchase {...props} />
    </PurchaseProvider>
  );
};

export default ReviewPurchaseWrapper;
