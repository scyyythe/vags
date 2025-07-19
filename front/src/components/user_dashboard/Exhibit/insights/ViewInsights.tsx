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
    { name: 'Direct Visit', value: 45, color: '#DC2626' },
    { name: 'Social Media', value: 25, color: '#f87171' },
    { name: 'Search', value: 20, color: '#fca5a5' },
    { name: 'Shared Link', value: 10, color: '#fecaca' }
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
    { user: "ArtLover92", comment: "Absolutely stunning collection! The detail in these pieces is incredible.", time: "2 hours ago", likes: 12 },
    { user: "DigitalCritic", comment: "The way light plays in these digital works reminds me of classical masters.", time: "5 hours ago", likes: 8 },
    { user: "ModernArt", comment: "This exhibition changed my perspective on digital art.", time: "1 day ago", likes: 15 },
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
    <Card className={`hover:shadow-lg transition-all duration-300 bg-white border-gray-200 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-black">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-red-800">
          {value.toLocaleString()}
        </div>
        <div className="flex items-center justify-between mt-2">
          {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
          <TrendIndicator value={trend} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="mt-12">
            <h1 className="text-lg font-bold text-black mb-2">
              <i onClick={() => navigate(-1)} className="bx bx-chevron-left text-xl mr-2 text-black relative top-0.5 cursor-pointer"></i>
              View Insights
            </h1>
            <p className="text-xs text-gray-600 pl-8">
              Detailed analytics for "{exhibitData.title}"
            </p>

          </div>
          
          <button
            onClick={() => navigate("/gallery-3d")}
            className="md:mt-10 py-1 px-5 bg-red-800 text-white hover:bg-red-700 transition-colors rounded-full "
          >
            <span className="text-xs">Explore 3D Gallery</span>
            <i className='bx bx-chevron-right relative top-0.5 left-1'></i>
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Views"
            value={exhibitData.totalViews}
            trend={exhibitData.viewsTrend}
            icon={Eye}
            subtitle="This week"
          />
          <MetricCard
            title="Likes & Favorites"
            value={exhibitData.likes}
            trend={exhibitData.likesTrend}
            icon={Heart}
            subtitle="Total engagement"
          />
          <MetricCard
            title="Shares"
            value={exhibitData.shares}
            trend={exhibitData.sharesTrend}
            icon={Share2}
            subtitle="Social reach"
          />
          <MetricCard
            title="Comments"
            value={exhibitData.comments}
            trend={exhibitData.commentsTrend}
            icon={MessageCircle}
            subtitle="Community feedback"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <Card className="col-span-1 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[13px] text-black">
                Weekly Activity
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
                Traffic Sources
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
                Average Time Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-800 mb-2">
                {exhibitData.avgTimeSpent}
              </div>
              <TrendIndicator value={exhibitData.timeTrend} />
              <div className="mt-4 text-xs text-gray-600">
                Users spend an average of 4 minutes and 32 seconds viewing this exhibit
              </div>
            </CardContent>
          </Card>

          {/* Time Distribution Chart */}
          <Card className="lg:col-span-2 bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-[13px] text-black">Engagement by Time of Day</CardTitle>
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
                Traffic Sources Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {source.name === 'Direct Visit' && <UserCheck className="h-4 w-4 text-gray-600" />}
                    {source.name === 'Social Media' && <Share2 className="h-4 w-4 text-gray-600" />}
                    {source.name === 'Search' && <Search className="h-4 w-4 text-gray-600" />}
                    {source.name === 'Shared Link' && <ExternalLink className="h-4 w-4 text-gray-600" />}
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
                Recent Comments
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
                <div className="text-[11px] opacity-90">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">4.8/5</div>
                <div className="text-[11px] opacity-90">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">67%</div>
                <div className="text-[11px] opacity-90">Return Visitors</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">23</div>
                <div className="text-[11px] opacity-90">Countries Reached</div>
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