import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "@/context/PaymentContext";
import { CreditCard } from "lucide-react";

export const CreditCardPayment = () => {
  const { confirmPurchase } = usePayment();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmPurchase();
  };

  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50 to-white pb-6">
        <CardTitle className="flex items-center text-gray-900">
          <CreditCard className="mr-2 h-5 w-5 text-red-500" />
          Credit/Debit Card Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="cardName" className="text-gray-700">Name on Card</Label>
            <Input 
              id="cardName" 
              placeholder="John Smith" 
              required 
              className="border-gray-300 focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-lg"
            />
          </div>
              
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-gray-700">Card Number</Label>
            <Input 
              id="cardNumber" 
              placeholder="1234 5678 9012 3456" 
              required 
              className="border-gray-300 focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-lg"
            />
          </div>
              
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-gray-700">Expiry Date</Label>
              <Input 
                id="expiry" 
                placeholder="MM/YY" 
                required 
                className="border-gray-300 focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc" className="text-gray-700">CVC</Label>
              <Input 
                id="cvc" 
                placeholder="123" 
                required 
                className="border-gray-300 focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50 rounded-lg"
              />
            </div>
          </div>
              
          <div className="flex items-center justify-between mt-6 mb-2">
            <div className="flex items-center">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-gray-400" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.83-3.4 8.94-7 10-3.6-1.06-7-5.17-7-10V6.3l7-3.12z" />
              </svg>
              <span className="ml-2 text-xs text-gray-500">Secured by Stripe</span>
            </div>
            <div className="flex space-x-2">
              <img src="https://cdn.jsdelivr.net/gh/creativetimofficial/public-assets@master/soft-ui-design-system/assets/img/logos/mastercard.png" alt="mastercard" className="h-6" />
              <img src="https://cdn.jsdelivr.net/gh/creativetimofficial/public-assets@master/soft-ui-design-system/assets/img/logos/visa.png" alt="visa" className="h-6" />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600 rounded-lg py-6"
          >
            Pay ₱5,000.00
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
