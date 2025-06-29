import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import DateTimePicker from "./DateTimePicker";
import Confirmation from "./ConfirmRequest";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { X } from "lucide-react";
import { addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useCreateAuction } from "@/hooks/auction/useCreateAuction";
interface AuctionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworkId: string;
  artworkTitle: string;
}

const RequestBid = ({ open, artworkId, onOpenChange, artworkTitle }: AuctionDialogProps) => {
  const today = new Date();
  const createAuction = useCreateAuction();
  const navigate = useNavigate();
  // Start date/time
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const now = new Date();
  const [startHours, setStartHours] = useState(now.getHours());
  const [startMinutes, setStartMinutes] = useState(now.getMinutes());

  // End date/time
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [endHours, setEndHours] = useState(0);
  const [endMinutes, setEndMinutes] = useState(0);

  const [startingBid, setStartingBid] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const handlePublish = () => {
    if (!startDate) {
      // toast.error("Please select a start date for the auction");
      // toast({
      //   title: "Missing start date",
      //   description: "Please select a start date for the auction",
      //   variant: "destructive",
      // });
      return;
    }

    if (!endDate) {
      toast.error("Please select an end date for the auction");
      // toast({
      //   title: "Missing end date",
      //   description: "Please select an end date for the auction",
      //   variant: "destructive",
      // });
      return;
    }

    if (!startingBid || isNaN(Number(startingBid)) || Number(startingBid) <= 0) {
      toast.error("Please enter a valid starting bid amount");
      // toast({
      //   title: "Invalid starting bid",
      //   description: "Please enter a valid starting bid amount",
      //   variant: "destructive",
      // });
      return;
    }

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      // toast({
      //   title: "Invalid auction duration",
      //   description: "End time must be after start time",
      //   variant: "destructive",
      // });
      return;
    }

    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    const maxDurationMs = 3 * 24 * 60 * 60 * 1000;
    if (durationMs > maxDurationMs) {
      toast.error("Auction duration cannot exceed 3 days");
      return;
    }

    if (durationDays > maxDurationMs) {
      toast.error("Auction duration cannot exceed 3 days");
      // toast({
      //   title: "Invalid auction duration",
      //   description: "Auction duration cannot exceed 3 days",
      //   variant: "destructive",
      // });
      return;
    }

    setIsConfirmationOpen(true);
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!startDate || !endDate) return;

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    createAuction.mutate(
      {
        artwork_id: artworkId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        start_bid_amount: Number(startingBid),
      },
      {
        onSuccess: () => {
          toast.success("Auction created successfully");
          // toast({
          //   title: "Auction created successfully",
          //   description: "Your auction has been published",
          // });

          setIsConfirmationOpen(false);
          onOpenChange(false);
        },
        onError: (error) => {
          const message = error.response?.data?.error || error.message || "Failed to create auction";
          toast.error(message);
        },
      }
    );
  };

  // Calculate max end date (start date + 3 days)
  const maxEndDate = startDate ? addDays(startDate, 3) : addDays(today, 3);

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm pr-10 pl-8 py-6 rounded-md">
          <DialogHeader className="text-center">
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
            </DialogClose>
            <DialogTitle className="text-lg font-bold text-left">{artworkTitle}</DialogTitle>
          </DialogHeader>

          <p className="text-left text-[10px] -mt-3">Set your terms and schedule to start auctioning your artwork</p>

          <div className="space-y-6 mt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2 text-[11px]">Set a starting bid</h3>
                <div className="space-y-2">
                  <div>
                    <Input
                      id="starting-bid"
                      placeholder="Enter amount"
                      style={{ fontSize: "10px", marginTop: "6px", width: "107%" }}
                      value={startingBid}
                      onChange={(e) => setStartingBid(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 text-[11px]">Set Auction Schedule</h3>
              <div className="mb-2">
                <p className="text-[10px]">Auction starts on</p>
                <DateTimePicker
                  date={startDate}
                  hours={startHours}
                  minutes={startMinutes}
                  onDateChange={setStartDate}
                  onHoursChange={setStartHours}
                  onMinutesChange={setStartMinutes}
                  minDate={today}
                />
              </div>

              <div className="mb-8">
                <p className="text-[10px]">Auction ends after</p>
                <DateTimePicker
                  date={endDate}
                  hours={endHours}
                  minutes={endMinutes}
                  onDateChange={setEndDate}
                  onHoursChange={setEndHours}
                  onMinutesChange={setEndMinutes}
                  minDate={startDate || today}
                  maxDate={maxEndDate}
                />
              </div>
              <p className="text-[10px] text-muted-foreground -mb-3">Note: Auction duration cannot exceed 3 days</p>
            </div>

            <div className="flex space-x-2">
              <button
                className="flex-1 p-2 bg-red-800 hover:bg-red-700 text-white text-xs w-full rounded-full"
                onClick={handlePublish}
              >
                Publish
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Confirmation open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen} onConfirm={handleConfirm} />
    </div>
  );
};

export default RequestBid;
