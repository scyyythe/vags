import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download } from "lucide-react";

interface PolicyViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  status: "draft" | "saved";
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export const PolicyViewer = ({
  open,
  onOpenChange,
  title,
  content,
  status,
  version,
  createdAt,
  updatedAt,
}: PolicyViewerProps) => {
  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
              .content { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <div class="meta">
              <p>Status: ${status === "saved" ? "Published" : "Draft"}${version ? ` | Version: ${version}` : ""}</p>
              <p>Created: ${createdAt} | Last Updated: ${updatedAt}</p>
            </div>
            <div class="content">${content}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              {status === "saved" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="h-7 text-xs"
                >
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
              )}
              <Badge variant={status === "saved" ? "default" : "secondary"}>
                {status === "saved" ? `Saved${version ? ` v${version}` : ""}` : "Draft"}
              </Badge>
            </div>
          </div>
          <DialogDescription className="text-xs">
            Created: {createdAt} | Last Updated: {updatedAt}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="text-sm whitespace-pre-wrap">{content || "No content available"}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
