"use client";

import { useState, useMemo } from "react";
import { useItinerary, useUIState } from "@/lib/store";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: string;
  status: string;
  date: Date;
}

export function CalendarTab() {
  const { itinerary } = useItinerary();
  const { setDetailViewItem } = useUIState();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Convert itinerary items to calendar events
  const events = useMemo(() => {
    const calendarEvents: CalendarEvent[] = [];

    itinerary.forEach(day => {
      day.items.forEach(item => {
        try {
          const date = parseISO(day.date);
          calendarEvents.push({
            id: item.id,
            title: item.title,
            time: item.time,
            type: item.type,
            status: item.status,
            date: date
          });
        } catch (e) {
          // Skip invalid dates
        }
      });
    });

    return calendarEvents;
  }, [itinerary]);

  // Get calendar days for current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  }, [selectedDate, events]);

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();
  const isSelected = (date: Date) => selectedDate ? isSameDay(date, selectedDate) : false;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'booked': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'idea': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      flight: '✈️',
      train: '🚆',
      hotel: '🏨',
      food: '🍽️',
      sightseeing: '🏛️',
      activity: '🎯',
      transport: '🚗'
    };
    return icons[type.toLowerCase()] || '📍';
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {events.length} event{events.length !== 1 ? 's' : ''} scheduled
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <div className="border rounded-xl p-6 bg-background">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDate(day);
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[100px] p-2 rounded-lg border transition-all",
                    "hover:border-primary/50 hover:shadow-sm",
                    "flex flex-col items-start",
                    isCurrentMonth(day) ? "bg-card" : "bg-muted/20 text-muted-foreground",
                    isToday(day) && "border-primary border-2 font-semibold",
                    isSelected(day) && "bg-primary/5 border-primary",
                    !isCurrentMonth(day) && "opacity-50"
                  )}
                >
                  <span className={cn(
                    "text-sm mb-1",
                    isToday(day) && "text-primary font-bold"
                  )}>
                    {format(day, 'd')}
                  </span>

                  {hasEvents && (
                    <div className="w-full space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded truncate border",
                            getStatusColor(event.status)
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailViewItem(itinerary
                              .flatMap(d => d.items)
                              .find(i => i.id === event.id) || null
                            );
                          }}
                        >
                          {getTypeIcon(event.type)} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1.5">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="border rounded-xl p-6 bg-background h-fit">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
              </h3>
              {selectedDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {selectedDate && selectedDateEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No events scheduled</p>
              </div>
            )}

            {selectedDate && selectedDateEvents.length > 0 && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {selectedDateEvents
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(event => (
                    <button
                      key={event.id}
                      onClick={() => {
                        const item = itinerary
                          .flatMap(d => d.items)
                          .find(i => i.id === event.id);
                        if (item) setDetailViewItem(item);
                      }}
                      className="w-full text-left p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl mt-1">
                          {getTypeIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium truncate">{event.title}</h4>
                            <Badge variant="outline" className={cn("text-xs", getStatusColor(event.status))}>
                              {event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
