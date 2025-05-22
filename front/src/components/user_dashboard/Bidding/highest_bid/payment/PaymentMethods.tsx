import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethod } from "@/components/types/index";
import { usePayment } from "@/context/PaymentContext";
import { CreditCard, ArrowRight, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PaymentMethods = () => {
  const { selectedPaymentMethod, selectPaymentMethod } = usePayment();
  const navigate = useNavigate();

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { 
      id: "gcash", 
      label: "GCash",
      icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 10H4c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h16c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1z" />
      </svg>,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    { 
      id: "paypal", 
      label: "PayPal",
      icon: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M19.897 5.821l.453-.369c-.932-1.116-2.374-1.769-4.038-1.769h-5.271c-.334 0-.646.156-.82.435l-3.068 4.757c-.107.158-.162.345-.162.535v2.377c0 .568.448 1.031 1 1.031h2.631l-.915 5.112c-.066.31.109.62.4.74.196.084.403.043.564-.091l5.381-4.373c.161-.131.255-.33.255-.542v-1.651l-.078-.394h1.456c1.614 0 2.906-.947 3.287-2.34.272-.995.055-1.965-.575-2.668zm-1.31 2.422c-.215.84-1.020 1.304-1.979 1.304h-2.68c-.134 0-.248.107-.248.246v1.75l-4.17 3.38c-.031.026-.079.012-.084-.021l.921-5.14c.03-.182-.104-.35-.278-.35h-3.345c-.141 0-.256-.115-.256-.258v-1.717l2.843-4.439c.046-.072.123-.116.213-.116h4.815c1.206 0 2.152.439 2.672 1.207l.183.285c.315.566.324 1.291.143 1.869z" />
      </svg>,
      color: "bg-blue-700 hover:bg-blue-800"
    },
    { 
      id: "creditCard", 
      label: "Credit/Debit Card",
      icon: <CreditCard className="h-4 w-4" />,
      color: "bg-red-500 hover:bg-red-600"
    }
  ];

  const handleProceedToPayment = () => {
    if (selectedPaymentMethod) {
      navigate("/payment");
    }
  };

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-white to-gray-50 border-b">
        <CardTitle className="flex items-center justify-between text-xl">
          <span className="text-gray-800">Payment Methods</span>
          {selectedPaymentMethod && (
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleProceedToPayment}
            >
              Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <Button
              key={method.id}
              variant={selectedPaymentMethod === method.id ? "default" : "outline"}
              className={`h-16 justify-start transition-all ${
                selectedPaymentMethod === method.id
                  ? `${method.color} text-white`
                  : "hover:bg-gray-50 border-2"
              } rounded-xl`}
              onClick={() => selectPaymentMethod(method.id)}
            >
              <div className="flex items-center">
                {method.icon}
                <span className="ml-2">{method.label}</span>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-500 mr-2" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.83-3.4 8.94-7 10-3.6-1.06-7-5.17-7-10V6.3l7-3.12z" />
            </svg>
            <p className="text-sm text-gray-600">
              All payment methods are secured with end-to-end encryption. Your financial information is never stored on our servers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
