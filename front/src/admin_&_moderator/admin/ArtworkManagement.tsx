import React, { useState, useEffect } from "react";
import { mockArtworks } from "@/components/admin_&_moderator/data/mockData";
import { Artwork } from "@/components/admin_&_moderator/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Star, Trash2, Undo, Eye, Search, Filter, Download } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { exportToCSV, searchItems } from "@/lib/utils";

const ArtworkManagement = () => {
  const [artworks, setArtworks] = useState<Artwork[]>(mockArtworks);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletedArtworks, setDeletedArtworks] = useState<Artwork[]>([]);

  // Filter artworks based on search term and status filter
  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch = 
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === "approved") {
      matchesStatus = artwork.isApproved;
    } else if (filterStatus === "pending") {
      matchesStatus = !artwork.isApproved;
    } else if (filterStatus === "featured") {
      matchesStatus = artwork.isFeatured;
    } else if (filterStatus === "reported") {
      matchesStatus = artwork.isReported;
    }
    
    return matchesSearch && matchesStatus;
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

  const featureArtwork = (artworkId: string) => {
    setArtworks(artworks.map(artwork => 
      artwork.id === artworkId ? { ...artwork, isFeatured: true } : artwork
    ));
    toast.success("Artwork featured successfully");
  };

  const unfeatureArtwork = (artworkId: string) => {
    setArtworks(artworks.map(artwork => 
      artwork.id === artworkId ? { ...artwork, isFeatured: false } : artwork
    ));
    toast.success("Artwork unfeatured successfully");
  };

  const deleteArtwork = (artworkId: string) => {
    const artworkToDelete = artworks.find(artwork => artwork.id === artworkId);
    if (artworkToDelete) {
      setDeletedArtworks([...deletedArtworks, artworkToDelete]);
      setArtworks(artworks.filter(artwork => artwork.id !== artworkId));
      toast.success("Artwork deleted successfully");
    }
  };

  const restoreArtwork = (artwork: Artwork) => {
    setArtworks([...artworks, artwork]);
    setDeletedArtworks(deletedArtworks.filter(a => a.id !== artwork.id));
    toast.success("Artwork restored successfully");
  };

  const viewArtworkDetails = (artworkId: string) => {
    const artwork = artworks.find(a => a.id === artworkId);
    if (artwork) {
      setSelectedArtwork(artwork);
      setDialogOpen(true);
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled automatically through the filteredArtworks variable
  };

  // Export artwork data
  const handleExportArtworks = () => {
    const dataToExport = filteredArtworks.map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist.name,
      price: artwork.price,
      status: artwork.isApproved ? 'Approved' : 'Pending',
      featured: artwork.isFeatured ? 'Yes' : 'No',
      reported: artwork.isReported ? 'Yes' : 'No',
      created: artwork.createdAt.toLocaleDateString(),
      categories: artwork.categories.join(', '),
      likes: artwork.likes,
      views: artwork.views
    }));

    exportToCSV(dataToExport, 'artworks_management.csv');
    toast.success("Artworks exported successfully");
  };

  // Export deleted artworks
  const handleExportDeletedArtworks = () => {
    const dataToExport = deletedArtworks.map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist.name,
      price: artwork.price,
      status: artwork.isApproved ? 'Approved' : 'Pending',
      created: artwork.createdAt.toLocaleDateString(),
      categories: artwork.categories.join(', ')
    }));

    exportToCSV(dataToExport, 'deleted_artworks.csv');
    toast.success("Deleted artworks exported successfully");
  };

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Artwork Management</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manage Artworks</CardTitle>
          <CardDescription>View and manage all gallery artworks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search artworks..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="all">All Artworks</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleExportArtworks}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artwork</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArtworks.map((artwork) => (
                  <TableRow key={artwork.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded bg-secondary overflow-hidden">
                          <img src={artwork.imageUrl} alt={artwork.title} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-medium">{artwork.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={artwork.artist.avatar} alt={artwork.artist.name} />
                          <AvatarFallback>{artwork.artist.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {artwork.artist.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {artwork.isApproved ? (
                        <Badge variant="default" className="bg-green-500">Approved</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                      {artwork.isFeatured && (
                        <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Featured
                        </Badge>
                      )}
                      {artwork.isReported && (
                        <Badge variant="destructive" className="ml-2">
                          Reported
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>${artwork.price?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!artwork.isApproved && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => approveArtwork(artwork.id)}
                            title="Approve Artwork"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        
                        {artwork.isApproved && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => rejectArtwork(artwork.id)}
                            title="Reject Artwork"
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        
                        {artwork.isFeatured ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => unfeatureArtwork(artwork.id)}
                            title="Unfeature Artwork"
                          >
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => featureArtwork(artwork.id)}
                            title="Feature Artwork"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => deleteArtwork(artwork.id)}
                          title="Delete Artwork"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => viewArtworkDetails(artwork.id)}
                          title="View Artwork Details"
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

      {/* Deleted Artworks Card */}
      {deletedArtworks.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Deleted Artworks</CardTitle>
              <CardDescription>Recently deleted artworks that can be restored</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleExportDeletedArtworks}
            >
              <Download className="h-4 w-4" />
              Export Deleted
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artwork</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedArtworks.map((artwork) => (
                    <TableRow key={artwork.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded bg-secondary overflow-hidden">
                            <img src={artwork.imageUrl} alt={artwork.title} className="h-full w-full object-cover" />
                          </div>
                          <span className="font-medium">{artwork.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{artwork.artist.name}</TableCell>
                      <TableCell>${artwork.price?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => restoreArtwork(artwork)}
                        >
                          <Undo className="h-4 w-4" />
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Artwork Details Dialog */}
      {selectedArtwork && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Artwork Details</DialogTitle>
              <DialogDescription>
                Comprehensive information about this artwork.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-48 w-full rounded-md bg-secondary overflow-hidden">
                <img 
                  src={selectedArtwork.imageUrl} 
                  alt={selectedArtwork.title} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="text-center w-full">
                <h3 className="text-xl font-medium">{selectedArtwork.title}</h3>
                <p className="text-sm text-muted-foreground">By {selectedArtwork.artist.name}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm">{selectedArtwork.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Price</h4>
                  <p className="text-sm">${selectedArtwork.price?.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Created</h4>
                  <p className="text-sm">{selectedArtwork.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Likes</h4>
                  <p className="text-sm">{selectedArtwork.likes}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Views</h4>
                  <p className="text-sm">{selectedArtwork.views}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArtwork.categories.map((category, index) => (
                    <Badge key={index} variant="outline">{category}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArtwork.isApproved ? (
                    <Badge variant="default" className="bg-green-500">Approved</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  {selectedArtwork.isFeatured && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      Featured
                    </Badge>
                  )}
                  {selectedArtwork.isReported && (
                    <Badge variant="destructive">Reported</Badge>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ArtworkManagement;
