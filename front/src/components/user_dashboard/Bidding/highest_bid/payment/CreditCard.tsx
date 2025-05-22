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
    <div className="overflow-hidden">
        <div className="p-4 text-center text-xs text-gray-900 font-semibold border-none -mb-6">
          Credit/Debit Card Payment
        </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="cardName" className="text-gray-700 text-[11px]">Name on Card</Label>
            <Input 
              id="cardName" 
              placeholder="Enter your card name" 
              required 
              className="border-gray-300 rounded-full h-8"
              style={{fontSize:"10px"}}
            />
          </div>
              
          <div className="space-y-2">
            <Label htmlFor="cardNumber" className="text-gray-700 text-[11px]">Card Number</Label>
            <Input 
              id="cardNumber" 
              placeholder="1234 5678 9012 3456" 
              required 
              className="border-gray-300 rounded-full h-8"
              style={{fontSize:"10px"}}
            />
          </div>
              
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-gray-700 text-[11px]">Expiry Date</Label>
              <Input 
                id="expiry" 
                placeholder="MM/YY" 
                required 
                className="border-gray-300 rounded-full h-8"
                style={{fontSize:"10px"}}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc" className="text-gray-700 text-[11px]">CVC</Label>
              <Input 
                id="cvc" 
                placeholder="123" 
                required 
                className="border-gray-300 rounded-full h-8"
                style={{fontSize:"10px"}}
              />
            </div>
          </div>
              
          <div className="flex items-center justify-between mt-6 mb-2">
            <div className="flex items-center">
              <i className='bx bx-shield text-gray-400 text-xs'></i>
              <span className="ml-2 text-[10px] text-gray-500">Secured by Stripe</span>
            </div>
            <div className="flex space-x-2">
              <i className='bx bxl-mastercard text-lg text-gray-500' ></i>
              <i className='bx bxl-visa text-lg text-gray-500' ></i>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-9 bg-red-700 hover:bg-red-600 rounded-full text-[11px]"
          >
            Pay ₱5,000.00
          </Button>
        </form>
      </div>
    </div>
  );
};
