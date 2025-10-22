import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Search, Shield, ThumbsDown, ThumbsUp, Download } from "lucide-react";
import { toast } from "sonner";
import useFlaggedContent from "@/hooks/moderator/useFlaggedContent";
import { useContentModeration } from "@/hooks/moderator/useContentModeration";

type ContentType = "artwork" | "comment" | "user" | "auction" | "exhibit" | "unknown";

const ModeratorContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContentType, setSelectedContentType] = useState<ContentType | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "reports">("reports");

  // Fetch flagged content from backend
  const { data: flaggedContentData, isLoading, error } = useFlaggedContent();
  const moderationMutation = useContentModeration();

  // Handle error state
  if (error) {
    console.error("Failed to load flagged content:", error);
  }

  const flaggedContent = flaggedContentData?.flaggedContent || [];

  const filteredContent = flaggedContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.content_data.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.content_data.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.content_data.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.report_description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedContentType === "all" || content.type === selectedContentType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === "reports") {
      // Since we don't have timesReported in the backend data, we'll sort by date
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    } else {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    }
  });

  const handleApprove = (contentId: string, contentType: string, reportId: string) => {
    moderationMutation.mutate(
      {
        action: "approve",
        content_id: contentId,
        content_type: contentType,
        report_id: reportId,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to approve content", { closeButton: true });
        }
      }
    );
  };

  const handleRemove = (contentId: string, contentType: string, reportId: string) => {
    moderationMutation.mutate(
      {
        action: "remove",
        content_id: contentId,
        content_type: contentType,
        report_id: reportId,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to remove content", { closeButton: true });
        }
      }
    );
  };

  const handleWarn = (contentId: string, contentType: string, reportId: string) => {
    moderationMutation.mutate(
      {
        action: "warn",
        content_id: contentId,
        content_type: contentType,
        report_id: reportId,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to send warning", { closeButton: true });
        }
      }
    );
  };

  const handleEscalate = (contentId: string, contentType: string, reportId: string) => {
    moderationMutation.mutate(
      {
        action: "escalate",
        content_id: contentId,
        content_type: contentType,
        report_id: reportId,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message, { closeButton: true });
        },
        onError: () => {
          toast.error("Failed to escalate content", { closeButton: true });
        }
      }
    );
  };

  const handleDownloadReport = () => {
    toast.success("Report downloaded successfully", { closeButton: true });
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case "artwork":
        return <Eye className="h-4 w-4" />;
      case "comment":
        return <ThumbsDown className="h-4 w-4" />;
      case "user":
        return <Shield className="h-4 w-4" />;
      case "auction":
        return <ThumbsUp className="h-4 w-4" />;
      case "exhibit":
        return <Eye className="h-4 w-4" />;
      case "unknown":
        return <Search className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: ContentType) => {
    switch (type) {
      case "artwork":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "comment":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "user":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "auction":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "exhibit":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      case "unknown":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-md font-bold">Content Moderation</h1>
          <p className="text-[10px] text-muted-foreground">
            Review and take action on flagged content
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[10px] flex items-center gap-1 h-8"
          onClick={handleDownloadReport}
        >
          <Download className="h-3 w-3" /> Export Report
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-4 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            placeholder="Search content..."
            className="pl-8 rounded-full h-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{fontSize:"10px"}}
          />
        </div>
        <Tabs 
          value={selectedContentType} 
          onValueChange={(value) => setSelectedContentType(value as ContentType | "all")}
          className="sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-6 h-9">
            <TabsTrigger value="all" className="text-[10px]">All</TabsTrigger>
            <TabsTrigger value="artwork" className="text-[10px]">Artwork</TabsTrigger>
            <TabsTrigger value="comment" className="text-[10px]">Comments</TabsTrigger>
            <TabsTrigger value="user" className="text-[10px]">Users</TabsTrigger>
            <TabsTrigger value="auction" className="text-[10px]">Auctions</TabsTrigger>
            <TabsTrigger value="exhibit" className="text-[10px]">Exhibits</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs 
          value={sortBy} 
          onValueChange={(value) => setSortBy(value as "date" | "reports")}
          className="sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="reports" className="text-[10px]">Most Reported</TabsTrigger>
            <TabsTrigger value="date" className="text-[10px]">Most Recent</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="overflow-hidden animate-pulse">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-300 rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-md"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                    <div className="bg-gray-200 p-2 rounded-md">
                      <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                      <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <div className="h-7 bg-gray-300 rounded w-16"></div>
                  <div className="h-7 bg-gray-300 rounded w-20"></div>
                  <div className="h-7 bg-gray-300 rounded w-20"></div>
                  <div className="h-7 bg-gray-300 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredContent.length > 0 ? (
          filteredContent.map((content) => (
            <Card key={content.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xs">{content.title}</CardTitle>
                    <CardDescription className="text-[11px]">
                      Created by {content.content_data.artist || content.content_data.author || content.content_data.username || "Unknown"} on {content.created_at ? new Date(content.created_at).toLocaleDateString() : "Unknown date"}
                    </CardDescription>
                  </div>
                  <Badge className={`text-[11px] ${getContentTypeColor(content.type)}`}>
                    <span className="flex items-center gap-1 text-[10px]">
                      {getContentTypeIcon(content.type)}
                      <span className="capitalize text-[10px]">{content.type}</span>
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {content.content_data.image_url && (
                    <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 relative rounded-md overflow-hidden border">
                      <img
                        src={content.content_data.image_url}
                        alt={content.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                        <Badge className="bg-red-500 text-[11px]">Flagged</Badge>
                      </div>
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="text-[11px] font-medium">Reported for: {content.flagged_reason}</h3>
                      <p className="text-[11px] text-red-600">Status: {content.status}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-[11px]">{content.report_description}</p>
                      {content.content_data.text && (
                        <div className="mt-2 p-2 bg-white rounded border-l-2 border-gray-300">
                          <p className="text-[10px] font-medium text-gray-600">Content:</p>
                          <p className="text-[10px]">"{content.content_data.text}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7 px-2 rounded-full"
                    onClick={() => handleApprove(content.content_data.id || content.content_id, content.type, content.id)}
                    disabled={moderationMutation.isPending}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7 px-2 rounded-full"
                    onClick={() => handleWarn(content.content_data.id || content.content_id, content.type, content.id)}
                    disabled={moderationMutation.isPending}
                  >
                    Warn User
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7 px-2 rounded-full"
                    onClick={() => handleEscalate(content.content_data.id || content.content_id, content.type, content.id)}
                    disabled={moderationMutation.isPending}
                  >
                    Escalate
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-[10px] h-7 px-2 rounded-full"
                    onClick={() => handleRemove(content.content_data.id || content.content_id, content.type, content.id)}
                    disabled={moderationMutation.isPending}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-48">
              <p className="text-xs text-muted-foreground">No flagged content found</p>
              <p className="text-[11px] text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "All content has been reviewed"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ModeratorContent;
