import React from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

const HelpCenter = () => {
  const { language: selectedLanguage } = useLanguage();

  // Auto-translated labels
  const helpCenterLabel = useAutoTranslation("Help Center", selectedLanguage);
  const needHelpLabel = useAutoTranslation("Need help?", selectedLanguage);
  const faqLabel = useAutoTranslation("Frequently Asked Questions", selectedLanguage);
  const contactSupportLabel = useAutoTranslation("Contact Support", selectedLanguage);
  const helpDescription = useAutoTranslation(
    "Find answers to common questions or contact our support team for assistance.",
    selectedLanguage
  );

  const faqItems = [
    {
      question: useAutoTranslation("How do I change my password?", selectedLanguage),
      answer: useAutoTranslation(
        "Go to Security tab in your settings, click the edit icon next to your current password, then follow the prompts to set a new password.",
        selectedLanguage
      ),
    },
    {
      question: useAutoTranslation("How do I update my profile information?", selectedLanguage),
      answer: useAutoTranslation(
        "Navigate to Account Details in your settings, then click the edit icon next to any field you want to update.",
        selectedLanguage
      ),
    },
    {
      question: useAutoTranslation("How do I delete my account?", selectedLanguage),
      answer: useAutoTranslation(
        "Go to Account Details in your settings, scroll down to the 'Deactivation and Deletion' section, and click 'Delete Account'.",
        selectedLanguage
      ),
    },
    {
      question: useAutoTranslation("How do I update my notification preferences?", selectedLanguage),
      answer: useAutoTranslation(
        "Visit the Notifications tab in your settings, then toggle on or off the notifications you want to receive.",
        selectedLanguage
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-sm font-bold mb-6">{helpCenterLabel}</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-xs font-medium mb-2">{needHelpLabel}</h3>
        <p className="text-gray-600 text-[11px] mb-5">{helpDescription}</p>
        
        <button className="bg-red-800 hover:bg-red-700 text-white text-[11px] py-1 px-2 rounded-sm">
          {contactSupportLabel}
        </button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xs font-medium mb-4">{faqLabel}</h3>
        
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
