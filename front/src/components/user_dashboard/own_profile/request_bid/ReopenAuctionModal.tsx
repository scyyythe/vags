import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import DateTimePicker from "./DateTimePicker";
import Confirmation from "./ConfirmRequest";
import { toast } from "sonner";
import { X } from "lucide-react";
import { addDays } from "date-fns";
import { useReopenAuction } from "@/hooks/auction/useReopenAuction";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import { useQueryClient } from "@tanstack/react-query";

interface ReopenAuctionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionId: string;
  artworkTitle: string;
  currentStartTime: string;
  currentEndTime: string;
  currentStartBid: number;
}

const ReopenAuctionModal = ({
  open,
  onOpenChange,
  auctionId,
  artworkTitle,
  currentStartTime,
  currentEndTime,
  currentStartBid,
}: ReopenAuctionModalProps) => {
  const today = new Date();
  const reopenAuction = useReopenAuction();
  const queryClient = useQueryClient();

  // Start date/time
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const now = new Date();
  const [startHours, setStartHours] = useState(now.getHours());
  const [startMinutes, setStartMinutes] = useState(now.getMinutes());

  // End date/time
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [endHours, setEndHours] = useState(0);
  const [endMinutes, setEndMinutes] = useState(0);

  const [startingBid, setStartingBid] = useState(currentStartBid.toString());
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Language and translation
  const { language } = useLanguage();
  const setTermsScheduleText = useAutoTranslation("Set new terms and schedule to reopen your auction", language);
  const setStartingBidText = useAutoTranslation("Set a starting bid", language);
  const enterAmountText = useAutoTranslation("Enter amount", language);
  const setAuctionScheduleText = useAutoTranslation("Set New Auction Schedule", language);
  const auctionStartsOnText = useAutoTranslation("Auction starts on", language);
  const auctionEndsAfterText = useAutoTranslation("Auction ends after", language);
  const durationNoteText = useAutoTranslation("Note: Auction duration cannot exceed 3 days", language);
  const reopenText = useAutoTranslation("Reopen Auction", language);

  // Toast messages
  const selectEndDateText = useAutoTranslation("Please select an end date for the auction", language);
  const validStartingBidText = useAutoTranslation("Please enter a valid starting bid amount", language);
  const endTimeAfterStartText = useAutoTranslation("End time must be after start time", language);
  const durationExceed3DaysText = useAutoTranslation("Auction duration cannot exceed 3 days", language);
  const auctionReopenedSuccessText = useAutoTranslation("Auction reopened successfully", language);
  const failedToReopenAuctionText = useAutoTranslation("Failed to reopen auction", language);

  // Translation for fetched artwork title
  const translatedArtworkTitle = useAutoTranslation(artworkTitle || "", language);

  // Initialize with current auction times when modal opens
  useEffect(() => {
    if (open && currentStartTime && currentEndTime) {
      const startTime = new Date(currentStartTime);
      const endTime = new Date(currentEndTime);

      setStartDate(startTime);
      setStartHours(startTime.getHours());
      setStartMinutes(startTime.getMinutes());

      setEndDate(endTime);
      setEndHours(endTime.getHours());
      setEndMinutes(endTime.getMinutes());
    }
  }, [open, currentStartTime, currentEndTime]);

  const handleReopen = () => {
    if (!startDate) {
      return;
    }

    if (!endDate) {
      toast.error(selectEndDateText, {
        closeButton: true,
      });
      return;
    }

    if (!startingBid || isNaN(Number(startingBid)) || Number(startingBid) <= 0) {
      toast.error(validStartingBidText, {
        closeButton: true,
      });
      return;
    }

    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    if (endDateTime <= startDateTime) {
      toast.error(endTimeAfterStartText, {
        closeButton: true,
      });
      return;
    }

    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    const maxDurationMs = 3 * 24 * 60 * 60 * 1000;
    if (durationMs > maxDurationMs) {
      toast.error(durationExceed3DaysText, {
        closeButton: true,
      });
      return;
    }

    if (durationDays > maxDurationMs) {
      toast.error(durationExceed3DaysText, {
        closeButton: true,
      });
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

    const reopenData = {
      auctionId,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      start_bid_amount: Number(startingBid),
    };

    console.log("Reopening auction with data:", reopenData);

    reopenAuction.mutate(reopenData, {
      onSuccess: () => {
        // Optimistically update the UI immediately
        queryClient.setQueryData(["auctions"], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((auction: any) =>
            auction.id === auctionId
              ? {
                  ...auction,
                  status: "on_going",
                  start_time: startDateTime.toISOString(),
                  end_time: endDateTime.toISOString(),
                  start_bid_amount: Number(startingBid),
                }
              : auction
          );
        });

        queryClient.setQueryData(["myAuctions"], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((auction: any) =>
            auction.id === auctionId
              ? {
                  ...auction,
                  status: "on_going",
                  start_time: startDateTime.toISOString(),
                  end_time: endDateTime.toISOString(),
                  start_bid_amount: Number(startingBid),
                }
              : auction
          );
        });

        queryClient.setQueryData(["biddingArtworks"], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((auction: any) =>
            auction.id === auctionId
              ? {
                  ...auction,
                  status: "on_going",
                  start_time: startDateTime.toISOString(),
                  end_time: endDateTime.toISOString(),
                  start_bid_amount: Number(startingBid),
                }
              : auction
          );
        });

        // Refetch queries in background for data consistency
        queryClient.refetchQueries({ queryKey: ["auctions"] });
        queryClient.refetchQueries({ queryKey: ["myAuctions"] });
        queryClient.refetchQueries({ queryKey: ["biddingArtworks"] });
        queryClient.refetchQueries({ queryKey: ["myParticipatedAuctions"] });

        toast.success(auctionReopenedSuccessText, {
          closeButton: true,
        });
        setIsConfirmationOpen(false);
        onOpenChange(false);
      },
      onError: (error) => {
        const message = error.response?.data?.detail || error.message || failedToReopenAuctionText;
        toast.error(message, {
          closeButton: true,
        });
      },
    });
  };

  // Calculate max end date (start date + 3 days)
  const maxEndDate = startDate ? addDays(startDate, 3) : addDays(today, 3);

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm pr-10 pl-8 py-6 rounded-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
            </DialogClose>
            <DialogTitle className="text-lg font-bold text-left">{translatedArtworkTitle}</DialogTitle>
          </DialogHeader>

          <p className="text-left text-[10px] -mt-3 text-gray-600 dark:text-gray-400">{setTermsScheduleText}</p>

          <div className="mt-3">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2 text-[11px] text-gray-900 dark:text-gray-100">
                    {setStartingBidText}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <Input
                        id="starting-bid"
                        placeholder={enterAmountText}
                        style={{ fontSize: "10px", marginTop: "6px", width: "107%" }}
                        value={startingBid}
                        onChange={(e) => setStartingBid(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-[11px] text-gray-900 dark:text-gray-100">
                  {setAuctionScheduleText}
                </h3>
                <div className="mb-2">
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">{auctionStartsOnText}</p>
                  <DateTimePicker
                    date={startDate}
                    hours={startHours}
                    minutes={startMinutes}
                    onDateChange={setStartDate}
                    onHoursChange={setStartHours}
                    onMinutesChange={setStartMinutes}
                    minDate={new Date(today.getFullYear(), today.getMonth(), today.getDate())}
                  />
                </div>

                <div className="mb-6">
                  <p className="text-[10px] text-gray-600 dark:text-gray-400">{auctionEndsAfterText}</p>
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
                <p className="text-[10px] text-muted-foreground dark:text-gray-400 mb-3">{durationNoteText}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                className="flex-1 p-2 text-white text-xs w-full rounded-full bg-orange-600 hover:bg-orange-700"
                onClick={handleReopen}
              >
                {reopenText}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Confirmation open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen} onConfirm={handleConfirm} />
    </div>
  );
};

export default ReopenAuctionModal;
