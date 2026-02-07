'use client';

import { useMemo, useCallback, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Chip, Spinner, Tabs, Tab } from '@heroui/react';
import type { ISchedule } from '@/app/interfaces/portal';
import { EventState } from '@/app/interfaces/portal/calendar';
import { getEventState } from '@/app/utils/calendar';

// Setup date-fns localizer for Vietnamese
const locales = { 'vi': vi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Vietnamese messages
const messages = {
  allDay: 'Cả ngày',
  previous: 'Trước',
  next: 'Tiếp',
  today: 'Hôm nay',
  month: 'Tháng',
  week: 'Tuần',
  day: 'Ngày',
  agenda: 'Lịch trình',
  date: 'Ngày',
  time: 'Giờ',
  event: 'Sự kiện',
  noEventsInRange: 'Không có sự kiện nào trong khoảng thời gian này.',
  showMore: (total: number) => `+${total} sự kiện`,
};

// Legend items
const LEGEND_ITEMS = [
  { label: 'Sắp diễn ra', color: 'bg-red-500' },
  { label: 'Tương lai', color: 'bg-amber-500' },
  { label: 'Đã qua', color: 'bg-gray-400' },
];

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    schedule: ISchedule;
    state: EventState;
  };
}

interface BigCalendarViewProps {
  schedules: ISchedule[];
  onEventClick: (schedule: ISchedule) => void;
  onEventDoubleClick: (schedule: ISchedule) => void;
  onCreateSchedule: () => void;
  isLoading?: boolean;
}

const VIEW_MAP: Record<string, View> = {
  day: Views.DAY,
  week: Views.WEEK,
  month: Views.MONTH,
};

export default function BigCalendarView({
  schedules,
  onEventClick,
  onEventDoubleClick,
  onCreateSchedule,
  isLoading = false,
}: BigCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  // Convert schedules to calendar events
  const events: CalendarEvent[] = useMemo(
    () =>
      schedules.map((schedule) => {
        const start = new Date(schedule.startTime);
        const end = new Date(schedule.endTime);
        const state = getEventState(start, end);

        return {
          id: schedule.id,
          title: schedule.title,
          start,
          end,
          resource: { schedule, state },
        };
      }),
    [schedules]
  );

  // Event style based on state
  const eventPropGetter = useCallback((event: CalendarEvent) => {
    const state = event.resource.state;
    let style: React.CSSProperties = {
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.8rem',
      padding: '2px 6px',
    };

    switch (state) {
      case EventState.UPCOMING:
        style = { ...style, backgroundColor: '#dc2626', color: '#fff' };
        break;
      case EventState.FUTURE:
        style = { ...style, backgroundColor: '#f59e0b', color: '#78350f' };
        break;
      case EventState.PAST:
        style = { ...style, backgroundColor: '#d1d5db', color: '#4b5563' };
        break;
    }

    return { style };
  }, []);

  // Handlers
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => onEventClick(event.resource.schedule),
    [onEventClick]
  );

  const handleDoubleClickEvent = useCallback(
    (event: CalendarEvent) => onEventDoubleClick(event.resource.schedule),
    [onEventDoubleClick]
  );

  const handleNavigate = useCallback((date: Date) => setCurrentDate(date), []);

  const handleViewChange = useCallback((view: View) => setCurrentView(view), []);

  // Date display text
  const dateDisplayText = useMemo(() => {
    if (currentView === Views.DAY) {
      return format(currentDate, "EEEE, d MMMM yyyy", { locale: vi });
    } else if (currentView === Views.WEEK) {
      return format(currentDate, "MMMM yyyy", { locale: vi });
    } else {
      return format(currentDate, "MMMM yyyy", { locale: vi });
    }
  }, [currentDate, currentView]);

  // Custom Toolbar (replaces default)
  const CustomToolbar = useCallback(() => {
    const goToToday = () => setCurrentDate(new Date());
    const goBack = () => {
      const d = new Date(currentDate);
      if (currentView === Views.DAY) d.setDate(d.getDate() - 1);
      else if (currentView === Views.WEEK) d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      setCurrentDate(d);
    };
    const goNext = () => {
      const d = new Date(currentDate);
      if (currentView === Views.DAY) d.setDate(d.getDate() + 1);
      else if (currentView === Views.WEEK) d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      setCurrentDate(d);
    };

    return (
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Button variant="bordered" size="sm" onPress={goToToday}>
            Hôm nay
          </Button>
          <div className="flex items-center gap-1">
            <Button isIconOnly variant="light" size="sm" onPress={goBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button isIconOnly variant="light" size="sm" onPress={goNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {dateDisplayText}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <Tabs
            aria-label="Chế độ xem"
            size="sm"
            variant="bordered"
            selectedKey={currentView}
            onSelectionChange={(key) => handleViewChange(VIEW_MAP[key as string] || Views.MONTH)}
          >
            <Tab key="day" title="Ngày" />
            <Tab key="week" title="Tuần" />
            <Tab key="month" title="Tháng" />
          </Tabs>

          <Button
            color="danger"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onCreateSchedule}
          >
            Thêm buổi học
          </Button>
        </div>
      </div>
    );
  }, [currentDate, currentView, dateDisplayText, handleViewChange, onCreateSchedule]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Custom Toolbar */}
      <CustomToolbar />

      {/* Legend */}
      <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm text-gray-500 font-medium">Chú thích:</span>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="p-4 relative" style={{ minHeight: 600 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" color="danger" />
              <p className="text-sm text-gray-600 font-medium">Đang tải lịch...</p>
            </div>
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={events}
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          onDoubleClickEvent={handleDoubleClickEvent}
          eventPropGetter={eventPropGetter}
          messages={messages}
          toolbar={false}
          popup
          step={30}
          timeslots={2}
          min={new Date(1970, 0, 1, 7, 0, 0)}
          max={new Date(1970, 0, 1, 21, 0, 0)}
          style={{ height: 650 }}
          formats={{
            timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
            eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
            dayHeaderFormat: (date: Date) => format(date, 'EEEE dd/MM', { locale: vi }),
            dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, 'dd/MM', { locale: vi })} — ${format(end, 'dd/MM/yyyy', { locale: vi })}`,
          }}
        />
      </div>
    </div>
  );
}
