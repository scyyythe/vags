import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import DateTimePicker from "./DateTimePicker";
import Confirmation from "./ConfirmRequest";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { addDays } from "date-fns";

interface AuctionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RequestBid = ({ open, onOpenChange }: AuctionDialogProps) => {
  const { toast } = useToast();
  const today = new Date();
  
  // Start date/time
  const [startDate, setStartDate] = useState<Date | undefined>(today);
  const [startHours, setStartHours] = useState(0);
  const [startMinutes, setStartMinutes] = useState(0);
  
  // End date/time
  const [endDate, setEndDate] = useState<Date | undefined>(today);
  const [endHours, setEndHours] = useState(0);
  const [endMinutes, setEndMinutes] = useState(0);
  
  const [startingBid, setStartingBid] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [artworkHeight, setArtworkHeight] = useState("");
  const [artworkWidth, setArtworkWidth] = useState("");



  const handlePublish = () => {
    if (!startDate) {
      toast({
        title: "Missing start date",
        description: "Please select a start date for the auction",
        variant: "destructive"
      });
      return;
    }
    
    if (!endDate) {
      toast({
        title: "Missing end date",
        description: "Please select an end date for the auction",
        variant: "destructive"
      });
      return;
    }
    
    if (!startingBid || isNaN(Number(startingBid)) || Number(startingBid) <= 0) {
      toast({
        title: "Invalid starting bid",
        description: "Please enter a valid starting bid amount",
        variant: "destructive"
      });
      return;
    }

    // Create Date objects for start and end times
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(endHours, endMinutes, 0, 0);
    
    // Validate that end date is after start date
    if (endDateTime <= startDateTime) {
      toast({
        title: "Invalid auction duration",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate duration in milliseconds
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    
    // Validate that duration doesn't exceed 3 days
    if (durationDays > 3) {
      toast({
        title: "Invalid auction duration",
        description: "Auction duration cannot exceed 3 days",
        variant: "destructive"
      });
      return;
    }
    
    // If all validations pass, open confirmation dialog
    setIsConfirmationOpen(true);
  };
  
  const handleConfirm = () => {
    setIsConfirmationOpen(false);
    onOpenChange(false);
    
    toast({
      title: "Auction created successfully",
      description: "Your auction has been published",
    });
  };

  // Calculate max end date (start date + 3 days)
  const maxEndDate = startDate ? addDays(startDate, 3) : addDays(today, 3);

  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[430px] px-10 py-6">
          <DialogHeader className="text-center">
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
            </DialogClose>
            <DialogTitle className="text-lg font-bold text-left">“The Distorted Face”</DialogTitle>
          </DialogHeader>
          
          {/* <div className="flex justify-center mb-4 text-xs">
            <img 
              src="https://ph.pinterest.com/pin/152981718587678591/" 
              alt="Auction item" 
              className="w-20 h-20 object-contain rounded-sm shadow-md"
            />
          </div> */}
          
          <p className="text-left text-[10px] -mt-3">
            Set your terms and schedule to start auctioning your artwork
          </p>
          
          {/* 
          <p className="text-sm  font-bold text-red-900 text-center mt-1">
            “The Distorted Face”
          </p> */}
          
          <div className="space-y-6 mt-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2 text-[11px]">Set a starting bid</h3>
                <div className="space-y-2">
                  <div>
                    <Input 
                      id="starting-bid" 
                      placeholder="Enter amount" 
                      style={{ fontSize: '10px', marginTop: '6px', width: '107%' }}
                      value={startingBid}
                      onChange={(e) => setStartingBid(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="relative left-4">
                <h3 className="font-medium mb-2 text-[11px]">Artwork Size (inches)</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col"> 
                    <Input
                      type="number"
                      placeholder="0"
                      style={{ fontSize: '10px', marginBottom: '5px' }}
                      min={0}
                      value={artworkHeight}
                      onChange={(e) => setArtworkHeight(e.target.value)}
                    />
                    <label className="text-[9px] text-center mb-1">Height</label>
                  </div>
                  <span className="my-auto -pr-8 pb-6 font-bold text-xs">x</span>
                  <div className="flex flex-col relative -left-10">
                    <Input
                      type="number"
                      placeholder="0"
                      style={{ fontSize: '10px', marginBottom: '5px' }}
                      min={0}
                      value={artworkWidth}
                      onChange={(e) => setArtworkWidth(e.target.value)}
                    />
                    <label className="text-[9px] text-center mb-1">Width</label>
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
              <p className="text-[10px] text-muted-foreground -mb-3">
                Note: Auction duration cannot exceed 3 days
              </p>
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
      
      <Confirmation
        open={isConfirmationOpen} 
        onOpenChange={setIsConfirmationOpen} 
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default RequestBid;
