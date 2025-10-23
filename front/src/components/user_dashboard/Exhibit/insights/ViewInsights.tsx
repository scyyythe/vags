import { useNavigate } from "react-router-dom";
import Header from "@/components/user_dashboard/navbar/Header";
import { Footer } from "@/components/user_dashboard/footer/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle, 
  TrendingUp, 
  TrendingDown,
  ExternalLink,
  Search,
  UserCheck,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAutoTranslation } from "@/hooks/autoTranslate/useAutoTranslation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

const ViewInsights = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Translation hooks for all text content
  const viewInsightsText = useAutoTranslation("View Insights", language);
  const detailedAnalyticsText = useAutoTranslation("Detailed analytics for", language);
  const explore3DGalleryText = useAutoTranslation("Explore 3D Gallery", language);
  const totalViewsText = useAutoTranslation("Total Views", language);
  const thisWeekText = useAutoTranslation("This week", language);
  const likesFavoritesText = useAutoTranslation("Likes & Favorites", language);
  const totalEngagementText = useAutoTranslation("Total engagement", language);
  const sharesText = useAutoTranslation("Shares", language);
  const socialReachText = useAutoTranslation("Social reach", language);
  const commentsText = useAutoTranslation("Comments", language);
  const communityFeedbackText = useAutoTranslation("Community feedback", language);
  const weeklyActivityText = useAutoTranslation("Weekly Activity", language);
  const trafficSourcesText = useAutoTranslation("Traffic Sources", language);
  const directVisitText = useAutoTranslation("Direct Visit", language);
  const socialMediaText = useAutoTranslation("Social Media", language);
  const searchText = useAutoTranslation("Search", language);
  const sharedLinkText = useAutoTranslation("Shared Link", language);
  const averageTimeSpentText = useAutoTranslation("Average Time Spent", language);
  const usersSpendAverageText = useAutoTranslation("Users spend an average of 4 minutes and 32 seconds viewing this exhibit", language);
  const engagementByTimeText = useAutoTranslation("Engagement by Time of Day", language);
  const trafficSourcesBreakdownText = useAutoTranslation("Traffic Sources Breakdown", language);
  const recentCommentsText = useAutoTranslation("Recent Comments", language);
  const completionRateText = useAutoTranslation("Completion Rate", language);
  const averageRatingText = useAutoTranslation("Average Rating", language);
  const returnVisitorsText = useAutoTranslation("Return Visitors", language);
  const countriesReachedText = useAutoTranslation("Countries Reached", language);

  // Translate exhibit title
  const translatedExhibitTitle = useAutoTranslation("Digital Renaissance Collection", language);

  // Translate comment texts
  const comment1Text = useAutoTranslation("Absolutely stunning collection! The detail in these pieces is incredible.", language);
  const comment2Text = useAutoTranslation("The way light plays in these digital works reminds me of classical masters.", language);
  const comment3Text = useAutoTranslation("This exhibition changed my perspective on digital art.", language);
  
  // Translate time stamps
  const hoursAgoText = useAutoTranslation("hours ago", language);
  const dayAgoText = useAutoTranslation("day ago", language);

  // Mock data for demonstrations
  const exhibitData = {
    title: "Digital Renaissance Collection",
    totalViews: 12847,
    viewsTrend: 12,
    likes: 1285,
    likesTrend: 8,
    shares: 342,
    sharesTrend: -3,
    comments: 78,
    commentsTrend: 15,
    avgTimeSpent: "4m 32s",
    timeTrend: 5
  };

  const weeklyViews = [
    { day: 'Mon', views: 1450, likes: 120, shares: 45 },
    { day: 'Tue', views: 1820, likes: 165, shares: 52 },
    { day: 'Wed', views: 2100, likes: 198, shares: 61 },
    { day: 'Thu', views: 1890, likes: 142, shares: 38 },
    { day: 'Fri', views: 2340, likes: 210, shares: 67 },
    { day: 'Sat', views: 1950, likes: 175, shares: 44 },
    { day: 'Sun', views: 1297, likes: 108, shares: 35 }
  ];

  const trafficSources = [
    { name: directVisitText, value: 45, color: '#DC2626' },
    { name: socialMediaText, value: 25, color: '#f87171' },
    { name: searchText, value: 20, color: '#fca5a5' },
    { name: sharedLinkText, value: 10, color: '#fecaca' }
  ];

  const timeSpentData = [
    { hour: '00:00', avgTime: 2.5 },
    { hour: '04:00', avgTime: 1.8 },
    { hour: '08:00', avgTime: 3.2 },
    { hour: '12:00', avgTime: 4.8 },
    { hour: '16:00', avgTime: 5.2 },
    { hour: '20:00', avgTime: 4.1 },
  ];

  const recentComments = [
    { user: "ArtLover92", comment: comment1Text, time: `2 ${hoursAgoText}`, likes: 12 },
    { user: "DigitalCritic", comment: comment2Text, time: `5 ${hoursAgoText}`, likes: 8 },
    { user: "ModernArt", comment: comment3Text, time: `1 ${dayAgoText}`, likes: 15 },
  ];

  const TrendIndicator = ({ value, className = "" }: { value: number; className?: string }) => {
    const isPositive = value > 0;
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {isPositive ? (
          <TrendingUp className="h-3 w-3 text-green-600" />
        ) : (
          <TrendingDown className="h-3 w-3 text-red-600" />
        )}
        <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{value}%
        </span>
      </div>
    );
  };

  const MetricCard = ({ 
    title, 
    value, 
    trend, 
    icon: Icon, 
    subtitle,
    className = "" 
  }: {
    title: string;
    value: string | number;
    trend: number;
    icon: any;
    subtitle?: string;
    className?: string;
  }) => (
    <Card className={`hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-black dark:text-white">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-800 dark:text-red-400">
          {value.toLocaleString()}
        </div>
        <div className="flex items-center justify-between mt-2">
          {subtitle && <p className="text-[11px] text-gray-500 dark:text-gray-400">{subtitle}</p>}
          <TrendIndicator value={trend} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="mt-12">
            <h1 className="text-lg font-bold text-black dark:text-white mb-2">
              <i onClick={() => navigate(-1)} className="bx bx-chevron-left text-xl mr-2 text-black dark:text-white relative top-0.5 cursor-pointer"></i>
              {viewInsightsText}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 pl-8">
              {detailedAnalyticsText} "{translatedExhibitTitle}"
            </p>

          </div>
          
          <button
            onClick={() => navigate("/gallery-3d")}
            className="md:mt-10 py-1 px-5 bg-red-800 text-white hover:bg-red-700 transition-colors rounded-full "
          >
            <span className="text-xs">{explore3DGalleryText}</span>
            <i className='bx bx-chevron-right relative top-0.5 left-1'></i>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title={totalViewsText}
            value={exhibitData.totalViews}
            trend={exhibitData.viewsTrend}
            icon={Eye}
            subtitle={thisWeekText}
          />
          <MetricCard
            title={likesFavoritesText}
            value={exhibitData.likes}
            trend={exhibitData.likesTrend}
            icon={Heart}
            subtitle={totalEngagementText}
          />
          <MetricCard
            title={sharesText}
            value={exhibitData.shares}
            trend={exhibitData.sharesTrend}
            icon={Share2}
            subtitle={socialReachText}
          />
          <MetricCard
            title={commentsText}
            value={exhibitData.comments}
            trend={exhibitData.commentsTrend}
            icon={MessageCircle}
            subtitle={communityFeedbackText}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <Card className="col-span-1 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px] text-black">
                {weeklyActivityText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="views" fill="#B91C1C" radius={[100, 100, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Sources Pie Chart */}
          <Card className="col-span-1 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px] text-black">
                {trafficSourcesText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#B91C1C"
                    dataKey="value"
                    style={{ fontSize: '11px' }}
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px' , borderRadius: '8px',}} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Time Engagement Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Average Time Spent */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px] text-black">
                {averageTimeSpentText}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-800 mb-2">
                {exhibitData.avgTimeSpent}
              </div>
              <TrendIndicator value={exhibitData.timeTrend} />
              <div className="mt-4 text-xs text-gray-600">
                {usersSpendAverageText}
              </div>
            </CardContent>
          </Card>

          {/* Time Distribution Chart */}
          <Card className="lg:col-span-2 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-[13px] text-black">{engagementByTimeText}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ fontSize: '11px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="#dc2626" 
                    fill="#dc2626" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Sources Detail & Recent Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traffic Sources Detail */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px] text-black">
                {trafficSourcesBreakdownText}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {source.name === directVisitText && <UserCheck className="h-4 w-4 text-gray-600" />}
                    {source.name === socialMediaText && <Share2 className="h-4 w-4 text-gray-600" />}
                    {source.name === searchText && <Search className="h-4 w-4 text-gray-600" />}
                    {source.name === sharedLinkText && <ExternalLink className="h-4 w-4 text-gray-600" />}
                    <span className="text-xs font-medium text-gray-800">{source.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-red-800" 
                        style={{ width: `${source.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-800">{source.value}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Comments */}
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px] text-black">
                {recentCommentsText}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {recentComments.map((comment, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-800">{comment.user}</span>
                    <div className="flex items-center gap-2">
                      <Heart className="h-3 w-3 text-red-800" />
                      <span style={{ fontSize: '11px' }} className="text-gray-500">{comment.likes}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
                    {comment.comment}
                  </p>
                  <span style={{ fontSize: '10px' }} className="text-gray-500">{comment.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Summary */}
        <Card className="bg-red-800 border-red-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <div className="text-center">
                <div className="text-xl font-bold">98.5%</div>
                <div className="text-[11px] opacity-90">{completionRateText}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">4.8/5</div>
                <div className="text-[11px] opacity-90">{averageRatingText}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">67%</div>
                <div className="text-[11px] opacity-90">{returnVisitorsText}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">23</div>
                <div className="text-[11px] opacity-90">{countriesReachedText}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default ViewInsights;