import React, { useState } from "react";
import { useAuth } from "@/components/admin_&_moderator/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Image, Calendar, Gavel, Megaphone, ShieldAlert, MessageSquare, Settings, BarChart, LogOut, User, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ThemeToggle } from "@/components/admin_&_moderator/theme/theme-toggle";

interface DashboardLayoutProps {
  requiredRole: "admin" | "moderator";
  children?: React.ReactNode;
}

export const DashboardLayout = ({ requiredRole, children }: DashboardLayoutProps) => {
  const { currentUser, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get mock user data based on role if no current user
  const mockAdminUser = {
    id: "admin-123",
    name: "Admin User",
    email: "admin@artgallery.com",
    role: "admin" as const,
    avatar: "",
    isActive: true
  };
  
  const mockModeratorUser = {
    id: "mod-123",
    name: "Moderator User",
    email: "mod@artgallery.com",
    role: "moderator" as const,
    avatar: "",
    isActive: true
  };
  
  // Use either the logged in user or a mock user based on required role
  const user = currentUser || (requiredRole === "admin" ? mockAdminUser : mockModeratorUser);

  // Define sidebar items based on role
  const getMenuItems = () => {
    const adminItems = [
      { title: "Dashboard", icon: LayoutDashboard, url: "/admin" },
      { title: "User Management", icon: Users, url: "/admin/users" },
      { title: "Artwork Management", icon: Image, url: "/admin/artworks" },
      { title: "Exhibitions", icon: Calendar, url: "/admin/exhibitions" },
      { title: "Exhibition Themes", icon: Calendar, url: "/admin/exhibitions/themes" },
      { title: "Virtual Rooms", icon: Calendar, url: "/admin/exhibitions/rooms" },
      { title: "Exhibition Analytics", icon: BarChart, url: "/admin/exhibitions/analytics" },
      { title: "Bids & Transactions", icon: Gavel, url: "/admin/bids" },
      { title: "Moderator Oversight", icon: Megaphone, url: "/admin/moderators" },
      { title: "Reports & Issues", icon: ShieldAlert, url: "/admin/reports" },
      { title: "Content Moderation", icon: MessageSquare, url: "/admin/content" },
      { title: "System Settings", icon: Settings, url: "/admin/settings" },
      { title: "Analytics", icon: BarChart, url: "/admin/analytics" },
    ];

    const moderatorItems = [
      { title: "Dashboard", icon: LayoutDashboard, url: "/moderator" },
      { title: "Bid Review", icon: Gavel, url: "/moderator/bids" },
      { title: "User Activity", icon: Users, url: "/moderator/users" },
      { title: "Reports & Issues", icon: ShieldAlert, url: "/moderator/reports" },
      { title: "Artwork Review", icon: Image, url: "/moderator/artworks" },
      { title: "Content Moderation", icon: MessageSquare, url: "/moderator/content" },
      { title: "Exhibition Support", icon: Calendar, url: "/moderator/exhibitions" },
      { title: "Activity Logs", icon: BarChart, url: "/moderator/logs" },
    ];

    return requiredRole === "admin" ? adminItems : moderatorItems;
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const notificationItems = [
    {
      id: '1',
      title: 'New artwork submitted',
      time: '5 min ago',
      read: false
    },
    {
      id: '2',
      title: 'Report requires attention',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      title: 'System maintenance scheduled',
      time: 'Yesterday',
      read: true
    }
  ];

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* Sidebar - Fixed position with z-index */}
      <div 
        className={cn(
          "h-screen border-r transition-all duration-300 ease-in-out fixed z-10",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <Sidebar variant="sidebar" collapsible={isCollapsed ? "icon" : "none"} className="border-r transition-all duration-300 scrollbar-hide">
          <SidebarHeader className="flex items-center gap-2 px-4 py-2">
            <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
              <User size={24} className="text-gallery-red" />
              {!isCollapsed && (
                <span className="text-xl font-bold">{requiredRole === "admin" ? "Admin" : "Moderator"}</span>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className={cn("ml-auto", isCollapsed && "mx-auto")}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </SidebarHeader>
          <SidebarContent className="scrollbar-hide">
            <SidebarGroup>
              <SidebarGroupLabel>{!isCollapsed && "Navigation"}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getMenuItems().map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                        <a href={item.url} className="flex items-center gap-3">
                          <item.icon size={18} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>{!isCollapsed && "Profile"}</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className={cn("p-4", isCollapsed && "p-2 flex flex-col items-center")}>
                  <div className={cn("flex items-center gap-3 mb-3", isCollapsed && "flex-col mb-2")}>
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size={isCollapsed ? "icon" : "sm"} 
                    className={cn("w-full flex items-center gap-2", isCollapsed && "w-auto")}
                    onClick={() => window.location.href = "/"}
                  >
                    <LogOut size={16} />
                    {!isCollapsed && <span>Back to Home</span>}
                  </Button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>

      {/* Main content - Use absolute positioning to prevent horizontal movement */}
      <div className={cn(
        "absolute top-0 bottom-0 right-0 flex flex-col no-scrollbar overflow-hidden",
        isCollapsed ? "left-16" : "left-64"
      )}>
        <header className="bg-background border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            Art Gallery {requiredRole === "admin" ? "Admin" : "Moderator"} Dashboard
          </h1>
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notificationItems.map((item) => (
                  <DropdownMenuItem key={item.id} className={cn(
                    "flex flex-col items-start py-2",
                    !item.read && "bg-muted/50"
                  )}>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-sm">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Profile */}
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" align="end">
                <div className="flex justify-between space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center pt-2">
                      <span className={cn(
                        "h-2 w-2 rounded-full mr-2",
                        user.isActive ? "bg-green-500" : "bg-red-500"
                      )}></span>
                      <span className="text-xs text-muted-foreground">
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="/settings">Settings</a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full ml-2" onClick={() => window.location.href = "/"}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </header>
        <main className="flex-1 overflow-auto no-scrollbar p-6 w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
