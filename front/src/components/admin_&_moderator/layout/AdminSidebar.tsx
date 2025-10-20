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
import Logo from "@/components/admin_&_moderator/layout/Logo";

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
      </div>

      {!isCollapsed && (
        <div className="text-center mb-6">
          <p className="text-[13px] font-semibold">
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
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="data-[active=true]:bg-red-500/10 data-[active=true]:font-medium data-[active=true]:text-black-600"
                  >
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
