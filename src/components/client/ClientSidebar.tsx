import { useState } from "react";
import { Home, Users, Calendar, History, Menu } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Dashboard", icon: Home, path: "/client/dashboard" },
  { label: "Find Installers", icon: Users, path: "/installers" },
  { label: "My Bookings", icon: Calendar, path: "/client/bookings" },
  { label: "History", icon: History, path: "/client/history" },
];

export function ClientSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContentInner = () => (
    <>
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Client Portal</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Navigation
          </p>
        </div>
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 px-4 py-2 h-auto",
                isActive(item.path)
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleNavClick(item.path)}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b px-4 py-3 flex items-center justify-between">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <SidebarContentInner />
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-semibold">Client Portal</span>
        <div className="w-10" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-card border-r min-h-screen flex-col">
        <SidebarContentInner />
      </aside>
    </>
  );
}