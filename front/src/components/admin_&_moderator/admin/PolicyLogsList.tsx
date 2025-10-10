import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Trash2, Edit, Download, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface PolicyLog {
  id: string;
  title: string;
  type: string;
  content: string;
  status: "draft" | "saved";
  version?: number;
  createdAt: string;
  updatedAt: string;
}

interface PolicyLogsListProps {
  logs: PolicyLog[];
  onView: (log: PolicyLog) => void;
  onDelete: (id: string) => void;
  onEdit?: (log: PolicyLog) => void;
  onDownloadPDF?: (log: PolicyLog) => void;
}

export const PolicyLogsList = ({ logs, onView, onDelete, onEdit, onDownloadPDF }: PolicyLogsListProps) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logs based on status and search query
  const filteredLogs = logs.filter(log => {
    const matchesStatus = 
      filterStatus === "all" || 
      log.status === filterStatus;
    
    const matchesSearch = 
      searchQuery === "" ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Sort logs: drafts first, then by updated date (newest first)
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (a.status === "draft" && b.status === "saved") return -1;
    if (a.status === "saved" && b.status === "draft") return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Policy Logs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters and Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search by title, type, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
          
          <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as "all" | "draft" | "saved")}>
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="all" className="text-[10px]">
                All ({logs.length})
              </TabsTrigger>
              <TabsTrigger value="draft" className="text-[10px]">
                Drafts ({logs.filter(l => l.status === "draft").length})
              </TabsTrigger>
              <TabsTrigger value="saved" className="text-[10px]">
                Published ({logs.filter(l => l.status === "saved").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        {filteredLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            {searchQuery ? "No results found" : "No policies or drafts saved yet"}
          </p>
        ) : (
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Title</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Version</TableHead>
              <TableHead className="text-xs">Updated</TableHead>
              <TableHead className="text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-[10px] font-medium">{log.type}</TableCell>
                <TableCell className="text-[10px]">{log.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={log.status === "saved" ? "default" : "secondary"}
                    className="text-[9px]"
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[10px]">
                  {log.status === "saved" ? `v${log.version || 1}` : "-"}
                </TableCell>
                <TableCell className="text-[10px]">{log.updatedAt}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onView(log)}
                      title="View"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {log.status === "draft" && onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onEdit(log)}
                        title="Edit Draft"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {log.status === "saved" && onDownloadPDF && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onDownloadPDF(log)}
                        title="Download PDF"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={() => onDelete(log.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
};
