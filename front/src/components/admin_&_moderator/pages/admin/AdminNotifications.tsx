import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

type NotifType = "system" | "security" | "user" | "payment";

type AdminNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: NotifType;
  read?: boolean;
  archived?: boolean;
};

const MOCK_NOTIFICATIONS: AdminNotification[] = [
  { id: "1", title: "System maintenance scheduled", description: "Tonight at 11:00 PM UTC.", time: "5m ago", type: "system" },
  { id: "2", title: "New user registered", description: "Curator account pending review.", time: "12m ago", type: "user" },
  { id: "3", title: "Security log alert", description: "3 failed login attempts detected.", time: "1h ago", type: "security" },
  { id: "4", title: "Payment dispute opened", description: "Order #2043 requires attention.", time: "2h ago", type: "payment" },
  { id: "5", title: "Policy updated", description: "Privacy Policy v2.3 published.", time: "3h ago", type: "system" },
  { id: "6", title: "Moderator report", description: "Content flagged for review (ID: 8841).", time: "3h ago", type: "user" },
  { id: "7", title: "Backup completed", description: "Nightly backup finished successfully.", time: "4h ago", type: "system" },
  { id: "8", title: "High error rate", description: "API 5xx spiked above threshold.", time: "4h ago", type: "security" },
  { id: "9", title: "Payout processed", description: "Artist J. Cruz payout sent.", time: "5h ago", type: "payment" },
  { id: "10", title: "Role change requested", description: "User 1294 requested Moderator access.", time: "6h ago", type: "user" },
  { id: "11", title: "New exhibit created", description: "“Autumn Forms” pending approval.", time: "7h ago", type: "user" },
  { id: "12", title: "Terms accepted", description: "All moderators acknowledged latest terms.", time: "9h ago", type: "system" },
  { id: "13", title: "Chargeback notice", description: "Payment dispute for Order #2019.", time: "12h ago", type: "payment" },
  { id: "14", title: "Suspicious activity", description: "Unusual IP change on admin account.", time: "13h ago", type: "security" },
  { id: "15", title: "Large transaction", description: "$2,300 purchase approved.", time: "15h ago", type: "payment" },
  { id: "16", title: "Integration warning", description: "Webhook retries exceeded for Mailer.", time: "18h ago", type: "system" },
  { id: "17", title: "User appeal received", description: "Suspension appeal from user #992.", time: "20h ago", type: "user" },
  { id: "18", title: "Password policy updated", description: "Minimum length increased to 12.", time: "1d ago", type: "security" },
];

const AdminNotifications = () => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | NotifType>("all");
  const [notifications, setNotifications] = useState<AdminNotification[]>(MOCK_NOTIFICATIONS);
  const [mutedTypes, setMutedTypes] = useState<Set<NotifType>>(new Set());
  const [subscribedTypes, setSubscribedTypes] = useState<Set<NotifType>>(new Set());
  const [view, setView] = useState<"inbox" | "archived">("inbox");

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchesType = type === "all" || n.type === type;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
      const inArchive = !!n.archived;
      const archiveFilter = view === "archived" ? inArchive : !inArchive;
      const notMuted = !mutedTypes.has(n.type);
      return matchesType && matchesQuery && archiveFilter && notMuted;
    });
  }, [query, type, notifications, mutedTypes, view]);

  const hasUnread = useMemo(() => filtered.some((n) => !n.read), [filtered]);

  const typeDotClass = (t: NotifType) =>
    t === "system" ? "bg-blue-500" : t === "security" ? "bg-red-500" : t === "payment" ? "bg-purple-500" : "bg-emerald-500";

  const typeBadge = (t: NotifType) => (
    <Badge className="text-3xs" variant="secondary">
      {t.charAt(0).toUpperCase() + t.slice(1)}
    </Badge>
  );

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    toast.success("Marked as read", { closeButton: true });
  };

  const handleMarkUnread = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    toast.success("Marked as unread", { closeButton: true });
  };

  const handleArchive = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, archived: true } : n)));
    toast.success("Notification archived", { closeButton: true });
  };

  const handleUnarchive = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, archived: false } : n)));
    toast.success("Notification moved to Inbox", { closeButton: true });
  };

  const handleMuteType = (t: NotifType) => {
    setMutedTypes((prev) => new Set(prev).add(t));
    toast.success(`Muted ${t} notifications`, { closeButton: true });
  };

  const handleSubscribeType = (t: NotifType) => {
    setSubscribedTypes((prev) => {
      const next = new Set(prev);
      next.add(t);
      return next;
    });
    toast.success(`Subscribed to ${t} updates`, { closeButton: true });
  };

  const handleResolve = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    toast.success("Flag marked as resolved", { closeButton: true });
  };

  const handleNavigate = (label: string) => {
    toast.info(label, { closeButton: true });
  };

  const actionsFor = (n: AdminNotification) => {
    if (n.type === "system") {
      return (
        <>
          <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Opening system update details")}>View details</DropdownMenuItem>
          <DropdownMenuItem className="text-[10px]" onClick={() => handleSubscribeType(n.type)}>Subscribe to updates</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[10px]" onClick={() => handleMuteType(n.type)}>Mute this type</DropdownMenuItem>
        </>
      );
    }
    if (n.type === "security") {
      return (
        <>
          <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Opening security logs")}>View security logs</DropdownMenuItem>
          <DropdownMenuItem className="text-[10px]" onClick={() => handleResolve(n.id)}>Mark as resolved</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Enforcing password reset for affected users")}>Force password reset</DropdownMenuItem>
        </>
      );
    }
    if (n.type === "user") {
      return (
        <>
          <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Opening user profile")}>View user</DropdownMenuItem>
          <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Reviewing reported content")}>Review report</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Approving role change request")}>Approve role change</DropdownMenuItem>
        </>
      );
    }
    // payment
    return (
      <>
        <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Opening transaction details")}>View transaction</DropdownMenuItem>
        <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Resolving dispute")}>Resolve dispute</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-[10px]" onClick={() => handleNavigate("Issuing refund")}>Issue refund</DropdownMenuItem>
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-md font-bold">Notifications</h1>
          <p className="text-[10px] text-muted-foreground">Browse, filter, and search admin alerts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "inbox" ? "default" : "outline"}
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => setView("inbox")}
          >
            Inbox
          </Button>
          <Button
            variant={view === "archived" ? "default" : "outline"}
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => setView("archived")}
          >
            Archived
          </Button>
        </div>
      </div>

      <Card className="p-3 border-none shadow-none">
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications..."
              className="pl-7 h-8 rounded-full"
              style={{ fontSize: "10px" }}
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="w-40">
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger className="h-8 rounded-full" style={{ fontSize: "10px" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-[10px]">All types</SelectItem>
                  <SelectItem value="system" className="text-[10px]">System</SelectItem>
                  <SelectItem value="security" className="text-[10px]">Security</SelectItem>
                  <SelectItem value="user" className="text-[10px]">User</SelectItem>
                  <SelectItem value="payment" className="text-[10px]">Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasUnread ? (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] rounded-full"
                onClick={() => {
                  const ids = filtered.map((n) => n.id)
                  setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)))
                  toast.success("Marked all as read", { closeButton: true })
                }}
              >
                Mark all as read
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] rounded-full"
                onClick={() => {
                  const ids = filtered.map((n) => n.id)
                  setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read: false } : n)))
                  toast.success("Marked all as unread", { closeButton: true })
                }}
              >
                Mark all as unread
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <div className="max-h-[68vh] overflow-auto">
          {filtered.map((n) => (
            <div key={n.id} className={`px-4 py-3 border-b last:border-b-0 ${!n.read ? "bg-muted/70" : "bg-transparent"}`}>
              <div className="flex items-start gap-2">
                <span className={`mt-[3px] h-2 w-2 rounded-full ${typeDotClass(n.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium truncate">{n.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{n.time}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Notification actions">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {actionsFor(n)}
                          <DropdownMenuSeparator />
                          {!n.read ? (
                            <DropdownMenuItem className="text-[10px]" onClick={() => handleMarkRead(n.id)}>Mark as read</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-[10px]" onClick={() => handleMarkUnread(n.id)}>Mark as unread</DropdownMenuItem>
                          )}
                          {!n.archived ? (
                            <DropdownMenuItem className="text-[10px] text-destructive" onClick={() => handleArchive(n.id)}>Archive</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-[10px]" onClick={() => handleUnarchive(n.id)}>Unarchive</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <p className={`text-[11px] ${n.read ? "text-muted-foreground" : "text-foreground"}`}>{n.description}</p>
                  <div className="mt-1 text-[11px]">{typeBadge(n.type)}</div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-[11px] text-muted-foreground">No notifications found</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminNotifications;


