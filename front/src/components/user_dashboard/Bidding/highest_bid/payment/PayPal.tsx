import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "@/context/PaymentContext";

export const PayPalPayment = () => {
  const { confirmPurchase } = usePayment();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmPurchase();
  };

  return (
    <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-yellow-50 to-white pb-6">
        <CardTitle className="flex items-center text-gray-900">
          <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 text-blue-700" fill="currentColor">
            <path d="M19.897 5.821l.453-.369c-.932-1.116-2.374-1.769-4.038-1.769h-5.271c-.334 0-.646.156-.82.435l-3.068 4.757c-.107.158-.162.345-.162.535v2.377c0 .568.448 1.031 1 1.031h2.631l-.915 5.112c-.066.31.109.62.4.74.196.084.403.043.564-.091l5.381-4.373c.161-.131.255-.33.255-.542v-1.651l-.078-.394h1.456c1.614 0 2.906-.947 3.287-2.34.272-.995.055-1.965-.575-2.668zm-1.31 2.422c-.215.84-1.020 1.304-1.979 1.304h-2.68c-.134 0-.248.107-.248.246v1.75l-4.17 3.38c-.031.026-.079.012-.084-.021l.921-5.14c.03-.182-.104-.35-.278-.35h-3.345c-.141 0-.256-.115-.256-.258v-1.717l2.843-4.439c.046-.072.123-.116.213-.116h4.815c1.206 0 2.152.439 2.672 1.207l.183.285c.315.566.324 1.291.143 1.869z" />
          </svg>
          PayPal Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="paypalEmail" className="text-gray-700">PayPal Email</Label>
            <Input 
              id="paypalEmail" 
              type="email"
              placeholder="email@example.com" 
              required 
              className="border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
            />
          </div>
          
          <div className="flex items-center justify-center my-4">
            <div className="bg-gray-100 rounded-xl p-4 w-full text-center">
              <p className="text-sm text-gray-600">You'll be redirected to PayPal to complete your payment securely.</p>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-700 hover:bg-blue-800 rounded-lg py-6"
          >
            Pay with PayPal
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
