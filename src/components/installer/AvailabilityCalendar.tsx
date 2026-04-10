import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getInstallerAvailability, setInstallerAvailability } from '@/lib/localStorage';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AvailabilityCalendar() {
  const { user } = useAuth();
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const avail = getInstallerAvailability(user.id);
      setUnavailableDates(avail.filter(a => !a.is_available).map(a => new Date(a.date)));
    }
  }, [user]);

  const handleToggleDate = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = format(date, 'yyyy-MM-dd');
    const isUnavailable = unavailableDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);

    if (isUnavailable) {
      setUnavailableDates(unavailableDates.filter(d => format(d, 'yyyy-MM-dd') !== dateStr));
    } else {
      setUnavailableDates([...unavailableDates, date]);
    }
  };

  const handleSave = () => {
    if (!user) return;
    setLoading(true);
    const dates = unavailableDates.map(d => ({ date: format(d, 'yyyy-MM-dd'), is_available: false }));
    setInstallerAvailability(user.id, dates);
    toast.success('Availability updated successfully');
    setLoading(false);
  };

  const modifiers = { unavailable: unavailableDates };
  const modifiersStyles = {
    unavailable: { textDecoration: 'line-through', color: 'hsl(var(--muted-foreground))', opacity: 0.5 }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Your Availability</CardTitle>
        <CardDescription>Click dates to mark them as unavailable. Crossed-out dates won't be shown to clients.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={undefined}
            onSelect={handleToggleDate}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{unavailableDates.length} date(s) marked as unavailable</p>
          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Availability'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
