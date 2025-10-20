import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { Link } from "react-router-dom";
import TermsAndConditionsModal from "@/components/modals/TermsAndConditionsModal";

const HelpCenter = () => {
  const { language: selectedLanguage } = useLanguage();
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Prevent background scrolling when Terms modal is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (isTermsOpen) {
      html.classList.add("overflow-hidden");
      body.classList.add("overflow-hidden");
    } else {
      html.classList.remove("overflow-hidden");
      body.classList.remove("overflow-hidden");
    }
    return () => {
      html.classList.remove("overflow-hidden");
      body.classList.remove("overflow-hidden");
    };
  }, [isTermsOpen]);

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
        
        <button className="bg-red-800 hover:bg-red-700 text-white text-[11px] py-1.5 px-4 rounded-full">
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

      {/* Legal & Policy section */}
      <div className="mt-8">
        {/* <div className="border-t border-gray-200 pt-6" /> */}

        <div>
          <h3 className="text-xs font-medium mb-4">
            {useAutoTranslation("Legal & Policy", selectedLanguage)}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Terms & Conditions */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-[11px] font-medium mb-1">
                {useAutoTranslation("Terms & Conditions", selectedLanguage)}
              </h4>
              <p className="text-gray-600 text-[11px] mb-3">
                {useAutoTranslation(
                  "Read the rules and responsibilities that apply when using our platform.",
                  selectedLanguage
                )}
              </p>
              <div className="flex justify-left">
                <button
                  onClick={() => setIsTermsOpen(true)}
                  className="bg-red-800 hover:bg-red-700 text-white text-[11px] py-1.5 px-4 rounded-full"
                >
                  {useAutoTranslation("View Terms", selectedLanguage)}
                </button>
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-[11px] font-medium mb-1">
                {useAutoTranslation("Privacy Policy", selectedLanguage)}
              </h4>
              <p className="text-gray-600 text-[11px] mb-3">
                {useAutoTranslation(
                  "Learn how we collect and protect your personal information.",
                  selectedLanguage
                )}
              </p>
              <div className="flex justify-left">
                <Link
                  to="/privacy"
                  className="bg-black hover:bg-gray-800 text-white text-[11px] py-1.5 px-4 rounded-full"
                >
                  {useAutoTranslation("View Policy", selectedLanguage)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms modal */}
      <TermsAndConditionsModal
        isOpen={isTermsOpen}
        onAgree={() => setIsTermsOpen(false)}
        onExit={() => setIsTermsOpen(false)}
      />
    </div>
  );
};

export default HelpCenter;
