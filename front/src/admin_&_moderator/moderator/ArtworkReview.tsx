import React, { useState, useEffect } from "react";
import { mockArtworks } from "@/components/admin_&_moderator/data/mockData";
import { Artwork } from "@/components/admin_&_moderator/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, AlertTriangle, Flag, MessageSquare, Eye, Search, Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { exportToCSV, searchItems } from "@/lib/utils";

const ArtworkReview = () => {
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworks);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");

  // Filter artworks based on status and search term
  const filteredPendingArtworks = artworks.filter(artwork => {
    // First filter by approval status
    const isPending = !artwork.isApproved;
    if (!isPending) return false;
    
    // Then filter by search term if present
    if (searchTerm) {
      return (
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return true;
  });

  const filteredReportedArtworks = artworks.filter(artwork => {
    // First filter by report status
    const isReported = artwork.isReported;
    if (!isReported) return false;
    
    // Then filter by search term if present
    if (searchTerm) {
      return (
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return true;
  });

  // Artwork actions
  const approveArtwork = (artworkId: string) => {
    setArtworks(artworks.map(artwork => 
      artwork.id === artworkId ? { ...artwork, isApproved: true } : artwork
    ));
    toast.success("Artwork approved successfully");
  };

  const rejectArtwork = (artworkId: string) => {
    setArtworks(artworks.map(artwork => 
      artwork.id === artworkId ? { ...artwork, isApproved: false } : artwork
    ));
    toast.success("Artwork rejected successfully");
  };

  const viewArtworkDetails = (artworkId: string) => {
    const artwork = artworks.find(a => a.id === artworkId);
    if (artwork) {
      setSelectedArtwork(artwork);
      setReviewNote("");
      setDialogOpen(true);
    }
  };

  const handleSubmitReview = () => {
    if (selectedArtwork) {
      // In a real app, you'd submit this to an API
      toast.success(`Review submitted for ${selectedArtwork.title}`);
      setDialogOpen(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is applied instantly as the user types
  };

  const handleExport = () => {
    const artworksToExport = activeTab === "pending" 
      ? filteredPendingArtworks 
      : filteredReportedArtworks;
    
    const dataToExport = artworksToExport.map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist.name,
      price: artwork.price,
      description: artwork.description.substring(0, 100) + (artwork.description.length > 100 ? '...' : ''),
      categories: artwork.categories.join(', '),
      created: artwork.createdAt.toLocaleDateString(),
      status: artwork.isApproved ? 'Approved' : 'Pending',
      reported: artwork.isReported ? 'Yes' : 'No'
    }));

    exportToCSV(dataToExport, `${activeTab}_artworks_review.csv`);
    toast.success(`${activeTab === "pending" ? "Pending" : "Reported"} artworks exported successfully`);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Artwork Review</h2>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="secondary" type="submit">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </form>
        
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          Export {activeTab === "pending" ? "Pending" : "Reported"}
        </Button>
      </div>
      
      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-4">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="reported">Reported</TabsTrigger>
        </TabsList>

        {/* Pending Review Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Artworks Pending Review</CardTitle>
              <CardDescription>
                New artworks awaiting moderator approval
                {filteredPendingArtworks.length > 0 && ` · ${filteredPendingArtworks.length} artworks`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPendingArtworks.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No artworks pending review</p>
              ) : (
                <div className="artwork-grid">
                  {filteredPendingArtworks.map((artwork) => (
                    <div key={artwork.id} className="artwork-card">
                      <img src={artwork.imageUrl} alt={artwork.title} />
                      <div className="p-3">
                        <h3 className="font-medium mb-1">{artwork.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">by {artwork.artist.name}</p>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{artwork.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => approveArtwork(artwork.id)}
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0"
                              onClick={() => rejectArtwork(artwork.id)}
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => viewArtworkDetails(artwork.id)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reported Artworks Tab */}
        <TabsContent value="reported">
          <Card>
            <CardHeader>
              <CardTitle>Reported Artworks</CardTitle>
              <CardDescription>
                Artworks flagged by users for review
                {filteredReportedArtworks.length > 0 && ` · ${filteredReportedArtworks.length} artworks`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredReportedArtworks.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No reported artworks</p>
              ) : (
                <div className="artwork-grid">
                  {filteredReportedArtworks.map((artwork) => (
                    <div key={artwork.id} className="artwork-card">
                      <div className="relative">
                        <img src={artwork.imageUrl} alt={artwork.title} />
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Flag className="h-3 w-3" /> Reported
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium mb-1">{artwork.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">by {artwork.artist.name}</p>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{artwork.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <AlertTriangle className="h-3 w-3 mr-1 text-red-500" /> 
                            2 reports
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => viewArtworkDetails(artwork.id)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Artwork Review Dialog */}
      {selectedArtwork && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Review Artwork</DialogTitle>
              <DialogDescription>
                {selectedArtwork.isReported 
                  ? "This artwork has been reported and requires moderation."
                  : "Review this artwork for approval or rejection."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="rounded-md overflow-hidden mb-3">
                  <img 
                    src={selectedArtwork.imageUrl} 
                    alt={selectedArtwork.title} 
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={selectedArtwork.artist.avatar} alt={selectedArtwork.artist.name} />
                    <AvatarFallback>{selectedArtwork.artist.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{selectedArtwork.artist.name}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">{selectedArtwork.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{selectedArtwork.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-muted-foreground">Price:</span> ${selectedArtwork.price}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span> {selectedArtwork.createdAt.toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Categories:</span> {selectedArtwork.categories.join(", ")}
                  </div>
                </div>
                {selectedArtwork.isReported && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-md">
                    <div className="flex items-center gap-1 text-red-600 font-medium mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Report Reasons</span>
                    </div>
                    <p className="text-xs text-red-600">
                      This artwork appears to contain inappropriate content that violates our community guidelines.
                    </p>
                  </div>
                )}
                <div className="mb-3">
                  <label className="text-sm font-medium">Moderation Notes:</label>
                  <Textarea 
                    placeholder="Add your review notes here..."
                    className="mt-1"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => approveArtwork(selectedArtwork.id)}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </Button>
                <Button 
                  variant="outline"
                  className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600"
                  onClick={() => rejectArtwork(selectedArtwork.id)}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
              <Button onClick={handleSubmitReview}>Submit Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ArtworkReview;
