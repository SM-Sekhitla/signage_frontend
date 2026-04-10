import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  isWithinInterval,
  isBefore,
  isAfter
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface BookingCalendarProps {
  mode?: "single" | "range";
  selected?: Date | DateRange;
  onSelect?: (date: Date | DateRange | undefined) => void;
  disabled?: (date: Date) => boolean;
  unavailableDates?: Date[];
  className?: string;
}

export function BookingCalendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  unavailableDates = [],
  className,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isDateDisabled = (date: Date): boolean => {
    if (disabled?.(date)) return true;
    return unavailableDates.some(d => isSameDay(d, date));
  };

  const isDateSelected = (date: Date): boolean => {
    if (mode === "single") {
      return selected ? isSameDay(date, selected as Date) : false;
    }
    const range = selected as DateRange | undefined;
    if (!range?.from) return false;
    if (range.from && !range.to) return isSameDay(date, range.from);
    if (range.from && range.to) {
      return isSameDay(date, range.from) || isSameDay(date, range.to);
    }
    return false;
  };

  const isInRange = (date: Date): boolean => {
    if (mode !== "range") return false;
    const range = selected as DateRange | undefined;
    if (!range?.from || !range?.to) return false;
    return isWithinInterval(date, { start: range.from, end: range.to }) && 
           !isSameDay(date, range.from) && 
           !isSameDay(date, range.to);
  };

  const isRangeStart = (date: Date): boolean => {
    if (mode !== "range") return false;
    const range = selected as DateRange | undefined;
    return range?.from ? isSameDay(date, range.from) : false;
  };

  const isRangeEnd = (date: Date): boolean => {
    if (mode !== "range") return false;
    const range = selected as DateRange | undefined;
    return range?.to ? isSameDay(date, range.to) : false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    if (mode === "single") {
      onSelect?.(date);
    } else {
      const range = selected as DateRange | undefined;
      if (!range?.from) {
        onSelect?.({ from: date, to: undefined });
      } else if (range.from && !range.to) {
        if (isBefore(date, range.from)) {
          onSelect?.({ from: date, to: range.from });
        } else {
          onSelect?.({ from: range.from, to: date });
        }
      } else {
        onSelect?.({ from: date, to: undefined });
      }
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, idx) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isDisabled = isDateDisabled(date);
          const isSelected = isDateSelected(date);
          const inRange = isInRange(date);
          const rangeStart = isRangeStart(date);
          const rangeEnd = isRangeEnd(date);
          const isToday = isSameDay(date, new Date());

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(date)}
              disabled={isDisabled}
              className={cn(
                "relative aspect-square min-h-[36px] md:min-h-[44px] lg:min-h-[52px] p-1 border-b border-r border-border transition-colors",
                "flex flex-col items-center justify-start text-sm",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                isCurrentMonth && !isDisabled && "hover:bg-accent/50 cursor-pointer",
                isDisabled && "opacity-40 cursor-not-allowed bg-muted/50 line-through",
                isToday && "font-bold",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                inRange && "bg-primary/20",
                rangeStart && "rounded-l-md",
                rangeEnd && "rounded-r-md",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              <span className={cn(
                "w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full text-xs md:text-sm",
                isSelected && "bg-primary text-primary-foreground",
                isToday && !isSelected && "border-2 border-primary"
              )}>
                {format(date, "d")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
