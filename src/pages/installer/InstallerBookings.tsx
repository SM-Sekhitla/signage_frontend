import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBookingsWithRelations, updateBooking } from '@/lib/localStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, ExternalLink, Eye, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import InstallerSidebar from '@/components/installer/InstallerSidebar';
import { BookingsCalendarView } from '@/components/installer/BookingCalendarView';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function InstallerBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth/login'); return; }
    loadBookings();
  }, [user]);

  const loadBookings = () => {
    if (!user) return;
    setBookings(getBookingsWithRelations({ installer_id: user.id }));
    setLoading(false);
  };

  const handleStatusUpdate = (bookingId: string, status: 'accepted' | 'declined') => {
    const { error } = updateBooking(bookingId, { status });
    if (error) { toast.error(error); return; }
    toast.success(`Booking ${status}`);
    loadBookings();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = { pending: 'secondary', accepted: 'default', declined: 'destructive', completed: 'outline', cancelled: 'outline' };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-background flex">
      <InstallerSidebar />
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/installer/dashboard')}><ArrowLeft className="h-5 w-5" /></Button>
            <h1 className="text-2xl font-bold">Booking Requests</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Bookings</CardTitle>
              <BookingsCalendarView bookings={bookings} trigger={<Button variant="outline" className="gap-2"><Calendar className="h-4 w-4" />View Calendar</Button>} />
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No booking requests yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project</TableHead>
                        <TableHead className="hidden md:table-cell">Client</TableHead>
                        <TableHead className="hidden lg:table-cell">Address</TableHead>
                        <TableHead className="hidden md:table-cell">Dates</TableHead>
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
                              <p className="text-xs text-muted-foreground truncate max-w-[200px] md:hidden">{booking.client?.full_name}</p>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div>
                              <p className="font-medium">{booking.client?.full_name}</p>
                              {booking.client?.contact_number && <p className="text-xs text-muted-foreground">{booking.client.contact_number}</p>}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell"><p className="text-sm">{booking.address || '-'}</p></TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-sm">
                              {booking.start_date ? format(new Date(booking.start_date), 'PP') : '-'}
                              {booking.end_date && ` - ${format(new Date(booking.end_date), 'PP')}`}
                            </p>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            <Sheet>
                              <SheetTrigger asChild><Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button></SheetTrigger>
                              <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                                <SheetHeader><SheetTitle>{booking.project_title}</SheetTitle></SheetHeader>
                                <div className="space-y-6 mt-6">
                                  <div><p className="text-sm font-medium text-muted-foreground">Client</p><p className="font-medium">{booking.client?.full_name}</p></div>
                                  <div><p className="text-sm font-medium text-muted-foreground">Address</p><p>{booking.address || '-'}</p></div>
                                  {booking.project_description && <div><p className="text-sm font-medium text-muted-foreground">Description</p><p className="text-sm">{booking.project_description}</p></div>}
                                  <div><p className="text-sm font-medium text-muted-foreground">Dates</p><p className="text-sm">{booking.start_date ? format(new Date(booking.start_date), 'PPP') : '-'}{booking.end_date && ` - ${format(new Date(booking.end_date), 'PPP')}`}</p></div>
                                  <div><p className="text-sm font-medium text-muted-foreground mb-2">Status</p>{getStatusBadge(booking.status)}</div>
                                  {booking.status === 'pending' && (
                                    <div className="flex gap-3 pt-4 border-t">
                                      <Button className="flex-1" onClick={() => handleStatusUpdate(booking.id, 'accepted')}>Accept</Button>
                                      <Button variant="outline" className="flex-1" onClick={() => handleStatusUpdate(booking.id, 'declined')}>Decline</Button>
                                    </div>
                                  )}
                                </div>
                              </SheetContent>
                            </Sheet>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'pending' ? (
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleStatusUpdate(booking.id, 'accepted')}>Accept</Button>
                                <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(booking.id, 'declined')}>Decline</Button>
                              </div>
                            ) : <span className="text-sm text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
