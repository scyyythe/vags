import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, Search, Shield, ThumbsDown, ThumbsUp, Download } from "lucide-react";
import { toast } from "sonner";

type ContentType = "artwork" | "comment" | "user" | "bid";

interface FlaggedContent {
  id: string;
  contentType: ContentType;
  title: string;
  reportReason: string;
  description: string;
  creator: string;
  dateCreated: string;
  timesReported: number;
  previewImage?: string;
}

const mockFlaggedContent: FlaggedContent[] = [
  {
    id: "art1234",
    contentType: "artwork",
    title: "Dark Nebula",
    reportReason: "Inappropriate Content",
    description: "This artwork contains graphic content that violates community guidelines. The imagery includes explicit violence that should not be allowed.",
    creator: "user789",
    dateCreated: "2023-06-10",
    timesReported: 4,
    previewImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
  },
  {
    id: "comment456",
    contentType: "comment",
    title: "Comment on 'Sunset Dreams'",
    reportReason: "Harassment",
    description: "The comment contains offensive language directed at the artist. Multiple users have flagged this as harassment.",
    creator: "user456",
    dateCreated: "2023-06-15",
    timesReported: 3,
  },
  {
    id: "user789",
    contentType: "user",
    title: "Profile: @artmaster2000",
    reportReason: "Impersonation",
    description: "This user is impersonating a famous artist and selling counterfeit works. They have copied the bio and artwork style of @realartmaster.",
    creator: "system",
    dateCreated: "2023-06-02",
    timesReported: 7,
  },
  {
    id: "bid5678",
    contentType: "bid",
    title: "Bid on 'Crystal Waters'",
    reportReason: "Fraudulent Activity",
    description: "This bid appears to be fraudulent. The user has made identical bids on multiple artworks in quick succession.",
    creator: "user123",
    dateCreated: "2023-06-16",
    timesReported: 2,
  },
  {
    id: "art5678",
    contentType: "artwork",
    title: "Fire and Ice",
    reportReason: "Copyright Infringement",
    description: "This artwork appears to be a direct copy of another artist's work without attribution or permission.",
    creator: "user234",
    dateCreated: "2023-06-12",
    timesReported: 5,
    previewImage: "https://images.unsplash.com/photo-1604871000636-074fa5117945",
  },
];

const ModeratorContent = () => {
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>(mockFlaggedContent);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContentType, setSelectedContentType] = useState<ContentType | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "reports">("reports");

  const filteredContent = flaggedContent.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedContentType === "all" || content.contentType === selectedContentType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === "reports") {
      return b.timesReported - a.timesReported;
    } else {
      return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    }
  });

  const handleApprove = (id: string) => {
    setFlaggedContent(flaggedContent.filter(content => content.id !== id));
    toast.success("Content approved and restored");
  };

  const handleRemove = (id: string) => {
    setFlaggedContent(flaggedContent.filter(content => content.id !== id));
    toast.success("Content removed");
  };

  const handleWarn = (id: string) => {
    toast.success("Warning sent to user");
  };

  const handleEscalate = (id: string) => {
    toast.success("Content escalated to admin for review");
  };

  const handleDownloadReport = () => {
    toast.success("Report downloaded successfully");
  };

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case "artwork":
        return <Eye className="h-4 w-4" />;
      case "comment":
        return <ThumbsDown className="h-4 w-4" />;
      case "user":
        return <Shield className="h-4 w-4" />;
      case "bid":
        return <ThumbsUp className="h-4 w-4" />;
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
      case "bid":
        return "bg-green-100 text-green-800 hover:bg-green-200";
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
          <TabsList className="grid w-full grid-cols-5 h-9">
            <TabsTrigger value="all" className="text-[10px]">All</TabsTrigger>
            <TabsTrigger value="artwork" className="text-[10px]">Artwork</TabsTrigger>
            <TabsTrigger value="comment" className="text-[10px]">Comments</TabsTrigger>
            <TabsTrigger value="user" className="text-[10px]">Users</TabsTrigger>
            <TabsTrigger value="bid" className="text-[10px]">Bids</TabsTrigger>
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
        {filteredContent.length > 0 ? (
          filteredContent.map((content) => (
            <Card key={content.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xs">{content.title}</CardTitle>
                    <CardDescription className="text-[11px]">
                      Created by {content.creator} on {content.dateCreated}
                    </CardDescription>
                  </div>
                  <Badge className={`text-[11px] ${getContentTypeColor(content.contentType)}`}>
                    <span className="flex items-center gap-1 text-[10px]">
                      {getContentTypeIcon(content.contentType)}
                      <span className="capitalize text-[10px]">{content.contentType}</span>
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {content.previewImage && (
                    <div className="shrink-0 w-24 h-24 md:w-32 md:h-32 relative rounded-md overflow-hidden border">
                      <img
                        src={content.previewImage}
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
                      <h3 className="text-[11px] font-medium">Reported for: {content.reportReason}</h3>
                      <p className="text-[11px] text-red-600">Reported {content.timesReported} times</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <p className="text-[11px]">{content.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7 px-2 rounded-full"
                    onClick={() => handleApprove(content.id)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7 px-2 rounded-full"
                    onClick={() => handleWarn(content.id)}
                  >
                    Warn User
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-[10px] h-7 px-2 rounded-full"
                    onClick={() => handleEscalate(content.id)}
                  >
                    Escalate
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="text-[10px] h-7 px-2 rounded-full"
                    onClick={() => handleRemove(content.id)}
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
