import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getAllProfiles, getAllRoles, getBookings, getSpecialties, createSpecialty, deleteSpecialty as deleteSpec, updateSpecialty } from '@/lib/localStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Briefcase, BarChart3 } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import SpecialtyManagement from '@/components/admin/SpecialtyManagement';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, installers: 0, clients: 0, bookings: 0 });

  useEffect(() => {
    const profiles = getAllProfiles();
    const roles = getAllRoles();
    const bookings = getBookings();
    setStats({
      totalUsers: profiles.length,
      installers: roles.filter(r => r.role === 'installer').length,
      clients: roles.filter(r => r.role === 'client').length,
      bookings: bookings.length,
    });
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4"><SidebarTrigger /><h1 className="text-2xl font-bold">Admin Dashboard</h1></div>
              <div className="flex items-center gap-4"><Button onClick={signOut} variant="outline">Sign Out</Button></div>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div><p className="text-xs text-muted-foreground">All registered users</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Installers</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.installers}</div><p className="text-xs text-muted-foreground">Active installers</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Clients</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.clients}</div><p className="text-xs text-muted-foreground">Registered clients</p></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Bookings</CardTitle><BarChart3 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.bookings}</div><p className="text-xs text-muted-foreground">All time bookings</p></CardContent></Card>
            </div>
            <div id="specialties"><SpecialtyManagement /></div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
