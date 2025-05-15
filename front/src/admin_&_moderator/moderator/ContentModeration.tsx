import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Image, AlertTriangle, CheckCircle, XCircle, Shield, Search, Eye } from "lucide-react";
import { toast } from "sonner";

// Mock content for moderation
const mockContentQueue = [
  {
    id: "artwork-001",
    type: "artwork",
    title: "Abstract Emotions",
    thumbnail: "https://placehold.co/300x200",
    artist: {
      name: "Emma Thompson",
      avatar: "",
    },
    submittedAt: new Date(Date.now() - 3600000 * 2),
    contentFlags: ["nudity"],
    autoModScore: 82,
    status: "pending",
    aiInsights: "Potential partial nudity detected. Medium confidence level.",
  },
  {
    id: "artwork-002",
    type: "artwork",
    title: "Urban Decay",
    thumbnail: "https://placehold.co/300x200",
    artist: {
      name: "Michael Chen",
      avatar: "",
    },
    submittedAt: new Date(Date.now() - 3600000 * 5),
    contentFlags: ["violence"],
    autoModScore: 65,
    status: "pending",
    aiInsights: "Possible depiction of urban violence. Low confidence level.",
  },
  {
    id: "artwork-003",
    type: "artwork",
    title: "Digital Revolution",
    thumbnail: "https://placehold.co/300x200",
    artist: {
      name: "Sarah Johnson",
      avatar: "",
    },
    submittedAt: new Date(Date.now() - 3600000 * 10),
    contentFlags: [],
    autoModScore: 95,
    status: "pending",
    aiInsights: "No content policy violations detected.",
  },
  {
    id: "comment-001",
    type: "comment",
    title: "Comment on 'Sunset Boulevard'",
    content: "This artwork is completely derivative and lacks any originality. The artist should learn basic skills before charging money for this garbage.",
    author: {
      name: "Anonymous User",
      avatar: "",
    },
    submittedAt: new Date(Date.now() - 3600000 * 3),
    contentFlags: ["harassment"],
    autoModScore: 45,
    status: "pending",
    aiInsights: "Potential harassment detected. Comment contains negative language about the artist.",
  },
  {
    id: "comment-002",
    type: "comment",
    title: "Comment on 'Digital Revolution'",
    content: "Absolutely stunning work! The use of color and composition is masterful. I'd love to see more of your digital art in the upcoming exhibition.",
    author: {
      name: "James Wilson",
      avatar: "",
    },
    submittedAt: new Date(Date.now() - 3600000 * 8),
    contentFlags: [],
    autoModScore: 98,
    status: "approved",
    aiInsights: "Positive comment with no content violations detected.",
  },
  {
    id: "bio-001",
    type: "bio",
    title: "Artist Bio Update",
    content: "Award-winning digital artist specializing in cyberpunk aesthetics. Visit my website at www.example.com to see more of my work and purchase prints.",
    author: {
      name: "Alex Rodriguez",
      avatar: "",
    },
    submittedAt: new Date(Date.now() - 3600000 * 12),
    contentFlags: ["external_link"],
    autoModScore: 75,
    status: "pending",
    aiInsights: "External link detected. Verify if commercial content is allowed in artist bios.",
  }
];

// Mock auto-moderation rules
const mockAutoModRules = [
  {
    id: "rule-001",
    name: "Explicit Content Filter",
    description: "Flags artwork containing explicit adult content",
    severity: "high",
    action: "flag",
    isEnabled: true,
    triggerCount: 87
  },
  {
    id: "rule-002",
    name: "Spam Comment Filter",
    description: "Detects and flags spam comments with external links",
    severity: "medium",
    action: "flag",
    isEnabled: true,
    triggerCount: 125
  },
  {
    id: "rule-003",
    name: "Harassment Detection",
    description: "Identifies potential harassment in comments and messages",
    severity: "high",
    action: "flag",
    isEnabled: true,
    triggerCount: 34
  },
  {
    id: "rule-004",
    name: "Violent Content Filter",
    description: "Flags content depicting graphic violence",
    severity: "medium",
    action: "flag",
    isEnabled: true,
    triggerCount: 19
  },
  {
    id: "rule-005",
    name: "Copyright Infringement Detection",
    description: "Uses image matching to detect potential copyright violations",
    severity: "medium",
    action: "block",
    isEnabled: false,
    triggerCount: 0
  }
];

const ContentModeration = () => {
  const [selectedType, setSelectedType] = useState("all");
  const [selectedFlag, setSelectedFlag] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [activeTab, setActiveTab] = useState("queue");

  const handleApproveContent = (id: string) => {
    toast.success(`Content ${id} approved`);
  };

  const handleRejectContent = (id: string) => {
    if (!moderationNote.trim() && selectedContent) {
      toast.error("Please add a moderation note explaining the rejection");
      return;
    }
    toast.success(`Content ${id} rejected`);
    setSelectedContent(null);
    setModerationNote("");
  };

  const handleToggleRule = (ruleId: string, isEnabled: boolean) => {
    toast.success(`Rule ${ruleId} ${isEnabled ? 'enabled' : 'disabled'}`);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "artwork":
        return <Image className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "bio":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700";
    if (score >= 50) return "text-amber-700";
    return "text-red-700";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const filteredContent = mockContentQueue.filter(item => {
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesFlag = selectedFlag === "all" || 
                       (selectedFlag === "none" ? item.contentFlags.length === 0 : 
                       item.contentFlags.includes(selectedFlag));
    const matchesSearch = searchTerm === "" || 
                         item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesFlag && matchesSearch;
  });

  const selectedContentDetails = selectedContent 
    ? mockContentQueue.find(c => c.id === selectedContent)
    : null;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Content Moderation</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="queue">Moderation Queue</TabsTrigger>
          <TabsTrigger value="rules">Auto-Moderation</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Moderation Queue Tab */}
        <TabsContent value="queue">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="grid w-[180px] gap-1.5">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="content-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="artwork">Artwork</SelectItem>
                    <SelectItem value="comment">Comment</SelectItem>
                    <SelectItem value="bio">Bio/Profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid w-[180px] gap-1.5">
                <Label htmlFor="flag">Content Flag</Label>
                <Select value={selectedFlag} onValueChange={setSelectedFlag}>
                  <SelectTrigger id="flag">
                    <SelectValue placeholder="All Flags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flags</SelectItem>
                    <SelectItem value="none">No Flags</SelectItem>
                    <SelectItem value="nudity">Nudity</SelectItem>
                    <SelectItem value="violence">Violence</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="external_link">External Links</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="secondary" type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Content Review Queue
                  </CardTitle>
                  <CardDescription>Review and moderate flagged content</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredContent.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Content</TableHead>
                            <TableHead>Flags</TableHead>
                            <TableHead>AI Score</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContent.map((item) => (
                            <TableRow key={item.id} className={selectedContent === item.id ? "bg-muted/50" : ""}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getContentTypeIcon(item.type)}
                                  <span className="capitalize">{item.type}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {item.type === "artwork" && (
                                    <div className="h-10 w-10 rounded bg-secondary overflow-hidden">
                                      <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                                    </div>
                                  )}
                                  <div className="max-w-[200px] truncate">
                                    <div className="font-medium">{item.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                      by {item.author ? item.author.name : item.artist.name}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {item.contentFlags.length > 0 ? (
                                    item.contentFlags.map((flag, index) => (
                                      <Badge key={index} variant="outline" className="capitalize">
                                        {flag.replace(/_/g, ' ')}
                                      </Badge>
                                    ))
                                  ) : (
                                    <Badge variant="outline">None</Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={`font-medium ${getScoreColor(item.autoModScore)}`}>
                                  {item.autoModScore}%
                                </div>
                                <Progress 
                                  value={item.autoModScore} 
                                  className={`h-1 mt-1 ${getScoreProgressColor(item.autoModScore)}`} 
                                />
                              </TableCell>
                              <TableCell>{item.submittedAt.toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  {item.status === "pending" && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleApproveContent(item.id)}
                                        title="Approve Content"
                                      >
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleRejectContent(item.id)}
                                        title="Reject Content"
                                      >
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => setSelectedContent(item.id)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex h-[200px] flex-col items-center justify-center text-center">
                      <Shield className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No Content Matches Filters</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Content Details</CardTitle>
                  <CardDescription>
                    {selectedContentDetails 
                      ? `${selectedContentDetails.type.charAt(0).toUpperCase() + selectedContentDetails.type.slice(1)} Details` 
                      : "Select content to view details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedContentDetails ? (
                    <div className="space-y-4">
                      {selectedContentDetails.type === "artwork" && (
                        <div className="aspect-w-16 aspect-h-9 bg-secondary rounded-md overflow-hidden">
                          <img 
                            src={selectedContentDetails.thumbnail} 
                            alt={selectedContentDetails.title} 
                            className="object-cover w-full h-full"
                          />
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-lg font-medium">{selectedContentDetails.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {selectedContentDetails.author ? selectedContentDetails.author.name : selectedContentDetails.artist.name}
                        </p>
                      </div>
                      
                      {selectedContentDetails.content && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Content</h4>
                          <p className="mt-1 text-sm p-3 bg-muted rounded-md">
                            {selectedContentDetails.content}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">AI Moderation Insights</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`font-medium ${getScoreColor(selectedContentDetails.autoModScore)}`}>
                            {selectedContentDetails.autoModScore}%
                          </div>
                          <Progress 
                            value={selectedContentDetails.autoModScore} 
                            className={`h-2 flex-1 ${getScoreProgressColor(selectedContentDetails.autoModScore)}`} 
                          />
                        </div>
                        <p className="mt-2 text-sm p-3 bg-muted rounded-md">
                          {selectedContentDetails.aiInsights}
                        </p>
                      </div>
                      
                      {selectedContentDetails.contentFlags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Content Flags</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedContentDetails.contentFlags.map((flag, index) => (
                              <Badge key={index} variant="outline" className="capitalize">
                                {flag.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Submission Date</h4>
                        <p>{selectedContentDetails.submittedAt.toLocaleString()}</p>
                      </div>
                      
                      {selectedContentDetails.status === "pending" && (
                        <div className="space-y-2 pt-4">
                          <Label htmlFor="moderation-note">Moderation Note</Label>
                          <Textarea 
                            id="moderation-note" 
                            placeholder="Add notes about moderation decision..."
                            value={moderationNote}
                            onChange={(e) => setModerationNote(e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="default"
                              className="w-full" 
                              onClick={() => handleApproveContent(selectedContentDetails.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              onClick={() => handleRejectContent(selectedContentDetails.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-[300px] flex-col items-center justify-center text-center">
                      <Shield className="h-10 w-10 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No Content Selected</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Select an item from the list to view its details
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Auto-Moderation Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Moderation Rules</CardTitle>
              <CardDescription>Configure automated content moderation settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Times Triggered</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockAutoModRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.description}</TableCell>
                        <TableCell>
                          <Badge variant={
                            rule.severity === "high" ? "destructive" : 
                            rule.severity === "medium" ? "secondary" : "outline"
                          }>
                            {rule.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{rule.action}</TableCell>
                        <TableCell>{rule.triggerCount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch 
                              checked={rule.isEnabled} 
                              onCheckedChange={(checked) => handleToggleRule(rule.id, checked)} 
                            />
                            <span>{rule.isEnabled ? "Enabled" : "Disabled"}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end mt-4">
                <p className="text-xs text-muted-foreground">
                  Note: Rule changes may take up to 5 minutes to take effect
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderation Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Activity</CardTitle>
              <CardDescription>History of your moderation actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Content Type</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{new Date().toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      </TableCell>
                      <TableCell>Comment</TableCell>
                      <TableCell>Comment on "Urban Flow" by James Wilson</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{new Date(Date.now() - 3600000 * 2).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                      </TableCell>
                      <TableCell>Artwork</TableCell>
                      <TableCell>"Nude Study #4" by Anonymous Artist - Explicit content</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{new Date(Date.now() - 3600000 * 5).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      </TableCell>
                      <TableCell>Bio</TableCell>
                      <TableCell>Artist bio update for Sarah Johnson</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>{new Date(Date.now() - 3600000 * 24).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-800">Modified</Badge>
                      </TableCell>
                      <TableCell>Comment</TableCell>
                      <TableCell>Edited comment by Emma Thompson to remove external links</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentModeration;
