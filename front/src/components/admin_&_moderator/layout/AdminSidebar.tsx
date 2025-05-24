import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  User,
  Settings,
  Shield,
  Bell,
  Cog,
  FileCheck,
  Calendar,
  Search,
  Users,
  LayoutDashboard,
} from "lucide-react";
import Logo from "@/components/user_dashboard/navbar/Logo";

type AdminSidebarProps = {
  role: "admin" | "moderator";
};

export function AdminSidebar({ role }: AdminSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Check if the sidebar is collapsed based on the state
  const isCollapsed = state === "collapsed";

  const adminItems = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Platform Config", url: "/admin/config", icon: Cog },
    { title: "Analytics", url: "/admin/analytics", icon: Search },
    { title: "Security", url: "/admin/security", icon: Shield },
  ];

  const moderatorItems = [
    { title: "Dashboard", url: "/moderator", icon: LayoutDashboard },
    { title: "Reports", url: "/moderator/reports", icon: FileCheck },
    { title: "Content Review", url: "/moderator/content", icon: Search },
    { title: "User Moderation", url: "/moderator/users", icon: Users },
    { title: "Notifications", url: "/moderator/notifications", icon: Bell },
  ];

  const items = role === "admin" ? adminItems : moderatorItems;

  const isActive = (path: string) => currentPath === path;
  const isExpanded = items.some((i) => isActive(i.url));
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-muted text-primary font-medium"
      : "hover:bg-muted/50";

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-60"} transition-all duration-300`}
      collapsible="icon"
    >
      <div className="flex justify-center p-4">
        <Logo />
        {/* <svg 
          viewBox="0 0 24 24"
          className={`h-8 w-8 logo-icon ${isCollapsed ? "mx-auto" : ""}`}
          fill="red"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M22.672 7.991L13 2.28a2.276 2.276 0 0 0-2 0L1.328 7.991A2.275 2.275 0 0 0 0 10v0a2.276 2.276 0 0 0 2.272 2.273h.004L11 13l8.724-.727h.004A2.276 2.276 0 0 0 22 10v0a2.275 2.275 0 0 0-.672-2.009z" />
          <path d="M2.5 13v3.5a3.5 3.5 0 0 0 7 0v-2.31l-6.004-.501A1.913 1.913 0 0 1 2.5 13z" />
          <path d="M12 22a1 1 0 0 1-1-1v-6.927l-1.5-.125v5.29a1 1 0 1 1-2 0v-5.415l-1.5-.125v2.302a1.5 1.5 0 0 1-3 0v-2.447a3.93 3.93 0 0 0 3.404-3.86l8.592.735v7.943a3 3 0 0 1-2.996 2.999l-2.79.002A.912.912 0 0 1 12 22z" />
          <path d="M14.5 13v3.5a3.5 3.5 0 0 0 7 0v-2.31l-6.004-.501A1.913 1.913 0 0 1 14.5 13z" />
        </svg> */}
      </div>

      {!isCollapsed && (
        <div className="text-center mb-6">
          <p className="text-xs font-semibold">
            {role === "admin" ? "Admin Panel" : "Moderator Panel"}
          </p>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs">
            {isCollapsed ? "" : "MANAGEMENT"}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span className="text-xs">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
