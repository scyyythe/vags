import { useNavigate } from "react-router-dom";
import PaymentMethod from "@/components/user_dashboard/Marketplace/buying_process/payment_method/PaymentMethod";
import { usePaymentAccounts } from "@/hooks/accounts/usePaymentAccounts";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const PaymentMethodPage = () => {
  const navigate = useNavigate();
  const { accounts, fetchAccounts } = usePaymentAccounts();
  const [loading, setLoading] = useState(true);

  // Language and translation
  const { language } = useLanguage();
  const paymentAccountsLoadedText = useAutoTranslation("Payment accounts loaded:", language);
  const failedToLoadPaymentAccountsText = useAutoTranslation("Failed to load payment accounts:", language);
  const paymentFormSubmittedText = useAutoTranslation("Payment Form Submitted:", language);

  useEffect(() => {
    const loadAccounts = async () => {
      // Only fetch if we don't have accounts yet
      if (accounts.length === 0) {
        setLoading(true);
        try {
          await fetchAccounts();
          console.log(paymentAccountsLoadedText, accounts);
        } catch (error) {
          console.error(failedToLoadPaymentAccountsText, error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []); // Remove fetchAccounts from dependency array to prevent infinite calls

  return (
    <PaymentMethod
      accounts={accounts}
      loading={loading}
      onBack={() => navigate("/shipping")}
      onContinue={(formData) => {
        console.log(paymentFormSubmittedText, formData);
        
      }}
    />
  );
};

export default PaymentMethodPage;
