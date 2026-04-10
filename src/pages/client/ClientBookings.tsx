import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBookingsWithRelations, updateBooking } from '@/lib/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ClientSidebar } from '@/components/client/ClientSidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ClientBookings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth/login'); return; }
    loadBookings();
  }, [user]);

  const loadBookings = () => {
    if (!user) return;
    setBookings(getBookingsWithRelations({ client_id: user.id }));
    setLoading(false);
  };

  const handleCancel = (bookingId: string) => {
    const { error } = updateBooking(bookingId, { status: 'cancelled' });
    if (error) { toast.error(error); return; }
    toast.success('Booking cancelled');
    loadBookings();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = { pending: 'secondary', accepted: 'default', declined: 'destructive', completed: 'outline', cancelled: 'outline' };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <ClientSidebar />
      <div className="flex-1 flex flex-col">
        <div className="h-14 md:hidden" />
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
          <div className="flex h-14 items-center gap-4 px-4">
            <div className="flex-1"><Breadcrumbs /></div>
            <div className="flex items-center gap-4">
              <Button onClick={signOut} variant="outline" size="sm">Sign Out</Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {loading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Loading bookings...</p></div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">You haven't requested any quotes yet</p>
                <Button onClick={() => navigate('/installers')}>Find Installers</Button>
              </CardContent>
            </Card>
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
                        <TableHead className="hidden lg:table-cell">Address</TableHead>
                        <TableHead className="hidden md:table-cell">Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>View</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.project_title}</p>
                              <p className="text-xs text-muted-foreground md:hidden">{booking.installer?.company_name || booking.installer?.full_name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{booking.installer?.company_name || booking.installer?.full_name}</TableCell>
                          <TableCell className="hidden lg:table-cell"><p className="text-sm truncate max-w-[200px]">{booking.address || '-'}</p></TableCell>
                          <TableCell className="hidden md:table-cell"><p className="text-sm">{format(new Date(booking.created_at), 'PP')}</p></TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            <Sheet>
                              <SheetTrigger asChild><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></SheetTrigger>
                              <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                                <SheetHeader><SheetTitle>{booking.project_title}</SheetTitle></SheetHeader>
                                <div className="space-y-6 mt-6">
                                  <div><p className="text-sm font-medium text-muted-foreground">Installer</p><p className="font-medium">{booking.installer?.company_name || booking.installer?.full_name}</p></div>
                                  <div><p className="text-sm font-medium text-muted-foreground">Address</p><p>{booking.address || '-'}</p></div>
                                  {booking.project_description && <div><p className="text-sm font-medium text-muted-foreground">Description</p><p className="text-sm">{booking.project_description}</p></div>}
                                  <div><p className="text-sm font-medium text-muted-foreground">Dates</p><p className="text-sm">{booking.start_date ? format(new Date(booking.start_date), 'PPP') : '-'}{booking.end_date && ` - ${format(new Date(booking.end_date), 'PPP')}`}</p></div>
                                  <div><p className="text-sm font-medium text-muted-foreground">Requested On</p><p className="text-sm">{format(new Date(booking.created_at), 'PPP')}</p></div>
                                  <div><p className="text-sm font-medium text-muted-foreground mb-2">Status</p>{getStatusBadge(booking.status)}</div>
                                  {booking.status === 'pending' && <Button variant="outline" className="w-full" onClick={() => handleCancel(booking.id)}>Cancel Request</Button>}
                                </div>
                              </SheetContent>
                            </Sheet>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'pending' ? <Button size="sm" variant="outline" onClick={() => handleCancel(booking.id)}>Cancel</Button> : <span className="text-sm text-muted-foreground">-</span>}
                          </TableCell>
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
