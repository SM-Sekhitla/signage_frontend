import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, CheckCircle } from 'lucide-react';
import { ClientSidebar } from '@/components/client/ClientSidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ClientSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Add top padding on mobile for the fixed header */}
        <div className="h-14 md:hidden" />
        
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
          <div className="flex h-14 items-center gap-4 px-4">
            <div className="flex-1 flex items-center gap-4">
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Searches</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Saved searches</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Total projects</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Find the Perfect Installer</CardTitle>
                <CardDescription>
                  Search for qualified signage installers in your area
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" size="lg" onClick={() => navigate('/installers')}>
                  Browse Installers
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Welcome to Your Dashboard!</CardTitle>
                <CardDescription>
                  Browse and connect with signage installers in your area.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Find qualified installers, request quotes, and manage your signage projects all in one place.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/installers')}>
                    Find Installers
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/client/bookings')}>
                    View My Requests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
  );
}
