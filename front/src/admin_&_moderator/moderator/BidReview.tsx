import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gavel, AlertTriangle, Eye, CheckCircle, XCircle, Search } from "lucide-react";
import { toast } from "sonner";

// Mock bid data
const mockBids = [
  {
    id: "bid-001",
    artworkId: "art-123",
    artworkTitle: "Sunset Dreams",
    artworkImage: "https://placehold.co/100x100",
    artistName: "Emma Johnson",
    bidderName: "Alex Richards",
    bidderAvatar: "",
    amount: 2500,
    timestamp: new Date(Date.now() - 3600000 * 2),
    status: "pending",
    flags: ["first-time-bidder"]
  },
  {
    id: "bid-002",
    artworkId: "art-456",
    artworkTitle: "Urban Flow",
    artworkImage: "https://placehold.co/100x100",
    artistName: "David Chen",
    bidderName: "Sarah Williams",
    bidderAvatar: "",
    amount: 4200,
    timestamp: new Date(Date.now() - 3600000 * 4),
    status: "approved",
    flags: []
  },
  {
    id: "bid-003",
    artworkId: "art-789",
    artworkTitle: "Abstract Emotions",
    artworkImage: "https://placehold.co/100x100",
    artistName: "Maria Gonzalez",
    bidderName: "James Peterson",
    bidderAvatar: "",
    amount: 7800,
    timestamp: new Date(Date.now() - 3600000 * 6),
    status: "flagged",
    flags: ["unusual-activity", "large-amount"]
  },
  {
    id: "bid-004",
    artworkId: "art-012",
    artworkTitle: "Digital Consciousness",
    artworkImage: "https://placehold.co/100x100",
    artistName: "Robert Kim",
    bidderName: "Michelle Davis",
    bidderAvatar: "",
    amount: 3100,
    timestamp: new Date(Date.now() - 3600000 * 12),
    status: "rejected",
    flags: ["payment-issue"]
  },
  {
    id: "bid-005",
    artworkId: "art-345",
    artworkTitle: "Nature's Whisper",
    artworkImage: "https://placehold.co/100x100",
    artistName: "Thomas Wilson",
    bidderName: "Lisa Johnson",
    bidderAvatar: "",
    amount: 5600,
    timestamp: new Date(Date.now() - 3600000 * 24),
    status: "pending",
    flags: []
  }
];

const BidReview = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBid, setSelectedBid] = useState<string | null>(null);

  const handleApproveBid = (id: string) => {
    toast.success("Bid has been approved");
  };

  const handleRejectBid = (id: string) => {
    toast.success("Bid has been rejected");
  };

  const handleFlagBid = (id: string) => {
    toast.success("Bid has been flagged for admin review");
  };

  const filteredBids = mockBids.filter(bid => {
    const matchesStatus = selectedStatus === "all" || bid.status === selectedStatus;
    const matchesSearch = 
      searchTerm === "" || 
      bid.artworkTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.bidderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.artistName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    flagged: "bg-blue-100 text-blue-800"
  };

  const selectedBidDetails = selectedBid ? mockBids.find(b => b.id === selectedBid) : null;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Bid Review</h2>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search artwork or bidder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="secondary" type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gavel className="mr-2 h-5 w-5" />
                Bids List
              </CardTitle>
              <CardDescription>Review and manage bids</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artwork</TableHead>
                      <TableHead>Bidder</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBids.map((bid) => (
                      <TableRow key={bid.id} className={selectedBid === bid.id ? "bg-muted/50" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded bg-secondary overflow-hidden">
                              <img src={bid.artworkImage} alt={bid.artworkTitle} className="h-full w-full object-cover" />
                            </div>
                            <div>
                              <div className="font-medium">{bid.artworkTitle}</div>
                              <div className="text-xs text-muted-foreground">by {bid.artistName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={bid.bidderAvatar} alt={bid.bidderName} />
                              <AvatarFallback>{bid.bidderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {bid.bidderName}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${bid.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[bid.status]}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{bid.timestamp.toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {bid.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleApproveBid(bid.id)}
                                  title="Approve Bid"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleRejectBid(bid.id)}
                                  title="Reject Bid"
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            {bid.status !== "flagged" && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleFlagBid(bid.id)}
                                title="Flag for Review"
                              >
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedBid(bid.id)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Bid Details</CardTitle>
              <CardDescription>
                {selectedBidDetails 
                  ? `Bid #${selectedBidDetails.id.slice(-4)} Details` 
                  : "Select a bid to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBidDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-14 w-14 rounded bg-secondary overflow-hidden">
                      <img src={selectedBidDetails.artworkImage} alt={selectedBidDetails.artworkTitle} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">{selectedBidDetails.artworkTitle}</div>
                      <div className="text-sm text-muted-foreground">by {selectedBidDetails.artistName}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Bid Amount</h4>
                    <p className="text-xl font-bold">${selectedBidDetails.amount.toLocaleString()}</p>
                  </div>
                  
                  <div className="pt-1">
                    <h4 className="text-sm font-medium text-muted-foreground">Bidder</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar>
                        <AvatarImage src={selectedBidDetails.bidderAvatar} />
                        <AvatarFallback>{selectedBidDetails.bidderName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{selectedBidDetails.bidderName}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date & Time</h4>
                    <p>{selectedBidDetails.timestamp.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <Badge className={`mt-1 ${statusColors[selectedBidDetails.status]}`}>
                      {selectedBidDetails.status.charAt(0).toUpperCase() + selectedBidDetails.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {selectedBidDetails.flags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Flags</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedBidDetails.flags.map((flag) => (
                          <Badge key={flag} variant="outline" className="capitalize">
                            {flag.replace(/-/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedBidDetails.status === "pending" && (
                    <div className="pt-4 flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleApproveBid(selectedBidDetails.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => handleRejectBid(selectedBidDetails.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center text-center">
                  <Gavel className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Bid Selected</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a bid from the list to view its details
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BidReview;
