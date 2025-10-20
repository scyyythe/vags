import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { TransactionLogsFilter, type TransactionType, type TransactionStatus } from "./TransactionLogsFilter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useAdminTransactions from "@/hooks/admin/useAdminTransactions";
import TransactionLogsSkeleton from "./TransactionLogsSkeleton";

export type TransactionLog = {
  id: string;
  timestamp: string;
  type: "donation" | "purchase" | "auction_claim" | "bid" | "commission" | "tip";
  amount: number;
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  artworkId?: string;
  artworkTitle?: string;
  status: "completed" | "pending" | "failed";
  details: string;
};

interface TransactionLogsProps {
  transactions: TransactionLog[];
}

export function TransactionLogs({ transactions: initialTransactions }: TransactionLogsProps) {
  const [transactions, setTransactions] = useState<TransactionLog[]>(initialTransactions);
  const { data, isLoading, error } = useAdminTransactions({ last_n_days: 7, limit: 50 });

  // When API data arrives, map it into the TransactionLog shape and replace the local list
  useEffect(() => {
    if (!data?.results) return;
    const mapped: TransactionLog[] = data.results.map((t: any) => {
      const typeMap: Record<string, TransactionLog["type"]> = {
        tip: "tip",
        donation: "donation",
        purchase: "purchase",
        auction: "auction_claim",
        bid: "bid",
        commission: "commission",
      };
      const normalizedType = String(t.type || "").toLowerCase();
      const mappedType: TransactionLog["type"] = typeMap[normalizedType] || "purchase";

      const normalizedStatus = String(t.status || "pending").toLowerCase() as TransactionLog["status"];

      return {
        id: String(t.id),
        timestamp: t.timestamp,
        type: mappedType,
        amount: Number(t.amount || 0),
        from: { id: t.from_user?.id || "-", name: t.from_user?.name || "-" },
        to: { id: t.to_user?.id || "-", name: t.to_user?.name || "-" },
        artworkId: t.artworkId || undefined,
        artworkTitle: t.artworkTitle || undefined,
        status: normalizedStatus,
        details: t.artworkTitle ? `Transaction for ${t.artworkTitle}` : "",
      };
    });
    setTransactions(mapped);
  }, [data]);
  const [filter, setFilter] = useState<{ 
    type: TransactionType; 
    status: TransactionStatus; 
  }>({
    type: "all",
    status: "all",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Apply filters whenever they change
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filter.type === "all" || transaction.type === filter.type;
    const matchesStatus = filter.status === "all" || transaction.status === filter.status;
    const matchesSearch = !searchQuery || 
      transaction.from.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      transaction.to.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.artworkTitle && transaction.artworkTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getTypeBadge = (type: TransactionLog["type"]) => {
    switch (type) {
      case "tip":
        return <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 text-3xs">Tip</Badge>;
      case "donation":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-3xs">Donation</Badge>;
      case "purchase":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-3xs">Purchase</Badge>;
      case "auction_claim":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 text-3xs">Auction Claim</Badge>;
      case "bid":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-3xs">Bid Placed</Badge>;
      case "commission":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 text-3xs">Commission</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: TransactionLog["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-3xs">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 text-3xs">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200 text-3xs">Failed</Badge>;
      default:
        return null;
    }
  };

  const handleViewTransactionDetails = (transaction: TransactionLog) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast.info(query ? `Searching for: "${query}"` : "Search cleared", { closeButton: true });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <TransactionLogsFilter
        filter={filter}
        onChange={(newFilter) => setFilter(newFilter)}
        onSearch={handleSearch}
      />

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Timestamp</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">From</TableHead>
              <TableHead className="text-xs">To</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <TransactionLogsSkeleton />
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="text-[10px]">{transaction.timestamp}</TableCell>
                  <TableCell className="text-[10px]">{getTypeBadge(transaction.type)}</TableCell>
                  <TableCell className="text-[10px]">{transaction.from.name}</TableCell>
                  <TableCell className="text-[10px]">{transaction.to.name}</TableCell>
                  <TableCell className="text-[10px] font-medium">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className="text-[10px]">{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-[10px] text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 text-[10px]"
                      onClick={() => handleViewTransactionDetails(transaction)}
                    >
                      <FileText className="h-2 w-2 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-xs">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-sm rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Transaction Details</DialogTitle>
            <DialogDescription className="text-[11px]">
              Complete information about this transaction.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="font-medium">Transaction ID:</div>
                <div className="text-[10px]">{selectedTransaction.id}</div>
                
                <div className="font-medium">Timestamp:</div>
                <div className="text-[10px]">{selectedTransaction.timestamp}</div>
                
                <div className="font-medium">Type:</div>
                <div className="text-[10px]">{getTypeBadge(selectedTransaction.type)}</div>
                
                <div className="font-medium">From:</div>
                <div className="text-[10px]">{selectedTransaction.from.name}</div>
                
                <div className="font-medium">To:</div>
                <div className="text-[10px]">{selectedTransaction.to.name}</div>
                
                <div className="font-medium">Amount:</div>
                <div className="text-[10px] font-semibold">{formatCurrency(selectedTransaction.amount)}</div>
                
                <div className="font-medium">Status:</div>
                <div className="text-[10px]">{getStatusBadge(selectedTransaction.status)}</div>

                {selectedTransaction.artworkTitle && (
                  <>
                    <div className="font-medium">Artwork:</div>
                    <div className="text-[10px]">{selectedTransaction.artworkTitle}</div>
                  </>
                )}
              </div>
              
              <div>
                <div className="font-medium text-[11px] mb-2">Details:</div>
                <div className="text-[10px] bg-gray-50 p-3 rounded">{selectedTransaction.details}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
