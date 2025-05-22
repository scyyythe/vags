import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

type AdminLayoutProps = {
  children: React.ReactNode;
  role: "admin" | "moderator";
};

export function AdminLayout({ children, role }: AdminLayoutProps) {
  const mockUser = {
    name: role === "admin" ? "Admin User" : "Moderator User",
    email: `${role}@example.com`,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar role={role} />
        <div className="flex-1 flex flex-col">
          <AdminHeader role={role} user={mockUser} />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
