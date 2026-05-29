import React, { useEffect, useState, useRef } from 'react';
import { Trash2, Flower2, Mail, Laptop, Sparkles, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEvent } from '@/shared/lib/types';

interface WeekViewProps {
  activeDate: Date;
  events: CalendarEvent[];
  onAddEventClick: (date: Date, timeStr: string) => void;
  onDeleteEvent: (id: string) => void;
  onNavigateDate: (date: Date) => void;
}

export default function WeekView({
  activeDate,
  events,
  onAddEventClick,
  onDeleteEvent,
  onNavigateDate,
}: WeekViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate dates in active week (Sun - Sat)
  const startOfWeek = new Date(activeDate);
  const currentDayOfWeek = activeDate.getDay();
  startOfWeek.setDate(activeDate.getDate() - currentDayOfWeek);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Scroll to 7 AM on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 7 * 60; // 60px per hour
    }
  }, []);

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hrs, mins] = timeStr.split(':').map(Number);
    return hrs * 60 + mins;
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'flower':
        return <Flower2 className="w-3.5 h-3.5" />;
      case 'mail':
        return <Mail className="w-3.5 h-3.5" />;
      case 'laptop':
        return <Laptop className="w-3.5 h-3.5" />;
      case 'personal':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'work':
        return <CheckCircle className="w-3.5 h-3.5" />;
      default:
        return <Laptop className="w-3.5 h-3.5" />;
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Position calculation inside a column
  const getEventPosition = (event: CalendarEvent) => {
    const start = parseTimeToMinutes(event.startTime);
    const end = Math.max(start + 30, parseTimeToMinutes(event.endTime));
    const top = (start / 60) * 60; // 60px per hour
    const height = ((end - start) / 60) * 60;
    return { top, height };
  };

  // Check if a day is the current system day
  const isCurrentDay = (d: Date) => {
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour} ${ampm}`;
  };

  const navigateWeek = (weeksToShift: number) => {
    const nextDate = new Date(activeDate);
    nextDate.setDate(activeDate.getDate() + weeksToShift * 7);
    onNavigateDate(nextDate);
  };

  return (
    <div className="flex flex-col bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-gray-100 shadow-sm" style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Week View Header Toolbar */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/60">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span>
              {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-gray-300">—</span>
            <span>
              {weekDays[6].toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </h2>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
            Weekly Agenda Layout
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 focus:outline-none"
            title="Previous Week"
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
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 focus:outline-none"
            title="Next Week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Columns Header */}
      <div className="flex border-b border-gray-100 bg-white/30 select-none pl-14 pr-2">
        {weekDays.map((day, idx) => {
          const active =
            day.getDate() === activeDate.getDate() &&
            day.getMonth() === activeDate.getMonth() &&
            day.getFullYear() === activeDate.getFullYear();
          const today = isCurrentDay(day);

          return (
            <div
              key={idx}
              onClick={() => onNavigateDate(day)}
              className="flex-1 flex flex-col items-center py-3.5 cursor-pointer hover:bg-[#F9F8F6]/50 transition-colors group border-r border-gray-100 last:border-r-0"
            >
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  active
                    ? 'bg-[#FF7D54] text-white shadow-md'
                    : today
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 group-hover:bg-gray-100'
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto relative scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="flex min-h-[1440px] relative w-full pr-2">
          {/* Time Slot Rows (Side markers) */}
          <div className="w-14 shrink-0 flex flex-col border-r border-gray-100/60 bg-white/20 select-none">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-[60px] text-[10px] font-bold text-gray-400 pr-2 pt-1 text-right border-b border-gray-100/40"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dIdx) => {
            const dayEvts = events.filter(
              (e) =>
                e.date === day.getDate() &&
                e.month === day.getMonth() &&
                e.year === day.getFullYear()
            );

            const today = isCurrentDay(day);
            const isSelected =
              day.getDate() === activeDate.getDate() &&
              day.getMonth() === activeDate.getMonth() &&
              day.getFullYear() === activeDate.getFullYear();

            return (
              <div
                key={dIdx}
                className={`flex-1 relative border-r border-gray-100/60 last:border-r-0 ${
                  isSelected ? 'bg-orange-50/10' : today ? 'bg-gray-50/20' : ''
                }`}
              >
                {/* Horizontal time dividers */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    onClick={() => {
                      const padHr = hour.toString().padStart(2, '0');
                      onNavigateDate(day);
                      onAddEventClick(day, `${padHr}:00`);
                    }}
                    className="h-[60px] border-b border-gray-100/40 hover:bg-gray-50/60 cursor-pointer transition-colors relative group"
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-[#FF7D54]/5 text-[9px] font-bold text-[#FF7D54]">
                      + Add
                    </div>
                  </div>
                ))}

                {/* Day's Events */}
                {dayEvts.map((event) => {
                  const { top, height } = getEventPosition(event);
                  const isCompact = height < 50;

                  return (
                    <div
                      key={event.id}
                      style={{
                        top: `${top + 2}px`,
                        height: `${height - 4}px`,
                        left: '4px',
                        width: 'calc(100% - 8px)',
                      }}
                      className={`absolute pointer-events-auto rounded-2xl p-2.5 ${event.color} border border-black/5 hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden animate-in fade-in duration-200`}
                    >
                      <div className="flex gap-1.5 min-w-0 h-full overflow-hidden">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-white shadow-xs shrink-0 select-none ${event.iconColor}`}
                        >
                          {getIcon(event.iconName)}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <h4 className="font-bold text-gray-900 text-xs tracking-tight truncate leading-tight">
                            {event.title}
                          </h4>
                          {!isCompact && (
                            <p className="text-[9px] text-gray-500 font-semibold truncate leading-none mt-0.5">
                              {event.startTime} - {event.endTime}
                            </p>
                          )}
                        </div>
                      </div>

                      {!isCompact && (
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-black/5 shrink-0">
                          <span className="text-[8px] font-bold text-gray-400 bg-white/40 px-1.5 py-0.5 rounded-full select-none">
                            {event.isGoogleEvent ? 'G' : 'F'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteEvent(event.id);
                            }}
                            className="p-1 rounded-full bg-white/60 hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete Event"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Current Time Bar indicator across columns */}
          {isCurrentDay(activeDate) && (
            <div
              className="absolute left-14 right-0 pointer-events-none z-10 flex items-center"
              style={{
                top: `${((now.getHours() * 60 + now.getMinutes()) / 60) * 60}px`,
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 -ml-[3px]" />
              <div className="flex-1 h-[1.5px] bg-red-500/70" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
