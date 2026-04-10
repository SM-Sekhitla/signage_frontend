import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO,
  isWithinInterval
} from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Booking {
  id: string;
  project_title: string;
  start_date: string;
  end_date: string | null;
  status: string;
  address: string | null;
  client?: {
    full_name: string;
    contact_number?: string;
  };
}

interface BookingsCalendarViewProps {
  bookings: Booking[];
  trigger?: React.ReactNode;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-700 border-amber-500/30',
  accepted: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30',
  declined: 'bg-red-500/20 text-red-700 border-red-500/30',
  completed: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  cancelled: 'bg-muted text-muted-foreground border-muted',
};

export function BookingsCalendarView({ bookings, trigger }: BookingsCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [open, setOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getBookingsForDate = (date: Date): Booking[] => {
    return bookings.filter(booking => {
      const startDate = parseISO(booking.start_date);
      const endDate = booking.end_date ? parseISO(booking.end_date) : startDate;
      
      return isWithinInterval(date, { start: startDate, end: endDate }) ||
             isSameDay(date, startDate) ||
             isSameDay(date, endDate);
    });
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">View Calendar</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">Bookings Calendar</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-l">
            {days.map((date, idx) => {
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isToday = isSameDay(date, new Date());
              const dayBookings = getBookingsForDate(date);

              return (
                <div
                  key={idx}
                  className={cn(
                    "min-h-[100px] p-1 border-r border-b border-border",
                    !isCurrentMonth && "bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                    isToday && "bg-primary text-primary-foreground",
                    !isCurrentMonth && "text-muted-foreground"
                  )}>
                    {format(date, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <Popover key={booking.id}>
                        <PopoverTrigger asChild>
                          <button
                            className={cn(
                              "w-full text-left text-xs px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 transition-opacity",
                              STATUS_COLORS[booking.status] || STATUS_COLORS.pending
                            )}
                          >
                            {booking.project_title}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-3" side="right" align="start">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-sm">{booking.project_title}</h4>
                              <Badge 
                                variant="secondary"
                                className={cn("text-xs", STATUS_COLORS[booking.status])}
                              >
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-1">
                              <p><span className="font-medium">Client:</span> {booking.client?.full_name || 'Unknown'}</p>
                              {booking.client?.contact_number && (
                                <p><span className="font-medium">Phone:</span> {booking.client.contact_number}</p>
                              )}
                              <p><span className="font-medium">Address:</span> {booking.address || 'Not specified'}</p>
                              <p>
                                <span className="font-medium">Dates:</span>{' '}
                                {format(parseISO(booking.start_date), 'PP')}
                                {booking.end_date && ` - ${format(parseISO(booking.end_date), 'PP')}`}
                              </p>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                    {dayBookings.length > 3 && (
                      <span className="text-xs text-muted-foreground px-1">
                        +{dayBookings.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 px-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
              <span>Accepted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30" />
              <span>Declined</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/30" />
              <span>Completed</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
