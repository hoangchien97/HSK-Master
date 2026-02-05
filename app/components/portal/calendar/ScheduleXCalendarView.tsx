'use client';

import { useEffect, useRef, useState } from 'react';
import { createCalendar } from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';
import { createViewDay, createViewMonthAgenda, createViewMonthGrid, createViewWeek } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, LoadingSpinner } from '@/app/components/common';
import dayjs from 'dayjs';
import type { ISchedule } from '@/app/interfaces/portal';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  calendarId?: string;
}

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
  const [calendar, setCalendar] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('month');
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize and re-render calendar when view changes
  useEffect(() => {
    if (!calendarRef.current) return;

    setIsInitializing(true);

    // Destroy previous calendar instance
    if (calendar) {
      calendar.destroy();
    }

    // Create events service plugin
    const eventsServicePlugin = createEventsServicePlugin();

    // Determine view name
    const viewName = selectedView === 'month' ? 'month-grid' : selectedView;

    // Initialize calendar
    const calendarInstance = createCalendar({
      locale: 'vi-VN',
      views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
      defaultView: viewName,
      events: [],
      plugins: [eventsServicePlugin],
      calendars: {
        class: {
          colorName: 'class',
          lightColors: {
            main: '#f87171',
            container: '#fee2e2',
            onContainer: '#991b1b',
          },
          darkColors: {
            main: '#f87171',
            onContainer: '#fef2f2',
            container: '#7f1d1d',
          },
        },
      },
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
          console.log('Range updated:', range);
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
    setIsInitializing(false);

    return () => {
      calendarInstance.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView]);

  // Update events when schedules change
  useEffect(() => {
    if (!calendar) return;

    const events: CalendarEvent[] = schedules.map(schedule => {
      // Schedule-X v4 expects ISO 8601 format: YYYY-MM-DD or YYYY-MM-DD HH:mm
      // Converting to the exact format expected by the library
      const startDate = dayjs(schedule.startTime);
      const endDate = dayjs(schedule.endTime);
      
      // Use format: 'YYYY-MM-DD HH:mm' (local time without timezone)
      const start = startDate.format('YYYY-MM-DD HH:mm');
      const end = endDate.format('YYYY-MM-DD HH:mm');

      return {
        id: schedule.id,
        title: `${schedule.title} - ${schedule.class.name}`,
        start,
        end,
        description: schedule.description,
        calendarId: 'class',
      };
    });

    // Clear existing events and add new ones
    const eventsService = calendar.eventsService;
    
    // Remove all existing events
    const existingEvents = eventsService.getAll();
    existingEvents.forEach((event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
  }, [calendar, schedules]);

  const handleToday = () => {
    if (calendar) {
      calendar.setDate(new Date().toISOString().slice(0, 10));
    }
  };

  const handlePrevious = () => {
    if (calendar) {
      const currentDate = new Date(calendar.datePickerState.selectedDate.value);
      let newDate: Date;

      if (selectedView === 'day') {
        newDate = new Date(currentDate.setDate(currentDate.getDate() - 1));
      } else if (selectedView === 'week') {
        newDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
      } else {
        newDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      }

      calendar.setDate(newDate.toISOString().slice(0, 10));
    }
  };

  const handleNext = () => {
    if (calendar) {
      const currentDate = new Date(calendar.datePickerState.selectedDate.value);
      let newDate: Date;

      if (selectedView === 'day') {
        newDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      } else if (selectedView === 'week') {
        newDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
      } else {
        newDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      }

      calendar.setDate(newDate.toISOString().slice(0, 10));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
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

      {/* Calendar Container */}
      <div className="p-4 relative min-h-[600px]">
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
