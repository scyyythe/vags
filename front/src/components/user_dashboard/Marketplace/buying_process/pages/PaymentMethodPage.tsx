import { useNavigate } from "react-router-dom";
import PaymentMethod from "@/components/user_dashboard/Marketplace/buying_process/payment_method/PaymentMethod";
import { usePaymentAccounts } from "@/hooks/accounts/usePaymentAccounts";
import { useEffect, useState } from "react";

const PaymentMethodPage = () => {
  const navigate = useNavigate();
  const { accounts, fetchAccounts } = usePaymentAccounts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccounts = async () => {
      // Only fetch if we don't have accounts yet
      if (accounts.length === 0) {
        setLoading(true);
        try {
          await fetchAccounts();
          console.log("Payment accounts loaded:", accounts);
        } catch (error) {
          console.error("Failed to load payment accounts:", error);
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
        console.log("Payment Form Submitted:", formData);
        navigate("/checkout-confirmation");
      }}
    />
  );
};

export default PaymentMethodPage;
