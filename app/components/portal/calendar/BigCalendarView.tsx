'use client';

import { useMemo, useCallback, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View, type SlotInfo } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/app/styles/big-calendar-custom.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { Button, Spinner, Tabs, Tab, Tooltip } from '@heroui/react';
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

// Vietnamese weekday names (short format)
const WEEKDAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// Custom format for weekday header
const formatWeekdayShort = (date: Date) => {
  const day = getDay(date);
  return WEEKDAY_NAMES[day];
};

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

// Legend items with exact status colors
const LEGEND_ITEMS = [
  { label: 'Sắp diễn ra', bgColor: '#FEF3C7', textColor: '#92400E' },
  { label: 'Tương lai', bgColor: '#ECFEFF', textColor: '#065F46' },
  { label: 'Đã qua', bgColor: '#F3F4F6', textColor: '#9CA3AF' },
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
  onEditEvent: (schedule: ISchedule) => void;
  onCreateSchedule: () => void;
  onSlotSelect?: (slotInfo: { start: Date; end: Date }) => void;
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
  onEditEvent,
  onCreateSchedule,
  onSlotSelect,
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
    const base: React.CSSProperties = {
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.8rem',
      padding: '3px 8px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    };

    switch (state) {
      case EventState.UPCOMING:
        return { style: { ...base, backgroundColor: '#FEF3C7', color: '#92400E' } };
      case EventState.FUTURE:
        return { style: { ...base, backgroundColor: '#ECFEFF', color: '#065F46' } };
      case EventState.PAST:
        return { style: { ...base, backgroundColor: '#F3F4F6', color: '#9CA3AF' } };
      default:
        return { style: base };
    }
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

  // Handle drag/drop slot selection
  const handleSelectSlot = useCallback(
    (slotInfo: SlotInfo) => {
      if (onSlotSelect) {
        onSlotSelect({ start: slotInfo.start, end: slotInfo.end });
      }
    },
    [onSlotSelect]
  );

  // Custom event component with hover Edit button
  const CustomEvent = useCallback(
    ({ event }: { event: CalendarEvent }) => {
      return (
        <div className="group relative w-full h-full flex items-center">
          <span className="truncate block flex-1">{event.title}</span>
          <Tooltip content="Chỉnh sửa" placement="top" size="sm">
            <button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 -right-1 w-6 h-6 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                onEditEvent(event.resource.schedule);
              }}
            >
              <Pencil className="w-3 h-3 text-gray-600" />
            </button>
          </Tooltip>
        </div>
      );
    },
    [onEditEvent]
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

  // Custom Toolbar navigation handlers
  const goToToday = useCallback(() => setCurrentDate(new Date()), []);
  const goBack = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (currentView === Views.DAY) d.setDate(d.getDate() - 1);
      else if (currentView === Views.WEEK) d.setDate(d.getDate() - 7);
      else d.setMonth(d.getMonth() - 1);
      return d;
    });
  }, [currentView]);
  const goNext = useCallback(() => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (currentView === Views.DAY) d.setDate(d.getDate() + 1);
      else if (currentView === Views.WEEK) d.setDate(d.getDate() + 7);
      else d.setMonth(d.getMonth() + 1);
      return d;
    });
  }, [currentView]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Custom Toolbar */}
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
            onSelectionChange={(key: React.Key) => handleViewChange(VIEW_MAP[key as string] || Views.MONTH)}
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

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm text-gray-500 font-medium">Chú thích:</span>
        {LEGEND_ITEMS.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: item.bgColor, color: item.textColor }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.textColor }}
            />
            {item.label}
          </span>
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
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventPropGetter}
          components={{ event: CustomEvent }}
          messages={messages}
          toolbar={false}
          popup
          step={30}
          timeslots={2}
          min={new Date(1970, 0, 1, 7, 0, 0)}
          max={new Date(1970, 0, 1, 21, 0, 0)}
          style={{ height: 650 }}
          formats={{
            weekdayFormat: formatWeekdayShort,
            timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
            eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
            dayHeaderFormat: (date: Date) => format(date, 'dd/MM', { locale: vi }),
            dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
              `${format(start, 'dd/MM', { locale: vi })} — ${format(end, 'dd/MM/yyyy', { locale: vi })}`,
          }}
        />
      </div>
    </div>
  );
}
