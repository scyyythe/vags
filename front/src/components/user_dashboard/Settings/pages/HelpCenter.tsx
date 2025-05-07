import React from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HelpCenter = () => {
  const faqItems = [
    {
      question: "How do I change my password?",
      answer: "Go to Security tab in your settings, click the edit icon next to your current password, then follow the prompts to set a new password."
    },
    {
      question: "How do I update my profile information?",
      answer: "Navigate to Account Details in your settings, then click the edit icon next to any field you want to update."
    },
    {
      question: "How do I delete my account?",
      answer: "Go to Account Details in your settings, scroll down to the 'Deactivation and Deletion' section, and click 'Delete Account'."
    },
    {
      question: "How do I update my notification preferences?",
      answer: "Visit the Notifications tab in your settings, then toggle on or off the notifications you want to receive."
    }
  ];

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">Help Center</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-xs font-medium mb-2">Need help?</h3>
        <p className="text-gray-600 text-[11px] mb-5">
          Find answers to common questions or contact our support team for assistance.
        </p>
        
        <button className="bg-red-800 hover:bg-red-700 text-white text-[11px] py-1 px-2 rounded-sm">Contact Support</button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xs font-medium mb-4">Frequently Asked Questions</h3>
        
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-[11px]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-600 text-[11px]">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default HelpCenter;
