import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Pencil, Trash, Search, Filter, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { exportToCSV, searchItems } from "@/lib/utils";

// Mock exhibition data for demonstration
const mockExhibitions = [
  {
    id: "ex1",
    title: "Contemporary Masters",
    curator: { id: "user1", name: "Alice Johnson" },
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-08-01"),
    status: "scheduled",
    visitors: 0,
    rooms: 4,
    artworks: 42,
    theme: "Modern Expressionism",
  },
  {
    id: "ex2",
    title: "Digital Revolution",
    curator: { id: "user2", name: "Mark Wilson" },
    startDate: new Date("2025-05-15"),
    endDate: new Date("2025-07-15"),
    status: "live",
    visitors: 1254,
    rooms: 3,
    artworks: 28,
    theme: "Digital Art & NFTs",
  },
  {
    id: "ex3",
    title: "Renaissance Revisited",
    curator: { id: "user3", name: "Sarah Thompson" },
    startDate: new Date("2025-04-01"),
    endDate: new Date("2025-05-01"),
    status: "completed",
    visitors: 4523,
    rooms: 5,
    artworks: 67,
    theme: "Classical Revival",
  },
  {
    id: "ex4",
    title: "Abstract Wonders",
    curator: { id: "user4", name: "David Brooks" },
    startDate: new Date("2025-08-01"),
    endDate: new Date("2025-09-15"),
    status: "scheduled",
    visitors: 0,
    rooms: 2,
    artworks: 31,
    theme: "Abstract Expressionism",
  },
  {
    id: "ex5",
    title: "Photography Masters",
    curator: { id: "user5", name: "Elena Rodriguez" },
    startDate: new Date("2025-05-01"),
    endDate: new Date("2025-06-01"),
    status: "completed",
    visitors: 2187,
    rooms: 3,
    artworks: 52,
    theme: "Documentary Photography",
  },
];

const ExhibitionManagement = () => {
  const [exhibitions, setExhibitions] = useState(mockExhibitions);
  const [exhibitionToDelete, setExhibitionToDelete] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Filter exhibitions based on tab, search term and status
  const filteredExhibitions = exhibitions.filter(exhibition => {
    // First, filter by tab (status)
    if (activeTab !== "all" && exhibition.status !== activeTab) {
      return false;
    }
    
    // Then filter by search term
    if (searchTerm) {
      return (
        exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exhibition.curator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exhibition.theme.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return true;
  });

  const handleDeleteExhibition = (id: string) => {
    setExhibitionToDelete(id);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    if (exhibitionToDelete) {
      setExhibitions(exhibitions.filter(exhibition => exhibition.id !== exhibitionToDelete));
      toast.success("Exhibition deleted successfully");
      setConfirmDialogOpen(false);
      setExhibitionToDelete(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is applied instantly as the user types
  };

  const handleExport = () => {
    const dataToExport = filteredExhibitions.map(exhibition => ({
      id: exhibition.id,
      title: exhibition.title,
      curator: exhibition.curator.name,
      startDate: formatDate(exhibition.startDate),
      endDate: formatDate(exhibition.endDate),
      status: exhibition.status,
      visitors: exhibition.visitors,
      rooms: exhibition.rooms,
      artworks: exhibition.artworks,
      theme: exhibition.theme
    }));

    exportToCSV(dataToExport, 'exhibitions.csv');
    toast.success("Exhibitions exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Exhibition Management</h2>
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-2">
            <Calendar size={16} />
            Create Exhibition
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exhibitions..."
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
          Export Exhibitions
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Exhibitions</TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Curator</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExhibitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No exhibitions matching the current filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExhibitions.map((exhibition) => (
                      <TableRow key={exhibition.id}>
                        <TableCell className="font-medium">{exhibition.title}</TableCell>
                        <TableCell>{exhibition.curator.name}</TableCell>
                        <TableCell>
                          {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            exhibition.status === "live" ? "default" :
                            exhibition.status === "scheduled" ? "outline" :
                            "secondary"
                          }>
                            {exhibition.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{exhibition.visitors.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost">
                              <Eye size={16} />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteExhibition(exhibition.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-muted-foreground">
                Showing {filteredExhibitions.length} exhibitions
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Similar content for other tabs, filtered by status */}
        <TabsContent value="live" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Curator</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExhibitions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No live exhibitions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExhibitions.map((exhibition) => (
                      <TableRow key={exhibition.id}>
                        <TableCell className="font-medium">{exhibition.title}</TableCell>
                        <TableCell>{exhibition.curator.name}</TableCell>
                        <TableCell>
                          {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
                        </TableCell>
                        <TableCell>
                          <Badge>live</Badge>
                        </TableCell>
                        <TableCell>{exhibition.visitors.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="ghost">
                              <Eye size={16} />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Pencil size={16} />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteExhibition(exhibition.id)}
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar content for scheduled and completed tabs */}
        <TabsContent value="scheduled" className="mt-4">
          {/* Similar to above but filtered for scheduled exhibitions */}
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          {/* Similar to above but filtered for completed exhibitions */}
        </TabsContent>
      </Tabs>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exhibition? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Exhibition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExhibitionManagement;
