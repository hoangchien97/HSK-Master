'use client';

import 'temporal-polyfill/global';
import { useEffect, useRef, useState, useCallback } from 'react';
import { createCalendar } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';
import { createViewDay, createViewMonthAgenda, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, LoadingSpinner } from '@/app/components/common';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { ISchedule } from '@/app/interfaces/portal';

interface CalendarEvent {
  id: string;
  title: string;
  start: Temporal.ZonedDateTime;
  end: Temporal.ZonedDateTime;
  description?: string;
  calendarId?: string;
}

// Event state colors matching getEventStateColor
const EVENT_CALENDARS = {
  past: {
    colorName: 'past',
    lightColors: {
      main: '#9ca3af', // gray-400
      container: '#f3f4f6', // gray-100
      onContainer: '#4b5563', // gray-600
    },
    darkColors: {
      main: '#6b7280',
      onContainer: '#f9fafb',
      container: '#1f2937',
    },
  },
  upcoming: {
    colorName: 'upcoming',
    lightColors: {
      main: '#dc2626', // red-600
      container: '#fee2e2', // red-100
      onContainer: '#7f1d1d', // red-900
    },
    darkColors: {
      main: '#ef4444',
      onContainer: '#fef2f2',
      container: '#7f1d1d',
    },
  },
  future: {
    colorName: 'future',
    lightColors: {
      main: '#f59e0b', // amber-500
      container: '#fef3c7', // amber-100
      onContainer: '#78350f', // amber-900
    },
    darkColors: {
      main: '#fbbf24',
      onContainer: '#fefce8',
      container: '#78350f',
    },
  },
};

// Legend items
const LEGEND_ITEMS = [
  { label: 'Sắp diễn ra', color: 'bg-red-500', textColor: 'text-red-700' },
  { label: 'Tương lai', color: 'bg-amber-500', textColor: 'text-amber-700' },
  { label: 'Đã qua', color: 'bg-gray-400', textColor: 'text-gray-600' },
];

interface ScheduleXCalendarViewProps {
  schedules: ISchedule[];
  onEventClick: (schedule: ISchedule) => void;
  onEventDoubleClick: (schedule: ISchedule) => void;
  onCreateSchedule: () => void;
}

export default function ScheduleXCalendarView({
  schedules,
  onEventClick,
  onEventDoubleClick,
  onCreateSchedule,
}: ScheduleXCalendarViewProps) {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendar, setCalendar] = useState<ReturnType<typeof createCalendar> | null>(null);
  const [calendarControls, setCalendarControls] = useState<ReturnType<typeof createCalendarControlsPlugin> | null>(null);
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isInitializing, setIsInitializing] = useState(true);

  // Helper to get event state based on time
  const getEventState = useCallback((startTime: Date, endTime: Date): 'past' | 'upcoming' | 'future' => {
    const now = new Date();
    const sevenDaysFromNow = addDays(now, 7);

    if (now > endTime) return 'past';
    if (startTime < sevenDaysFromNow) return 'upcoming';
    return 'future';
  }, []);

  // Initialize and re-render calendar when view changes
  useEffect(() => {
    if (!calendarRef.current) return;

    setIsInitializing(true);

    // Destroy previous calendar instance
    if (calendar) {
      calendar.destroy();
    }

    // Create plugins
    const eventsServicePlugin = createEventsServicePlugin();
    const calendarControlsPlugin = createCalendarControlsPlugin();

    // Determine view name
    const viewName = selectedView === 'month' ? 'month-grid' : selectedView;

    // Initialize calendar with state-based colors
    const calendarInstance = createCalendar({
      locale: 'vi-VN',
      views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
      defaultView: viewName,
      events: [],
      plugins: [eventsServicePlugin, calendarControlsPlugin],
      calendars: EVENT_CALENDARS,
      callbacks: {
        onEventClick(calendarEvent) {
          const schedule = schedules.find(s => s.id === calendarEvent.id);
          if (schedule) {
            onEventClick(schedule);
          }
        },
        onEventUpdate(updatedEvent) {
          console.log('Event updated:', updatedEvent);
        },
        onRangeUpdate(range) {
          // Update current date when calendar range changes
          if (range.start) {
            const startDate = new Date(range.start.epochMilliseconds);
            setCurrentDate(startDate);
          }
        },
        onDoubleClickEvent(calendarEvent) {
          const schedule = schedules.find(s => s.id === calendarEvent.id);
          if (schedule) {
            onEventDoubleClick(schedule);
          }
        },
      },
    });

    calendarInstance.render(calendarRef.current);
    setCalendar(calendarInstance);
    setCalendarControls(calendarControlsPlugin);
    setIsInitializing(false);

    return () => {
      calendarInstance.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView]);

  // Update events when schedules change
  useEffect(() => {
    if (!calendar) return;

    // Helper to convert JS Date to Temporal.ZonedDateTime
    const dateToZonedDateTime = (date: Date): Temporal.ZonedDateTime => {
      const instant = Temporal.Instant.fromEpochMilliseconds(date.getTime());
      return instant.toZonedDateTimeISO('Asia/Ho_Chi_Minh');
    };

    const events: CalendarEvent[] = schedules.map(schedule => {
      const startDate = new Date(schedule.startTime);
      const endDate = new Date(schedule.endTime);
      const state = getEventState(startDate, endDate);

      return {
        id: schedule.id,
        title: `${schedule.title} - ${schedule.class.name}`,
        start: dateToZonedDateTime(startDate),
        end: dateToZonedDateTime(endDate),
        description: schedule.description,
        calendarId: state, // Use state as calendarId for colors
      };
    });

    // Clear existing events and add new ones using type assertion
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const eventsService = calendar.eventsService as any;

    // Remove all existing events
    const existingEvents = eventsService.getAll();
    existingEvents.forEach((event: { id: string }) => {
      eventsService.remove(event.id);
    });

    // Add new events
    events.forEach(event => {
      try {
        eventsService.add(event);
      } catch (error) {
        console.error('Error adding event to calendar:', event, error);
      }
    });
  }, [calendar, schedules, getEventState]);

  // Navigation handlers using calendar-controls plugin
  const handleToday = () => {
    if (calendarControls) {
      const today = Temporal.Now.plainDateISO();
      calendarControls.setDate(today);
      setCurrentDate(new Date());
    }
  };

  const handlePrevious = () => {
    if (calendarControls) {
      let newDate: Date;
      if (selectedView === 'day') {
        newDate = subDays(currentDate, 1);
      } else if (selectedView === 'week') {
        newDate = subWeeks(currentDate, 1);
      } else {
        newDate = subMonths(currentDate, 1);
      }

      const temporalDate = Temporal.PlainDate.from({
        year: newDate.getFullYear(),
        month: newDate.getMonth() + 1,
        day: newDate.getDate(),
      });
      calendarControls.setDate(temporalDate);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (calendarControls) {
      let newDate: Date;
      if (selectedView === 'day') {
        newDate = addDays(currentDate, 1);
      } else if (selectedView === 'week') {
        newDate = addWeeks(currentDate, 1);
      } else {
        newDate = addMonths(currentDate, 1);
      }

      const temporalDate = Temporal.PlainDate.from({
        year: newDate.getFullYear(),
        month: newDate.getMonth() + 1,
        day: newDate.getDate(),
      });
      calendarControls.setDate(temporalDate);
      setCurrentDate(newDate);
    }
  };

  // Format current date display based on view
  const getDateDisplayText = () => {
    if (selectedView === 'day') {
      return format(currentDate, "EEEE, d MMMM yyyy", { locale: vi });
    } else if (selectedView === 'week') {
      const weekStart = currentDate;
      const weekEnd = addDays(weekStart, 6);
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${format(weekStart, "d")} - ${format(weekEnd, "d MMMM yyyy", { locale: vi })}`;
      }
      return `${format(weekStart, "d MMM", { locale: vi })} - ${format(weekEnd, "d MMM yyyy", { locale: vi })}`;
    } else {
      return format(currentDate, "MMMM yyyy", { locale: vi });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleToday}
            className="px-4 py-2"
          >
            Hôm nay
          </Button>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Current Date Display */}
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {getDateDisplayText()}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('day')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedView === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setSelectedView('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedView === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setSelectedView('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                selectedView === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tháng
            </button>
          </div>

          <Button
            type="button"
            onClick={onCreateSchedule}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Thêm buổi học
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm text-gray-500 font-medium">Chú thích:</span>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className={`text-sm ${item.textColor}`}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar Container */}
      <div className="p-4 relative min-h-150">
        {isInitializing && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-gray-600 font-medium">Đang tải lịch...</p>
            </div>
          </div>
        )}
        <div ref={calendarRef} className="schedule-x-calendar" />
      </div>
    </div>
  );
}
