import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles, FolderPlus } from 'lucide-react';
import { CalendarEvent } from '@/shared/lib/types';

interface MonthViewProps {
  activeDate: Date;
  events: CalendarEvent[];
  onAddEventClick: (date: Date) => void;
  onNavigateDate: (date: Date) => void;
}

export default function MonthView({
  activeDate,
  events,
  onAddEventClick,
  onNavigateDate,
}: MonthViewProps) {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();

  // First day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday, 6 is Saturday

  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Total days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Construct 42-day calendar grid
  const gridDays: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthTotalDays - i);
    gridDays.push({ date: d, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    gridDays.push({ date: d, isCurrentMonth: true });
  }

  // Next month leading days to fill 42 cells (6 rows * 7 columns)
  const remaining = 42 - gridDays.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    gridDays.push({ date: d, isCurrentMonth: false });
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMonthShift = (shift: number) => {
    const nextDate = new Date(activeDate);
    nextDate.setMonth(activeDate.getMonth() + shift);
    onNavigateDate(nextDate);
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === activeDate.getDate() &&
      date.getMonth() === activeDate.getMonth() &&
      date.getFullYear() === activeDate.getFullYear()
    );
  };

  return (
    <div className="flex flex-col bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-gray-100 shadow-sm" style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Month Header Controller */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/60">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {activeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
            Monthly Grid Layout
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMonthShift(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 focus:outline-none"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onNavigateDate(new Date())}
            className="px-3.5 py-1.5 bg-gray-900 text-white rounded-full font-bold text-xs hover:bg-black transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => handleMonthShift(1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 focus:outline-none"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Days of Week Header Grid */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-white/30 text-center select-none font-bold text-[10px] text-gray-400 tracking-wider py-3">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 flex-1 overflow-auto" style={{ gridTemplateRows: 'repeat(6, minmax(80px, 1fr))' }}>
        {gridDays.map(({ date, isCurrentMonth }, idx) => {
          const today = isToday(date);
          const selected = isSelected(date);

          const dayEvents = events.filter(
            (e) =>
              e.date === date.getDate() &&
              e.month === date.getMonth() &&
              e.year === date.getFullYear()
          );

          // Render only first 3 events, list count for others
          const displayEvents = dayEvents.slice(0, 3);
          const hiddenCount = dayEvents.length - 3;

          return (
            <div
              key={idx}
              onClick={() => onNavigateDate(date)}
              className={`border-r border-b border-gray-100/60 p-2 flex flex-col justify-between cursor-pointer hover:bg-gray-50/40 transition-colors relative group min-h-0 ${
                selected ? 'bg-orange-50/15' : ''
              }`}
            >
              {/* Day Box Header */}
              <div className="flex justify-between items-center select-none">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    today
                      ? 'bg-gray-900 text-white shadow-sm'
                      : selected
                      ? 'bg-[#FF7D54]/10 text-[#FF7D54] border border-[#FF7D54]'
                      : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-300'
                  }`}
                >
                  {date.getDate()}
                </span>

                {/* Direct quick add button shown on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateDate(date);
                    onAddEventClick(date);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-800"
                  title="Add Event"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Event Stack Container */}
              <div className="flex-1 flex flex-col gap-1 mt-1.5 overflow-hidden justify-start">
                {displayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold truncate border border-black/5 select-none ${evt.color} text-gray-800 leading-tight transition-transform hover:scale-[1.02]`}
                    title={`${evt.title} (${evt.startTime} - ${evt.endTime})`}
                  >
                    <span className="opacity-60 mr-1">{evt.startTime}</span>
                    <span>{evt.title}</span>
                  </div>
                ))}
                {hiddenCount > 0 && (
                  <div className="text-[8px] font-bold text-gray-400 pl-1 select-none">
                    + {hiddenCount} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
