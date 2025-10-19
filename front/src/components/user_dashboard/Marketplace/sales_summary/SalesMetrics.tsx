import { Card } from "@/components/ui/card";

interface SalesMetricsProps {
  metrics: {
    totalArtworksSold: number;
    totalEarnings: number;
    pendingSales: number;
    completedSales: number;
    cancelledSales: number;
    refundedSales: number;
    currentMonthSales?: number;
    growthPercentage?: number;
  };
}

const SalesMetrics = ({ metrics }: SalesMetricsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Artworks Sold */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Artworks Sold</p>
            <p className="text-xl font-bold text-primary">{metrics.totalArtworksSold}</p>
          </div>
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center text-[11px] text-muted-foreground">
          <span className="text-green-600 font-medium">+{metrics.currentMonthSales || metrics.completedSales}</span>
          <span className="ml-1">completed this month</span>
        </div>
      </Card>

      {/* Total Earnings */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Earnings</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(metrics.totalEarnings)}</p>
          </div>
          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        </div>
        <div className="mt-4 flex items-center text-[11px] text-muted-foreground">
          <span className={`font-medium ${(metrics.growthPercentage || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
            {(metrics.growthPercentage || 0) >= 0 ? "+" : ""}
            {metrics.growthPercentage || 0}%
          </span>
          <span className="ml-1">from last month</span>
        </div>
      </Card>

      {/* Sales Status Breakdown */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Sales Status</p>
            <p className="text-xl font-bold text-blue-700">Overview</p>
          </div>
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground">Pending</span>
            <span className="font-medium text-orange-600">{metrics.pendingSales}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground">Completed</span>
            <span className="font-medium text-green-600">{metrics.completedSales}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-muted-foreground">Cancelled</span>
            <span className="font-medium text-red-600">{metrics.cancelledSales}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SalesMetrics;
