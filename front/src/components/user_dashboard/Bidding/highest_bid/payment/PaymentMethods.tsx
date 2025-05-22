import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethod } from "@/components/types/index";
import { usePayment } from "@/context/PaymentContext";
import { useNavigate } from "react-router-dom";

export const PaymentMethods = () => {
  const { selectedPaymentMethod, selectPaymentMethod } = usePayment();

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; color: string }[] = [
    { 
      id: "gcash", 
      label: "GCash",
      icon: <img src="/pics/gcash.png" className="h-4 w-4" />,
      color: "bg-blue-500 hover:bg-blue-600"
    },
    { 
      id: "paypal", 
      label: "PayPal",
      icon: <img src="/pics/paypal.png" className="h-4 w-4" />,
      color: "bg-blue-700 hover:bg-blue-800"
    },
    { 
      id: "creditCard", 
      label: "Credit/Debit Card",
      icon: <i className='bx bx-credit-card-alt text-blue-700'></i>,
      color: "bg-red-500 hover:bg-red-600"
    },
    { 
      id: "stripe", 
      label: "Stripe",
      icon: <img src="/pics/stripe.png" className="h-4 w-4" />,
      color: "bg-blue-700 hover:bg-blue-800"
    },
  ];

  return (
    <Card className="border-0 overflow-hidden">
      <CardHeader className="-mb-8">
        <CardTitle className="flex items-center justify-between text-xs">
          <span className="text-gray-800">Payment Methods</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {paymentMethods.map((method) => (
            <Button
              key={method.id}
              onClick={() => selectPaymentMethod(method.id)}
              variant={selectedPaymentMethod === method.id ? "default" : "outline"}
              className={`h-10 justify-start transition-all ${
                selectedPaymentMethod === method.id
                  ? `${method.color} text-white ring-2 ring-offset-2 ring-primary`
                  : "hover:bg-gray-50"
              } rounded-xl`}
            >
              <div className="flex items-center">
                {method.icon}
                <span className="text-[10px] ml-2">{method.label}</span>
              </div>
            </Button>
          ))}
        </div>
        <div className="mt-6">
          <div className="flex items-center">
            <i className='bx bx-shield text-sm text-gray-500 mr-2 pb-0.5'></i>
            <p className="text-[10px] text-gray-600">
              All payment methods are secured with end-to-end encryption. Your financial information is never stored on our servers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
