export const formatNumber = (num: number): string => {
  const absNum = Math.abs(num);
  const units = [
    { value: 1e18, symbol: "Q" },
    { value: 1e15, symbol: "q" },
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
  ];

  for (const unit of units) {
    if (absNum >= unit.value) {
      return (
        (num / unit.value)
          .toFixed(2)
          .replace(/\.00$/, "")
          .replace(/(\.\d)0$/, "$1") + unit.symbol
      );
    }
  }

  return num.toString();
};

export const formatCurrency = (num: number | null | undefined, currencySymbol = "₱"): string => {
  if (num == null || isNaN(num)) return "No bids";
  return `${currencySymbol}${formatNumber(num)}`;
};

// Specialized formatting for tip jar donations - capped at Trillion
export const formatTipAmount = (num: number): string => {
  const absNum = Math.abs(num);
  const units = [
    { value: 1e12, symbol: "T" }, // Trillion (max)
    { value: 1e9, symbol: "B" }, // Billion
    { value: 1e6, symbol: "M" }, // Million
    { value: 1e3, symbol: "K" }, // Thousand
  ];

  for (const unit of units) {
    if (absNum >= unit.value) {
      return (
        (num / unit.value)
          .toFixed(2)
          .replace(/\.00$/, "")
          .replace(/(\.\d)0$/, "$1") + unit.symbol
      );
    }
  }

  return num.toString();
};

export const formatTipCurrency = (num: number | null | undefined, currencySymbol = "₱"): string => {
  if (num == null || isNaN(num)) return "₱0";
  return `${currencySymbol}${formatTipAmount(num)}`;
};
