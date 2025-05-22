import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const TermsReminder = () => {
  return (
    <Card className="border-none">
      <CardContent className="-ml-6">
        <div className="flex items-start gap-2">
          <FileText className="text-muted-foreground mt-0.5 h-3 w-3" />
          <div>
            <p className="text-muted-foreground text-[10px]">
              By proceeding with this purchase, you acknowledge that all sales are final.
              Payment is required within 48 hours of auction end to avoid cancellation.
              The seller will be notified once payment is received.
            </p>
            <p className="mt-0.5 font-medium text-[9px]">
              <a href="#" className="text-artwork-secondary underline">
                View full Terms & Conditions
              </a>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
