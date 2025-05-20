import React, { useState } from "react";
import { toast } from "sonner";

const ExhibitsTab = () => {
  const [typeTab, setTypeTab] = useState<"solo" | "collab">("solo");
  const [statusFilter, setStatusFilter] = useState<"on_going" | "closed">("on_going");

  const tabEmptyMessages = {
    on_going: "No ongoing exhibits found.",
    closed: "No past exhibits found.",
  };

  return (
    <div>
      {/* Main Tabs (Solo / Collab) */}
      <div className="text-[10px] pl-2 border-gray-300 mb-3">
        <div className="flex justify-between items-center">
          <div className="space-x-8">
            {["solo", "collab"].map((tab) => (
              <button
                key={tab}
                className={`pb-2 font-medium uppercase ${
                  typeTab === tab ? "border-b-2 border-red-800 text-red-800" : "text-gray-600"
                }`}
                onClick={() => setTypeTab(tab as typeof typeTab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Pending Icon + Status Filter */}
          <div className="flex items-center space-x-2">
            {typeTab === "collab" && (
              <button
                className="relative group"
                aria-label="Pending Requests"
              >
                {/* Pending Icon (clock SVG) */}
                <i className='bx bx-time text-yellow-500 cursor-pointer text-[15px]'></i>
                {/* Tooltip */}
                <span className="absolute top-6 mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-[10px] text-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Pending Requests
                </span>
              </button>
            )}

            {/* Status Filter (Ongoing / Past) */}
            <select
              className="text-[9px] border rounded-full pr-6 pl-2 py-1 text-gray-700 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            >
              <option value="on_going">Ongoing</option>
              <option value="closed">Ended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exhibit Cards Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        <div className="col-span-full text-center p-4 text-xs text-gray-500">
          {tabEmptyMessages[statusFilter]}
        </div>
      </div>
    </div>
  );
};

export default ExhibitsTab;
