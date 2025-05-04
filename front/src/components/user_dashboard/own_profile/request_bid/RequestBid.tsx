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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="text-center">
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <DialogTitle className="text-xl font-bold">The Distorted Face</DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/8a5957d6-d437-4054-96ba-c4a453671e1b.png" 
              alt="Auction item" 
              className="w-28 h-28 object-contain"
            />
          </div>
          
          <p className="text-center text-sm text-gray-500 mb-6">
            "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto
            beatae vitae dicta sunt explicabo."
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Fill In Details</h3>
              <div className="space-y-2">
                <div>
                  <label htmlFor="starting-bid" className="text-sm font-medium">Set a starting bid</label>
                  <Input 
                    id="starting-bid" 
                    placeholder="Enter amount" 
                    className="w-full"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Set Auction Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DateTimePicker 
                  date={startDate}
                  hours={startHours}
                  minutes={startMinutes}
                  onDateChange={setStartDate}
                  onHoursChange={setStartHours}
                  onMinutesChange={setStartMinutes}
                  minDate={today}
                  label="Auction starts on"
                />
                
                <DateTimePicker 
                  date={endDate}
                  hours={endHours}
                  minutes={endMinutes}
                  onDateChange={setEndDate}
                  onHoursChange={setEndHours}
                  onMinutesChange={setEndMinutes}
                  minDate={startDate || today}
                  maxDate={maxEndDate}
                  label="Auction ends on"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Auction duration cannot exceed 3 days
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                className="flex-1 bg-red-700 hover:bg-red-800 text-white"
                onClick={handlePublish}
              >
                Publish
              </Button>
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Discard All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Confirmation
        open={isConfirmationOpen} 
        onOpenChange={setIsConfirmationOpen} 
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default RequestBid;
