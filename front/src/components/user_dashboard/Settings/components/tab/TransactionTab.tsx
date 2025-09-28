import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FiArrowDownLeft, FiArrowUpRight, FiRepeat, FiSearch, FiChevronDown, FiCalendar } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import useTransactionsQuery from "@/hooks/transaction/useTransactions";
import { getLoggedInUserId } from "@/auth/decode";
// Mock data
const mockTransactions = [
  {
    id: 1,
    type: "Sent",
    amount: "- 500.00 IDR",
    currency: "IDR",
    method: "Credit Card",
    methodDetail: "**** 8969",
    status: "Success",
    activity: "Sending money to Raihan Fikri",
    people: { name: "Raihan Zulhimin", avatar: null, initials: "R" },
    date: "Aug 28, 2023 3:40 PM",
  },
  {
    id: 2,
    type: "Received",
    amount: "+ 1,200.00 IDR",
    currency: "IDR",
    method: "Bank Transfer",
    methodDetail: "BNI **** 2345",
    status: "Success",
    activity: "Received payment from Angela",
    people: { name: "Angela Tan", avatar: null, initials: "A" },
    date: "Aug 27, 2023 10:15 AM",
  },
  {
    id: 3,
    type: "Converted",
    amount: "- 200.00 USD",
    currency: "USD",
    method: "Currency Exchange",
    methodDetail: "USD → IDR",
    status: "Incomplete",
    activity: "Currency conversion",
    people: { name: "You", avatar: null, initials: "Y" },
    date: "Aug 26, 2023 5:00 PM",
  },
];

// Status colors
const statusColors: Record<string, string> = {
  Success: "bg-green-100 text-green-700",
  Incomplete: "bg-gray-100 text-gray-500",
  Failed: "bg-red-100 text-red-800",
};

const currencyOptions = ["All", "USD", "EUR", "PHP", "GBP", "IDR"];

function TypeIcon({ type }: { type?: string }) {
  if (type === "Received") return <FiArrowDownLeft className="text-green-700 bg-green-100 rounded-full w-5 h-5 p-1" />;
  if (type === "Converted") return <FiRepeat className="text-blue-700 bg-blue-100 rounded-full w-5 h-5 p-1" />;
  return <FiArrowUpRight className="text-red-800 bg-red-100 rounded-full w-5 h-5 p-1" />;
}

function Avatar({ avatar, initials }: { avatar?: string | null; initials: string }) {
  if (avatar) return <img src={avatar} alt={initials} className="w-3 h-3 rounded-full object-cover" />;
  return (
    <div className="w-3 h-3 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-xs">
      {initials}
    </div>
  );
}

const filterOptions = [
  { key: "all", label: "All", count: mockTransactions.length },
  { key: "received", label: "Received", count: mockTransactions.filter((t) => t.type === "Received").length },
  { key: "sent", label: "Sent", count: mockTransactions.filter((t) => t.type === "Sent").length },
  { key: "converted", label: "Convert", count: mockTransactions.filter((t) => t.type === "Converted").length },
];

const TransactionsTab: React.FC = () => {
  const { language: selectedLanguage } = useLanguage();
  const userId = getLoggedInUserId();

  // -------------------------
  // Hooks for static labels only
  // -------------------------
  const searchPlaceholder = useAutoTranslation("Search", selectedLanguage);
  const pickDateLabel = useAutoTranslation("Pick Date", selectedLanguage);
  const applyLabel = useAutoTranslation("Apply", selectedLanguage);
  const applyFilterLabel = useAutoTranslation("Apply filter", selectedLanguage);
  const daysLabel = useAutoTranslation("Days", selectedLanguage);
  const currencyLabel = useAutoTranslation("Currency", selectedLanguage);
  const todayLabel = useAutoTranslation("Today", selectedLanguage);
  const last7DaysLabel = useAutoTranslation("Last 7 Days", selectedLanguage);
  const last30DaysLabel = useAutoTranslation("Last 30 Days", selectedLanguage);
  const allTimeLabel = useAutoTranslation("All Time", selectedLanguage);
  const activityLabel = useAutoTranslation("Activity", selectedLanguage);
  const dateLabel = useAutoTranslation("Date", selectedLanguage);
  const amountLabel = useAutoTranslation("Amount", selectedLanguage);
  const methodLabel = useAutoTranslation("Method", selectedLanguage);
  const statusLabel = useAutoTranslation("Status", selectedLanguage);

  // -------------------------
  // Local state
  // -------------------------
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDaysDropdown, setShowDaysDropdown] = useState(false);
  const [selectedDay, setSelectedDay] = useState(todayLabel);
  const dayOptions = [todayLabel, last7DaysLabel, last30DaysLabel, allTimeLabel];
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  const { data: transactionsData } = useTransactionsQuery();

  const getFullName = (first?: string | null, last?: string | null) => {
    return `${first ?? ""} ${last ?? ""}`.trim();
  };

  function formatTransaction(tx: any) {
    const date = new Date(tx.timestamp);
    const formattedDate = date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    const sign = tx.transaction_type === "Received" ? "+" : "-";
    const formattedAmount = `${sign} ${tx.amount.toLocaleString()} ${tx.currency}`;
    return { formattedDate, formattedAmount };
  }

  const filtered = useMemo(() => {
    let txs = [...(transactionsData || [])];

    txs = txs.map((tx) => {
      if (tx.receiver_id === userId) {
        return { ...tx, transaction_type: "Received" };
      } else if (tx.sender_id === userId) {
        return { ...tx, transaction_type: "Sent" };
      }
      return tx;
    });

    if (filter !== "all") {
      txs = txs.filter(
        (t) => t.type === (filter === "converted" ? "Converted" : filter.charAt(0).toUpperCase() + filter.slice(1))
      );
    }
    if (selectedCurrency !== "All") {
      txs = txs.filter((t) => t.currency === selectedCurrency);
    }
    if (startDate && endDate) {
      txs = txs.filter((t) => {
        const txDate = new Date(t.timestamp);
        return txDate >= startDate && txDate <= endDate;
      });
    }
    if (search.trim()) {
      txs = txs.filter(
        (t) =>
          t.activity.toLowerCase().includes(search.toLowerCase()) ||
          `${t.sender_first_name} ${t.sender_last_name}`.toLowerCase().includes(search.toLowerCase())
      );
    }
    return txs;
  }, [filter, search, selectedCurrency, startDate, endDate, transactionsData]);

  // -------------------------
  // Helper for translating dynamic text
  // -------------------------
  const translate = (text: string | undefined | null) => {
    if (!text) return "";
    return text;
  };

  const translatedFilterOptions = filterOptions.map((opt) => ({
    ...opt,
    label: translate(opt.label),
  }));

  return (
    <div className="w-full bg-white border-gray-200">
      {/* FILTERS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
        <div className="flex items-center gap-2 mb-1.5 md:mb-0">
          {translatedFilterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-1 text-[11px] rounded-full border ${
                filter === opt.key
                  ? "bg-red-800 text-white border-red-800"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-red-50"
              }`}
            >
              {translate(opt.label)} <span className="ml-1">{opt.count}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Date picker */}
          <div className="relative">
            <button
              className="flex items-center border rounded-full px-3 py-1 text-[11px] text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setShowDatePicker((v) => !v)}
            >
              <FiCalendar className="mr-1" />
              {startDate && endDate
                ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                : pickDateLabel}
            </button>
            {showDatePicker && (
              <div className="absolute right-0 mt-2 z-20">
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  inline
                  onCalendarClose={() => setShowDatePicker(false)}
                />
                <button
                  className="mt-2 w-full px-3 py-1 bg-red-800 text-white text-[10px] rounded-full"
                  onClick={() => setShowDatePicker(false)}
                >
                  {applyLabel}
                </button>
              </div>
            )}
          </div>

          {/* Filters dropdown */}
          <div className="relative">
            <button
              className="flex items-center border rounded-full px-3 py-1 text-[11px] text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => setShowFilterDropdown((v) => !v)}
            >
              <FiChevronDown className="mr-1" />
              {applyFilterLabel}
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg z-20">
                {/* Days */}
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-[11px]"
                  onClick={() => setShowDaysDropdown((v) => !v)}
                >
                  {daysLabel}
                  <FiChevronDown className="ml-2" />
                </div>
                {showDaysDropdown && (
                  <div className="mt-1">
                    {dayOptions.map((day) => (
                      <div
                        key={day}
                        className={`px-4 py-1 text-[10px] cursor-pointer hover:bg-gray-200 ${
                          selectedDay === day ? "font-bold text-blue-700" : ""
                        }`}
                        onClick={() => {
                          setSelectedDay(day);
                          setShowDaysDropdown(false);
                          setShowFilterDropdown(false);
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                )}

                {/* Currency */}
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-[11px]"
                  onClick={() => setShowCurrencyDropdown((v) => !v)}
                >
                  {currencyLabel}
                  <FiChevronDown className="" />
                </div>
                {showCurrencyDropdown && (
                  <div className="mt-1">
                    {currencyOptions.map((opt) => (
                      <div
                        key={opt}
                        className={`px-4 py-1 text-[10px] cursor-pointer hover:bg-gray-200 ${
                          selectedCurrency === opt ? "font-bold text-red-700" : ""
                        }`}
                        onClick={() => {
                          setSelectedCurrency(opt);
                          setShowCurrencyDropdown(false);
                          setShowFilterDropdown(false);
                        }}
                      >
                        {translate(opt)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search input */}
          <div className="relative w-[200px] text-gray-700">
            <FiSearch className="h-3 w-3 absolute left-3 top-2 transform text-gray-400 text-sm" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-2 py-1 border rounded-full text-[11px] focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 sticky top-0 z-10">
                <TableHead className="text-[11px]">{activityLabel}</TableHead>
                <TableHead className="text-[11px]">{dateLabel}</TableHead>
                <TableHead className="text-[11px]">{amountLabel}</TableHead>
                <TableHead className="text-[11px]">{methodLabel}</TableHead>
                <TableHead className="text-[11px] text-right">{statusLabel}</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8 text-xs">
                    You have no transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((tx) => (
                  <TableRow key={tx.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <TypeIcon type={tx.transaction_type} />
                        <div>
                          <div className="font-medium text-[11px] text-gray-800 whitespace-nowrap">
                            {translate(tx.activity)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Avatar avatar={tx.sender_profile_picture} initials={tx.sender_first_name?.[0] ?? "?"} />
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">
                              {translate(getFullName(tx.sender_first_name, tx.sender_last_name))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-[11px] text-gray-600 whitespace-nowrap">
                      {translate(formatTransaction(tx).formattedDate)}
                    </TableCell>

                    <TableCell className="text-[11px] font-semibold text-gray-800 whitespace-nowrap">
                      {translate(formatTransaction(tx).formattedAmount)}
                    </TableCell>

                    <TableCell>
                      <div className="text-[11px] text-gray-800 whitespace-nowrap">{translate(tx.payment_method)}</div>
                      <div className="text-[10px] text-gray-500">{translate(tx.transaction_id)}</div>
                    </TableCell>

                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-[10px] ${statusColors[tx.payment_status]}`}>
                        {translate(tx.payment_status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTab;
