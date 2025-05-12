import React, { useState, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiArrowDownLeft, FiArrowUpRight, FiRepeat, FiSearch, FiChevronDown, FiCalendar }  from "react-icons/fi";

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
    type: "Sent",
    amount: "- 200.00 IDR",
    currency: "IDR",
    method: "Wire Transfer",
    methodDetail: "**** 9830",
    status: "Success",
    activity: "Sending money to Bani Zulhimin",
    people: { name: "Bani Zulhimin", avatar: null, initials: "B" },
    date: "Aug 28, 2023 3:40 PM",
  },
  {
    id: 3,
    type: "Received",
    amount: "+ 1,500 USD",
    currency: "USD",
    method: "Bank Transfer",
    methodDetail: "**** 9683",
    status: "Success",
    activity: "Received money from Andrew",
    people: { name: "Andrew Top G", avatar: "https://randomuser.me/api/portraits/men/32.jpg", initials: "A" },
    date: "Aug 28, 2023 3:40 PM",
  },
  {
    id: 4,
    type: "Received",
    amount: "+ 2,500 USD",
    currency: "USD",
    method: "PayPal",
    methodDetail: "(clarista)",
    status: "Success",
    activity: "Payment for product",
    people: { name: "Clarista Jawl", avatar: "https://randomuser.me/api/portraits/women/44.jpg", initials: "C" },
    date: "Aug 28, 2023 3:40 PM",
  },
  {
    id: 5,
    type: "Received",
    amount: "+ 1,500 USD",
    currency: "USD",
    method: "Payoneer",
    methodDetail: "**** 1083",
    status: "Incomplete",
    activity: "Payment for invoice",
    people: { name: "Andrew Top G", avatar: "https://randomuser.me/api/portraits/men/32.jpg", initials: "A" },
    date: "Aug 28, 2023 5:30 PM",
  },
  {
    id: 6,
    type: "Converted",
    amount: "400.00 IDR",
    currency: "IDR",
    method: "Debit Card",
    methodDetail: "**** 2938",
    status: "Failed",
    activity: "Convert money from USD to IDR",
    people: { name: "Bagus Fikri", avatar: null, initials: "B" },
    date: "Aug 27, 2023 3:35 PM",
  },
  {
    id: 7,
    type: "Received",
    amount: "+ 500 USD",
    currency: "USD",
    method: "Credit Card",
    methodDetail: "**** 2938",
    status: "Success",
    activity: "Received money from Bani Zulhimin",
    people: { name: "Bani Zulhimin", avatar: null, initials: "B" },
    date: "Aug 27, 2023 2:15 PM",
  },
  {
    id: 8,
    type: "Received",
    amount: "+ 1,000 USD",
    currency: "USD",
    method: "PayPal",
    methodDetail: "(basiliskelvin)",
    status: "Success",
    activity: "Received money from Basilisk Kelvin",
    people: { name: "Basilisk Kelvin", avatar: null, initials: "B" },
    date: "Aug 27, 2023 11:10 AM",
  },
  {
    id: 9,
    type: "Sent",
    amount: "- 1,500.00 IDR",
    currency: "IDR",
    method: "Wire Transfer",
    methodDetail: "**** 2314",
    status: "Failed",
    activity: "Sending money to Raihan Fikri",
    people: { name: "Raihan Zulhimin", avatar: null, initials: "R" },
    date: "Aug 27, 2023 9:40 AM",
  },
  {
    id: 10,
    type: "Sent",
    amount: "- 500.00 IDR",
    currency: "IDR",
    method: "Credit Card",
    methodDetail: "**** 8969",
    status: "Success",
    activity: "Sending money to Raihan Fikri",
    people: { name: "Raihan Zulhimin", avatar: null, initials: "R" },
    date: "Aug 27, 2023 8:40 AM",
  },
];

// Status colors
const statusColors: Record<string, string> = {
  Success: "bg-green-100 text-green-700",
  Incomplete: "bg-gray-100 text-gray-500",
  Failed: "bg-red-100 text-red-800",
};

const currencyOptions = [
  "All",
  "USD",
  "EUR",
  "PHP",
  "GBP",
  "IDR"
];

// Icon by type
function TypeIcon({ type }: { type: string }) {
  if (type === "Sent")
    return <FiArrowUpRight className="text-red-800 bg-red-100 rounded-full w-5 h-5 p-1" />;
  if (type === "Received")
    return <FiArrowDownLeft className="text-green-700 bg-green-100 rounded-full w-5 h-5 p-1" />;
  return <FiRepeat className="text-blue-700 bg-blue-100 rounded-full w-5 h-5 p-1" />;
}

function Avatar({ avatar, initials }: { avatar?: string | null; initials: string }) {
  if (avatar)
    return <img src={avatar} alt={initials} className="w-3 h-3 rounded-full object-cover" />;
  return (
    <div className="w-3 h-3 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-xs">
      {initials}
    </div>
  );
}

const filterOptions = [
  { key: "all", label: "All", count: mockTransactions.length },
  { key: "received", label: "Received", count: mockTransactions.filter(t => t.type === "Received").length },
  { key: "sent", label: "Sent", count: mockTransactions.filter(t => t.type === "Sent").length },
//   { key: "converted", label: "Convert", count: mockTransactions.filter(t => t.type === "Converted").length },
];

const TransactionsTab: React.FC = () => {
    const [filter, setFilter] = useState<string>("all");
    const [search, setSearch] = useState<string>("");
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showDaysDropdown, setShowDaysDropdown] = useState(false);
    const [selectedDay, setSelectedDay] = useState("Today"); 
    const dayOptions = ["Today", "Last 7 Days", "Last 30 Days", "All Time"];
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState("All");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    // Filtering logic
    const filtered = useMemo(() => {
        let txs = [...mockTransactions];
        if (filter !== "all") {
        const type = filter === "converted" ? "Converted" : filter.charAt(0).toUpperCase() + filter.slice(1);
        txs = txs.filter(t => t.type === type);
        }
        if (selectedCurrency !== "All") {
        txs = txs.filter(t => t.currency === selectedCurrency);
        }
        if (startDate && endDate) {
        txs = txs.filter(t => {
            const txDate = new Date(t.date);
            return txDate >= startDate && txDate <= endDate;
        });
        }
        if (search.trim()) {
        txs = txs.filter(
            t =>
            t.activity.toLowerCase().includes(search.toLowerCase()) ||
            t.people.name.toLowerCase().includes(search.toLowerCase())
        );
        }
        return txs;
    }, [filter, search, selectedCurrency, startDate, endDate]);

    return (
        <div className="w-full bg-white border-gray-200">
        {/* FILTERS & SEARCH BAR */}
        <div className="flex flex-row justify-between items-center mb-6">
            {/* Left: Filter Buttons */}
            <div className="flex items-center gap-2">
            {filterOptions.map(opt => (
                <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={`px-3 py-1 text-[9px] rounded-full border ${
                    filter === opt.key ? "bg-red-800 text-white border-red-800" : "bg-white text-gray-600 border-gray-200 hover:bg-red-50"
                }`}
                >
                {opt.label} <span className="ml-1">{opt.count}</span>
                </button>
            ))}
            </div>

            {/* Right: Search, Date Picker, Apply Filter */}
            <div className="flex items-center gap-2">
            {/* Date Picker Button */}
            <div className="relative">
                <button
                className="flex items-center border rounded-full px-3 py-1 text-[9px] text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setShowDatePicker(v => !v)}
                >
                <FiCalendar className="mr-1" />
                {startDate && endDate
                    ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                    : "Pick Date"}
                </button>
                {showDatePicker && (
                <div className="absolute right-0 mt-2 z-20">
                    <DatePicker
                        selectsRange
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            setDateRange(update);
                        }}
                        inline
                        onCalendarClose={() => setShowDatePicker(false)}
                        />
                    <button
                        className="mt-2 w-full px-3 py-1 bg-red-800 text-white text-[10px] rounded-full"
                        onClick={() => setShowDatePicker(false)}
                    >
                    Apply
                    </button>
                </div>
                )}
            </div>

            {/* Apply Filter Button with Currency Dropdown */}
            <div className="relative">
                <button
                    className="flex items-center border rounded-full px-3 py-1 text-[9px] text-gray-700 bg-white hover:bg-gray-50"
                    onClick={() => setShowFilterDropdown(v => !v)}
                >
                <FiChevronDown className="mr-1" />
                Apply filter
                </button>
                
                {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg z-20">
                    
                    {/* Days filter */}
                    <div
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-[9px]"
                        onClick={() => setShowDaysDropdown(v => !v)}
                        >
                        Days
                        <FiChevronDown className="ml-2" />
                    </div>
                    {showDaysDropdown && (
                    <div className="mt-1">
                        {dayOptions.map(day => (
                        <div
                            key={day}
                            className={`px-4 py-1 text-[9px] cursor-pointer hover:bg-gray-200 ${
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

                    {/* Currency filter */}
                    <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-[9px]"
                    onClick={() => setShowCurrencyDropdown(v => !v)}
                    >
                    Currency
                    <FiChevronDown className="ml-2" />
                    </div>
                    {showCurrencyDropdown && (
                    <div className="mt-1">
                        {currencyOptions.map(opt => (
                        <div
                            key={opt}
                            className={`px-4 py-1 text-[9px] cursor-pointer hover:bg-gray-200 ${
                            selectedCurrency === opt ? "font-bold text-red-700" : ""
                            }`}
                            onClick={() => {
                            setSelectedCurrency(opt);
                            setShowCurrencyDropdown(false);
                            setShowFilterDropdown(false);
                            }}
                        >
                            {opt}
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative w-[200px] text-gray-700">
                <FiSearch className="h-3 w-3 absolute left-3 top-2 transform text-gray-400 text-sm" />
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-8 pr-2 py-1 border rounded-full text-[9px] focus:outline-none"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            </div>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-center text-xs text-gray-500">
                <thead className="text-[10px] text-gray-700 text-center uppercase bg-gray-50 sticky top-0 z-10">
                    <tr className="text-[10px]">
                        <th className="py-2">Activity</th>
                        <th className=" py-2">Date</th>
                        <th className=" py-2">Amount</th>
                        <th className=" py-2">Method</th>
                        <th className="pr-3 py-2">Status</th>
                    </tr>
                </thead>

                <tbody className="max-h-64 overflow-y-auto">
                    {filtered.map(tx => (
                    <tr key={tx.id} className="text-[10px]">
                        <td className="px-4 py-2 flex items-center gap-2">
                            <TypeIcon type={tx.type} />
                            {/* {tx.type} */}
                            <div>
                                <div className="font-medium text-gray-800 whitespace-nowrap">{tx.activity}</div>
                                <div className="flex items-center gap-1">
                                    <Avatar avatar={tx.people.avatar} initials={tx.people.initials} />
                                    <span className="text-gray-600 whitespace-nowrap">{tx.people.name}</span>
                                </div>
                            </div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">{tx.date}</td>
                        <td className="px-4 py-2 font-semibold text-gray-800 whitespace-nowrap">{tx.amount}</td>
                        <td className="px-4 py-2">
                        <div className="text-gray-800 whitespace-nowrap">{tx.method}</div>
                        <div className="text-gray-500 text-[9px]">{tx.methodDetail}</div>
                        </td>
                        <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] ${statusColors[tx.status]}`}>{tx.status}</span>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </div>
    );
};

export default TransactionsTab;
