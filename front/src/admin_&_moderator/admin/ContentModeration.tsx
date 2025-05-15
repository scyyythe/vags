import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockArtworks, mockComments, mockUsers } from "@/components/admin_&_moderator/data/mockData";
import { Artwork, Comment, User } from "@/components/admin_&_moderator/types";
import { Eye, MessageSquare, AlertTriangle, Check, XCircle, Image, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

// Extended mock comments with more examples
const extendedMockComments = [
  ...mockComments,
  {
    id: "4",
    user: mockUsers[2],
    content: "This is absolutely breathtaking work!",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    artworkId: mockArtworks[1].id,
    isDeleted: false,
    isFlagged: false,
  },
  {
    id: "5",
    user: mockUsers[3],
    content: "I'm not sure I understand the meaning behind this piece.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    artworkId: mockArtworks[2].id,
    isDeleted: false,
    isFlagged: true,
    flagReason: "Potentially negative review",
  },
  {
    id: "6",
    user: mockUsers[2],
    content: "[This comment was removed for violating community guidelines]",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    artworkId: mockArtworks[3].id,
    isDeleted: true,
    isFlagged: true,
    flagReason: "Harassment",
  },
];

// Mock flagged keywords for auto-moderation
const mockFlaggedKeywords = [
  { id: "1", word: "spam", category: "spam", severity: "medium", autoAction: "flag" },
  { id: "2", word: "hate", category: "harassment", severity: "high", autoAction: "remove" },
  { id: "3", word: "scam", category: "fraud", severity: "high", autoAction: "flag" },
  { id: "4", word: "ugly", category: "negative", severity: "low", autoAction: "flag" },
  { id: "5", word: "offensive", category: "harassment", severity: "medium", autoAction: "flag" },
];

// Mock community guidelines
const mockCommunityGuidelines = {
  text: `# Art Gallery Community Guidelines

1. **Respect Original Work**
   - Only upload artwork you created or have permission to share
   - Properly attribute inspirations and sources
   - Do not plagiarize or copy others' work

2. **Respectful Communication**
   - Be constructive in feedback and comments
   - No hate speech, harassment, or bullying
   - Respect diverse perspectives and artistic styles

3. **Appropriate Content**
   - Mark mature content appropriately
   - No explicit sexual content
   - No violent or graphic imagery without proper warnings

4. **No Commercial Spam**
   - Don't use comments for advertising
   - No unsolicited links to external sales pages
   - No scams or fraudulent activity`,
  lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) // 30 days ago
};

const ContentModeration = () => {
  const [selectedTab, setSelectedTab] = useState("comments");
  const [flaggedOnly, setFlaggedOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingGuidelines, setEditingGuidelines] = useState(false);
  const [guidelinesText, setGuidelinesText] = useState(mockCommunityGuidelines.text);
  const [newKeyword, setNewKeyword] = useState("");
  const [newKeywordCategory, setNewKeywordCategory] = useState("spam");
  const [newKeywordSeverity, setNewKeywordSeverity] = useState("medium");
  const [newKeywordAction, setNewKeywordAction] = useState("flag");

  const handleApproveComment = (id: string) => {
    toast.success(`Comment #${id} has been approved`);
  };

  const handleRemoveComment = (id: string) => {
    toast.success(`Comment #${id} has been removed`);
  };

  const handleSaveGuidelines = () => {
    toast.success("Community guidelines updated successfully");
    setEditingGuidelines(false);
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      toast.error("Keyword cannot be empty");
      return;
    }
    toast.success(`New keyword "${newKeyword}" added to moderation list`);
    setNewKeyword("");
  };

  const handleRemoveKeyword = (id: string) => {
    toast.success("Keyword removed from moderation list");
  };

  const filteredComments = extendedMockComments.filter(comment => {
    const matchesFlagged = flaggedOnly ? comment.isFlagged : true;
    const matchesDeleted = showDeleted ? true : !comment.isDeleted;
    const matchesSearch = searchTerm === "" || 
                         comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFlagged && matchesDeleted && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Content Moderation</h2>
      
      <Tabs defaultValue="comments" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="keywords">Auto-Moderation</TabsTrigger>
          <TabsTrigger value="guidelines">Community Guidelines</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>Comment Moderation</CardTitle>
                  <CardDescription>Review and moderate user comments</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={flaggedOnly}
                      onChange={(e) => setFlaggedOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Flagged Only
                  </Label>
                  <Label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showDeleted}
                      onChange={(e) => setShowDeleted(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Show Deleted
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex w-full max-w-sm items-center space-x-2">
                <Input
                  placeholder="Search comments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="secondary" type="submit">Search</Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Artwork</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map((comment) => (
                      <TableRow key={comment.id} className={comment.isDeleted ? "bg-muted/40" : ""}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={comment.user.avatar} />
                              <AvatarFallback>{comment.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            {comment.user.name}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate">
                            {comment.content}
                            {comment.isFlagged && !comment.isDeleted && (
                              <Badge variant="outline" className="ml-2 bg-amber-100">
                                <AlertTriangle className="mr-1 h-3 w-3 text-amber-600" />
                                Flagged
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {comment.createdAt.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {mockArtworks.find(art => art.id === comment.artworkId)?.title || "Unknown Artwork"}
                        </TableCell>
                        <TableCell>
                          {comment.isDeleted ? (
                            <Badge variant="destructive">Deleted</Badge>
                          ) : (
                            <Badge variant={comment.isFlagged ? "outline" : "default"}>
                              {comment.isFlagged ? "Flagged" : "Active"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {!comment.isDeleted && (
                              <>
                                {comment.isFlagged && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleApproveComment(comment.id)}
                                    title="Approve Comment"
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                )}
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleRemoveComment(comment.id)}
                                  title="Remove Comment"
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              title="View Context"
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
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Moderation Keywords</CardTitle>
              <CardDescription>Manage flagged keywords and automatic moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="font-medium mb-3">Add New Keyword</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                  <div className="md:col-span-2">
                    <Label htmlFor="keyword">Keyword or Phrase</Label>
                    <Input
                      id="keyword"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Enter keyword to flag"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newKeywordCategory} onValueChange={setNewKeywordCategory}>
                      <SelectTrigger id="category" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spam">Spam</SelectItem>
                        <SelectItem value="harassment">Harassment</SelectItem>
                        <SelectItem value="fraud">Fraud</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={newKeywordSeverity} onValueChange={setNewKeywordSeverity}>
                      <SelectTrigger id="severity" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="action">Auto Action</Label>
                    <Select value={newKeywordAction} onValueChange={setNewKeywordAction}>
                      <SelectTrigger id="action" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flag">Flag Only</SelectItem>
                        <SelectItem value="remove">Auto Remove</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="mt-4" onClick={handleAddKeyword}>Add Keyword</Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Auto Action</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFlaggedKeywords.map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell className="font-medium">{keyword.word}</TableCell>
                        <TableCell className="capitalize">{keyword.category}</TableCell>
                        <TableCell>
                          <Badge variant={
                            keyword.severity === "low" ? "outline" :
                            keyword.severity === "medium" ? "secondary" : "destructive"
                          }>
                            {keyword.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={keyword.autoAction === "flag" ? "outline" : "destructive"}>
                            {keyword.autoAction === "flag" ? "Flag for Review" : "Auto Remove"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleRemoveKeyword(keyword.id)}
                            title="Remove Keyword"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Community Guidelines</CardTitle>
                  <CardDescription>
                    Last updated: {mockCommunityGuidelines.lastUpdated.toLocaleDateString()}
                  </CardDescription>
                </div>
                {!editingGuidelines ? (
                  <Button variant="outline" onClick={() => setEditingGuidelines(true)}>
                    Edit Guidelines
                  </Button>
                ) : (
                  <Button onClick={handleSaveGuidelines}>
                    Save Changes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingGuidelines ? (
                <Textarea 
                  value={guidelinesText}
                  onChange={(e) => setGuidelinesText(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap rounded-md bg-muted p-4">
                    {guidelinesText}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentModeration;
