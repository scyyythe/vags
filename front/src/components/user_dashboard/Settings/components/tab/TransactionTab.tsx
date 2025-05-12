import React, { useState, useMemo, useEffect } from "react";
import TransactionFilters from "../transaction/TransactionFilters";
import TransactionList from "../transaction/TransactionList";
import mockTransactions from "@/data/mockTransactions";
import { Transaction } from "@/types/transaction";
import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO } from "date-fns";

const TransactionsTab = () => {
  const [dateRangePreset, setDateRangePreset] = useState("last7days");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.log("Current date range:", dateRange);
  }, [dateRange]);

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter(transaction => {
      // Filter by type
      if (filterType !== "all" && transaction.type !== filterType) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery && !transaction.activity.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !transaction.recipient.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by date range
      if (dateRange && dateRange.from && dateRange.to) {
        const transactionDate = new Date(transaction.date);
        
        try {
          if (!isWithinInterval(transactionDate, {
            start: dateRange.from,
            end: dateRange.to
          })) {
            return false;
          }
        } catch (error) {
          console.error("Error filtering by date:", error);
          // Continue with other filters if date filtering fails
        }
      }
      
      return true;
    });
  }, [filterType, searchQuery, dateRange]);

  // Count transactions by type
  const receivedCount = mockTransactions.filter(t => t.type === "received").length;
  const sentCount = mockTransactions.filter(t => t.type === "sent").length;
  const convertCount = mockTransactions.filter(t => t.type === "converted").length;
  
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    console.log("Date range changed at TransactionsTab:", newRange);
    setDateRange(newRange);
    if (newRange && newRange.from && newRange.to) {
      setDateRangePreset("custom");
    }
  };

  return (
    <div className="w-full">
      <TransactionFilters
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        dateRangePreset={dateRangePreset}
        setDateRangePreset={setDateRangePreset}
        receivedCount={receivedCount}
        sentCount={sentCount}
        convertCount={convertCount}
        filterType={filterType}
        setFilterType={setFilterType}
        onSearch={handleSearch}
      />
      
      {filteredTransactions.length > 0 ? (
        <TransactionList transactions={filteredTransactions} />
      ) : (
        <div className="text-center py-8 text-gray-500">
          No transactions found matching your filters.
        </div>
      )}
    </div>
  );
};

export default TransactionsTab;
