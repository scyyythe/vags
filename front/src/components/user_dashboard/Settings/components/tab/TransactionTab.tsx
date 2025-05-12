import React, { useState, useMemo } from "react";
import { FiArrowDownLeft, FiArrowUpRight, FiRepeat } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

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

// Icon by type
function TypeIcon({ type }: { type: string }) {
  if (type === "Sent")
    return <FiArrowUpRight className="text-red-800 bg-red-100 rounded-full w-6 h-6 p-1" />;
  if (type === "Received")
    return <FiArrowDownLeft className="text-green-700 bg-green-100 rounded-full w-6 h-6 p-1" />;
  return <FiRepeat className="text-blue-700 bg-blue-100 rounded-full w-6 h-6 p-1" />;
}

function Avatar({ avatar, initials }: { avatar?: string | null; initials: string }) {
  if (avatar)
    return <img src={avatar} alt={initials} className="w-8 h-8 rounded-full object-cover" />;
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-xs">
      {initials}
    </div>
  );
}

const filterOptions = [
  { key: "all", label: "All", count: mockTransactions.length },
  { key: "received", label: "Received", count: mockTransactions.filter(t => t.type === "Received").length },
  { key: "sent", label: "Sent", count: mockTransactions.filter(t => t.type === "Sent").length },
  { key: "converted", label: "Convert", count: mockTransactions.filter(t => t.type === "Converted").length },
];

const statusOrder = ["Success", "Incomplete", "Failed"];

const TransactionsTab: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  // Filtering logic
  const filtered = useMemo(() => {
    let txs = [...mockTransactions];
    if (filter !== "all") {
      const type = filter === "converted" ? "Converted" : filter.charAt(0).toUpperCase() + filter.slice(1);
      txs = txs.filter(t => t.type === type);
    }
    if (search.trim()) {
      txs = txs.filter(
        t =>
          t.activity.toLowerCase().includes(search.toLowerCase()) ||
          t.people.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return txs;
  }, [filter, search]);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select className="border rounded px-2 py-1 text-xs text-gray-700">
          <option>Last 7 days</option>
          <option>Last 14 days</option>
          <option>Last 30 days</option>
        </select>
        <input
          type="text"
          className="border rounded px-2 py-1 text-xs text-gray-700"
          style={{ minWidth: 120 }}
          value="15 Mar - 22 Mar"
          readOnly
        />
        <div className="flex gap-1">
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-2 py-1 text-xs rounded font-semibold border ${
                filter === opt.key
                  ? "bg-red-800 text-white border-red-800"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-red-50"
              }`}
            >
              {opt.label} <span className="ml-1 text-[10px]">{opt.count}</span>
            </button>
          ))}
        </div>
        <select className="border rounded px-2 py-1 text-xs text-gray-700">
          <option>Currency</option>
          <option>USD</option>
          <option>EUR</option>
          <option>PHP</option>
          <option>GBP</option>
          <option>IDR</option>
        </select>
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Search"
          className="border rounded px-2 py-1 text-xs text-gray-700 ml-auto"
          style={{ minWidth: 120 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="text-gray-500 font-semibold bg-gray-50">
              <th className="py-2 px-2 text-left">TYPE</th>
              <th className="py-2 px-2 text-left">AMOUNT</th>
              <th className="py-2 px-2 text-left">PAYMENT METHOD</th>
              <th className="py-2 px-2 text-left">STATUS</th>
              <th className="py-2 px-2 text-left">ACTIVITY</th>
              <th className="py-2 px-2 text-left">PEOPLE</th>
              <th className="py-2 px-2 text-left">DATE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No transactions found.
                </td>
              </tr>
            )}
            {filtered.map(tx => (
              <tr key={tx.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <TypeIcon type={tx.type} />
                    <span className="font-semibold">{tx.type}</span>
                  </div>
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`font-semibold ${
                      tx.type === "Sent"
                        ? "text-red-800"
                        : tx.type === "Received"
                        ? "text-green-700"
                        : "text-blue-700"
                    }`}
                  >
                    {tx.amount}
                  </span>
                  <span className="ml-1 text-gray-500 text-[10px]">{tx.currency}</span>
                </td>
                <td className="py-2 px-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">{tx.method}</span>
                    <span className="text-gray-400 text-[10px]">{tx.methodDetail}</span>
                  </div>
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-semibold ${statusColors[tx.status] || "bg-gray-100 text-gray-500"}`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="py-2 px-2">{tx.activity}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <Avatar avatar={tx.people.avatar} initials={tx.people.initials} />
                    <span>{tx.people.name}</span>
                  </div>
                </td>
                <td className="py-2 px-2">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTab;
