import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBookingsWithRelations } from '@/lib/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClientSidebar } from '@/components/client/ClientSidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ClientHistory() {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setBookings(getBookingsWithRelations({ client_id: user.id }));
      setLoading(false);
    }
  }, [user]);

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <ClientSidebar />
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4">
            <div className="flex-1"><h1 className="text-lg font-semibold">Booking History</h1></div>
            <div className="flex items-center gap-4">
              <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {loading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Loading history...</p></div>
          ) : bookings.length === 0 ? (
            <Card><CardContent className="py-8 text-center"><p className="text-muted-foreground">No booking history yet</p></CardContent></Card>
          ) : (
            <Card>
              <CardHeader><CardTitle>All Bookings</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead className="hidden md:table-cell">Installer</TableHead>
                        <TableHead className="hidden sm:table-cell">Province</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Requested</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.project_title}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{booking.installer?.company_name || booking.installer?.full_name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{booking.installer?.company_name || booking.installer?.full_name}</TableCell>
                          <TableCell className="hidden sm:table-cell">{booking.province || '-'}</TableCell>
                          <TableCell>{new Date(booking.start_date).toLocaleDateString()}</TableCell>
                          <TableCell><Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge></TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{new Date(booking.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
