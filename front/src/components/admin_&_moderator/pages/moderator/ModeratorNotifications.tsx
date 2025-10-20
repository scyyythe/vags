import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "system" | "user" | "report" | "alert";
  status: "unread" | "read" | "archived";
  createdAt: string;
  relatedId?: string;
}

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const mockNotifications: Notification[] = [
  {
    id: "notif1",
    title: "New Report: Inappropriate Content",
    message: "A new report has been submitted for artwork 'Dark Shadows'. Please review as soon as possible.",
    type: "report",
    status: "unread",
    createdAt: "2023-06-22T10:30:00",
    relatedId: "art12345",
  },
  {
    id: "notif2",
    title: "User Warning Issued",
    message: "You issued a warning to user @creative456 for harassment. The warning has been successfully delivered.",
    type: "user",
    status: "unread",
    createdAt: "2023-06-22T09:15:00",
    relatedId: "user456",
  },
  {
    id: "notif3",
    title: "Content Removed Automatically",
    message: "The system has automatically removed a comment from post #5678 due to prohibited language.",
    type: "system",
    status: "read",
    createdAt: "2023-06-21T15:45:00",
    relatedId: "comment789",
  },
  {
    id: "notif4",
    title: "High Priority: Copyright Strike",
    message: "A DMCA takedown notice has been received for artwork 'Blue Waves'. Immediate action required.",
    type: "alert",
    status: "unread",
    createdAt: "2023-06-21T14:20:00",
    relatedId: "art56789",
  },
  {
    id: "notif5",
    title: "Multiple Reports for User",
    message: "User @pixelmaster has received 5 reports in the last 24 hours. Please investigate their recent activity.",
    type: "report",
    status: "read",
    createdAt: "2023-06-20T11:10:00",
    relatedId: "user789",
  },
  {
    id: "notif6",
    title: "System Maintenance Complete",
    message: "The scheduled maintenance has been completed successfully. All moderation tools are now fully operational.",
    type: "system",
    status: "archived",
    createdAt: "2023-06-19T09:30:00",
  },
];

const ModeratorNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"inbox" | "archived">("inbox");
  const [type, setType] = useState<"all" | Notification["type"]>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  const handleCreateNotification = (data: z.infer<typeof formSchema>) => {
    const newNotification: Notification = {
      id: `notif${notifications.length + 1}`,
      title: data.title,
      message: data.message,
      type: "system",
      status: "unread",
      createdAt: new Date().toISOString(),
    };

    setNotifications([newNotification, ...notifications]);
    toast.success("System notification created", { closeButton: true });
    setCreateDialogOpen(false);
    form.reset();
  };

  const handleViewNotification = (notification: Notification) => {
    const updatedNotifications = notifications.map(n => {
      if (n.id === notification.id && n.status === "unread") {
        return { ...n, status: "read" as const };
      }
      return n;
    }) as Notification[];
    setNotifications(updatedNotifications);
    setSelectedNotification(notification);
    setViewDialogOpen(true);
  };

  const handleArchiveNotification = (id: string) => {
    const updatedNotifications = notifications.map(n => {
      if (n.id === id) {
        return { ...n, status: "archived" as const };
      }
      return n;
    }) as Notification[];
    setNotifications(updatedNotifications);
    toast.success("Notification archived", { closeButton: true });
    setViewDialogOpen(false);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(n => {
      if (n.status === "unread") {
        return { ...n, status: "read" as const };
      }
      return n;
    }) as Notification[];
    setNotifications(updatedNotifications);
    toast.success("All notifications marked as read", { closeButton: true });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notifications.filter((n) => {
      const matchesView = view === "archived" ? n.status === "archived" : n.status !== "archived";
      const matchesType = type === "all" || n.type === type;
      const matchesQuery = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
      return matchesView && matchesType && matchesQuery;
    });
  }, [notifications, searchQuery, view, type]);
  
  const unreadCount = notifications.filter(n => n.status === "unread").length;
  const hasUnreadInFiltered = filteredNotifications.some(n => n.status === "unread");

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "system":
        return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case "user":
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case "report":
        return <div className="w-2 h-2 bg-amber-500 rounded-full"></div>;
      case "alert":
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-md font-bold">Notifications</h1>
          <p className="text-[10px] text-muted-foreground">
            View and manage system and user notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="text-[10px] rounded-full h-8"
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Notification
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Badge className="bg-red-600 text-[10px]">{unreadCount}</Badge>
          <span className="text-xs font-medium">Unread Notifications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-8 rounded-full h-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{fontSize:"10px"}}
            />
          </div>
          <div className="w-40">
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger className="h-8 rounded-full" style={{ fontSize: "10px" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[10px]">All types</SelectItem>
                <SelectItem value="system" className="text-[10px]">System</SelectItem>
                <SelectItem value="user" className="text-[10px]">User</SelectItem>
                <SelectItem value="report" className="text-[10px]">Report</SelectItem>
                <SelectItem value="alert" className="text-[10px]">Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={view} onValueChange={(v) => setView(v as any)}>
              <SelectTrigger className="h-8 rounded-full" style={{ fontSize: "10px" }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inbox" className="text-[10px]">Inbox</SelectItem>
                <SelectItem value="archived" className="text-[10px]">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs">Notification Center</CardTitle>
              <CardDescription className="text-[11px]">
                Recent system messages and alerts
              </CardDescription>
            </div>
            <div>
              {hasUnreadInFiltered ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] border-none hover:bg-muted/50 rounded-full h-7"
                  onClick={() => {
                    const ids = filteredNotifications.map(n => n.id);
                    setNotifications(prev => prev.map(n => ids.includes(n.id) && n.status === "unread" ? { ...n, status: "read" as const } : n));
                    toast.success("Marked all as read", { closeButton: true });
                  }}
                >
                  Mark All as Read
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] border-none hover:bg-muted/50 rounded-full h-7"
                  onClick={() => {
                    const ids = filteredNotifications.map(n => n.id);
                    setNotifications(prev => prev.map(n => ids.includes(n.id) && n.status === "read" ? { ...n, status: "unread" as const } : n));
                    toast.success("Marked all as unread", { closeButton: true });
                  }}
                >
                  Mark All as Unread
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length > 0 ? (
            <div className="max-h-[65vh] overflow-auto space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-md p-3 hover:bg-muted/50 ${
                    notification.status === "unread" ? "bg-muted/70 border-l-4 border-l-red-600" : "bg-transparent"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notification.type)}
                      <h3 className={`text-[11px] ${notification.status === "unread" ? "font-semibold" : ""}`}>
                        {notification.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDateTime(notification.createdAt)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Notification actions">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="text-[10px]" onClick={() => handleViewNotification(notification)}>View details</DropdownMenuItem>
                          {! (notification.status === "read") ? (
                            <DropdownMenuItem className="text-[10px]" onClick={() => setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: "read" } as Notification : n))}>Mark as read</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-[10px]" onClick={() => setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: "unread" } as Notification : n))}>Mark as unread</DropdownMenuItem>
                          )}
                          {notification.status !== "archived" ? (
                            <DropdownMenuItem className="text-[10px] text-destructive" onClick={() => handleArchiveNotification(notification.id)}>Archive</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-[10px]" onClick={() => setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, status: "read" } as Notification : n))}>Unarchive</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {notification.relatedId && (
                            <DropdownMenuItem className="text-[10px]" onClick={() => toast.success("Opening related content", { closeButton: true })}>View related content</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No notifications found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? "Try adjusting your search terms" : "You're all caught up!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm">Create System Notification</DialogTitle>
            <DialogDescription className="text-[11px]">
              Create a new notification to be sent to all moderators
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(handleCreateNotification)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Notification Title</FormLabel>
                    <FormControl>
                      <Input className="text-xs rounded-full h-8" placeholder="Enter notification title" style={{fontSize:"10px"}} {...field} />
                    </FormControl>
                    <FormMessage className="rounded-full h-8 text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Message</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full h-24 p-2 text-[10px] border rounded-md"
                        placeholder="Enter notification message"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      This message will be visible to all system moderators.
                    </FormDescription>
                    <FormMessage className="text-2xs" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full h-8"
                  onClick={() => setCreateDialogOpen(false)}
                  style={{fontSize:"10px"}}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="rounded-full h-8" style={{fontSize:"10px"}}>
                  Create Notification
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {selectedNotification?.title}
            </DialogTitle>
            {selectedNotification && (
              <DialogDescription className="text-[11px] flex justify-between">
                <span>
                  {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)} Notification
                </span>
                <span className="text-[10px]">
                  {formatDateTime(selectedNotification.createdAt)}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-3 rounded-md">
                <p className="text-xs">{selectedNotification.message}</p>
              </div>

              {selectedNotification.relatedId && (
                <div>
                  <p className="text-[11px] text-muted-foreground">
                    Reference ID: {selectedNotification.relatedId}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-8"
                  onClick={() => handleArchiveNotification(selectedNotification.id)}
                  style={{fontSize:"10px"}}
                >
                  Archive
                </Button>
                {selectedNotification.relatedId && (
                  <Button
                    size="sm"
                    className="rounded-full h-8"
                    style={{fontSize:"10px"}}
                    onClick={() => {
                      toast.success("Opening related content", { closeButton: true });
                      setViewDialogOpen(false);
                    }}
                  >
                    View Related Content
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModeratorNotifications;
