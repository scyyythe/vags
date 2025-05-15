import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { mockBids } from "@/components/admin_&_moderator/data/mockData";
import { Artwork, Bid, User } from "@/components/admin_&_moderator/types";
import { Eye, CheckCircle, XCircle, AlertTriangle, Download, Filter, Search } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, searchItems } from "@/lib/utils";

// Mock transactions data
const mockTransactions = [
  {
    id: "tx1",
    artworkId: "1",
    artworkTitle: "Humanoid Sculpture",
    buyerId: "3",
    buyerName: "Jane Shaun",
    sellerId: "2",
    sellerName: "Angel Cornaro",
    amount: 1200,
    status: "completed",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    paymentMethod: "credit_card",
    platformFee: 120,
  },
  {
    id: "tx2",
    artworkId: "3",
    artworkTitle: "Abstract Landscape",
    buyerId: "4",
    buyerName: "Admin User",
    sellerId: "3",
    sellerName: "Angel Cornaro",
    amount: 950,
    status: "processing",
    date: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    paymentMethod: "paypal",
    platformFee: 95,
  },
  {
    id: "tx3",
    artworkId: "2",
    artworkTitle: "Cloud Formation",
    buyerId: "2",
    buyerName: "Moderator User",
    sellerId: "2",
    sellerName: "Jane Shaun",
    amount: 800,
    status: "failed",
    date: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
    paymentMethod: "credit_card",
    platformFee: 80,
    failureReason: "Payment authorization failed",
  },
  {
    id: "tx4",
    artworkId: "4",
    artworkTitle: "Digital Portrait",
    buyerId: "3",
    buyerName: "Jane Shaun",
    sellerId: "2",
    sellerName: "Angel Cornaro",
    amount: 1500,
    status: "completed",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    paymentMethod: "bank_transfer",
    platformFee: 150,
  },
];

const BidsTransactions = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBids, setFilteredBids] = useState<Bid[]>(mockBids);
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [activeTab, setActiveTab] = useState("bids");

  // Effect to update filtered items when search term or status changes
  useEffect(() => {
    const filteredBidsResult = filterBids();
    setFilteredBids(filteredBidsResult);
    
    const filteredTransactionsResult = filterTransactions();
    setFilteredTransactions(filteredTransactionsResult);
  }, [searchTerm, selectedStatus]);

  const handleApproveBid = (id: string) => {
    toast.success(`Bid ${id} has been approved`);
  };

  const handleRejectBid = (id: string) => {
    toast.success(`Bid ${id} has been rejected`);
  };

  const handleRefund = (id: string) => {
    toast.success(`Transaction ${id} has been refunded`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect, this just prevents form submission
  };

  const filterBids = () => {
    let result = mockBids;
    
    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter(bid => bid.status === selectedStatus);
    }
    
    // Filter by search term - using updated searchItems with string paths
    if (searchTerm) {
      result = searchItems(result, searchTerm, ['artwork.title', 'bidder.name']);
    }
    
    return result;
  };

  const filterTransactions = () => {
    let result = mockTransactions;
    
    // Filter by status
    if (selectedStatus !== "all") {
      result = result.filter(transaction => transaction.status === selectedStatus);
    }
    
    // Filter by search term
    if (searchTerm) {
      result = searchItems(result, searchTerm, ['artworkTitle', 'buyerName', 'sellerName']);
    }
    
    return result;
  };

  const handleExportBids = () => {
    exportToCSV(
      filteredBids.map(bid => ({
        id: bid.id,
        artwork: bid.artwork.title,
        bidder: bid.bidder.name,
        amount: bid.amount,
        date: bid.createdAt.toLocaleDateString(),
        status: bid.status,
        suspicious: bid.isSuspicious ? 'Yes' : 'No'
      })), 
      'art_gallery_bids.csv'
    );
    toast.success("Bids exported successfully");
  };

  const handleExportTransactions = () => {
    exportToCSV(
      filteredTransactions.map(tx => ({
        id: tx.id,
        artwork: tx.artworkTitle,
        buyer: tx.buyerName,
        seller: tx.sellerName,
        amount: tx.amount,
        fee: tx.platformFee,
        date: tx.date.toLocaleDateString(),
        status: tx.status,
        paymentMethod: tx.paymentMethod
      })), 
      'art_gallery_transactions.csv'
    );
    toast.success("Transactions exported successfully");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "approved":
      case "completed":
        return "default";
      case "rejected":
      case "failed":
        return "destructive";
      case "processing":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Bids & Transactions</h2>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div className="flex items-center space-x-2">
          <div className="grid w-[180px] gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artwork, buyer or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="secondary" type="submit">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </form>
      </div>

      <Tabs defaultValue="bids" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="bids">Bids</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            className="gap-2"
            onClick={activeTab === "bids" ? handleExportBids : handleExportTransactions}
          >
            <Download className="h-4 w-4" />
            Export {activeTab === "bids" ? "Bids" : "Transactions"}
          </Button>
        </div>
        
        <TabsContent value="bids">
          <Card>
            <CardHeader>
              <CardTitle>Artwork Bids</CardTitle>
              <CardDescription>
                Review and manage bids on artworks 
                {filteredBids.length > 0 && ` · ${filteredBids.length} results`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artwork</TableHead>
                      <TableHead>Bidder</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBids.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No bids matching the current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBids.map((bid) => (
                        <TableRow key={bid.id}>
                          <TableCell className="font-medium">
                            {bid.artwork.title}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={bid.bidder.avatar} />
                                <AvatarFallback>{bid.bidder.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              {bid.bidder.name}
                            </div>
                          </TableCell>
                          <TableCell>${bid.amount}</TableCell>
                          <TableCell>{bid.createdAt.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(bid.status)}>
                              {bid.status}
                            </Badge>
                            {bid.isSuspicious && (
                              <Badge variant="outline" className="ml-2 bg-amber-100">
                                <AlertTriangle className="mr-1 h-3 w-3 text-amber-600" />
                                Suspicious
                              </Badge>
                            )}
                          </TableCell>
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
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Sales Transactions</CardTitle>
              <CardDescription>
                Review and manage sales transactions
                {filteredTransactions.length > 0 && ` · ${filteredTransactions.length} results`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artwork</TableHead>
                      <TableHead>Buyer / Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No transactions matching the current filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.artworkTitle}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="text-xs text-muted-foreground">Buyer:</div>
                              <div>{transaction.buyerName}</div>
                              <div className="text-xs text-muted-foreground mt-1">Seller:</div>
                              <div>{transaction.sellerName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div>${transaction.amount}</div>
                              <div className="text-xs text-muted-foreground">
                                Fee: ${transaction.platformFee}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.date.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(transaction.status)}>
                              {transaction.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {transaction.paymentMethod.replace('_', ' ')}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {transaction.status === "completed" && (
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8"
                                  onClick={() => handleRefund(transaction.id)}
                                >
                                  Refund
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BidsTransactions;
