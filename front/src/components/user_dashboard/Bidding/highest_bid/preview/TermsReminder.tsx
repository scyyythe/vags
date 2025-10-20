import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";

export const TermsReminder = () => {
  const { language } = useLanguage();

  // Translation hooks
  const termsReminderText = useAutoTranslation(
    "By proceeding with this purchase, you acknowledge that all sales are final. Payment is required within 48 hours of auction end to avoid cancellation. The seller will be notified once payment is received.",
    language
  );
  const viewFullTermsText = useAutoTranslation("View full Terms & Conditions", language);

  return (
    <Card className="border-none">
      <CardContent className="-ml-6">
        <div className="flex items-start gap-2">
          <i className='bx bx-file text-gray-500 text-xs'></i>
          <div>
            <p className="text-muted-foreground text-[10px]">
              {termsReminderText}
            </p>
            <p className="mt-0.5 font-medium text-[9px]">
              <a href="#" className="text-artwork-secondary underline">
                {viewFullTermsText}
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
