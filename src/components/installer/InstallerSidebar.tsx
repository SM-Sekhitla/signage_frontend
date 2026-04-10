import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile } from '@/lib/localStorage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  Image as ImageIcon, 
  User,
  ChevronDown,
  Mail,
  FileText,
  Phone,
  Settings,
  Menu,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function InstallerSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(getProfile(user.id));
    }
  }, [user]);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/installer/dashboard' },
    { label: 'Bookings', icon: Calendar, path: '/installer/bookings' },
    { label: 'Portfolio', icon: ImageIcon, path: '/installer/portfolio' },
    { label: 'Profile', icon: User, path: '/installer/profile' },
  ];

  const appsItems = [
    { label: 'Messages', icon: Mail, path: '/installer/messages' },
    { label: 'Documents', icon: FileText, path: '/installer/documents' },
    { label: 'Contact', icon: Phone, path: '/installer/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b">
        <div className="flex flex-col items-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.profile_photo || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold text-sm">{profile?.full_name || user?.email?.split('@')[0] || 'User'}</p>
            <ChevronDown className="w-4 h-4 text-muted-foreground mx-auto mt-1" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">MENU</p>
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
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Button>
          ))}
        </nav>

        <div className="px-4 mb-2 mt-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">APPS</p>
        </div>
        <nav className="space-y-1 px-2">
          {appsItems.map((item) => (
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
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>

      <div className="p-2 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-2 h-auto text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          onClick={() => handleNavClick('/installer/settings')}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b px-4 py-3 flex items-center justify-between">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        <span className="font-semibold">Installer Portal</span>
        <div className="w-10" />
      </div>

      <aside className="hidden md:flex w-64 bg-card border-r min-h-screen flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
