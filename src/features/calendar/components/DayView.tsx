import React, { useEffect, useState, useRef } from 'react';
import { Trash2, Flower2, Mail, Laptop, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { CalendarEvent } from '@/shared/lib/types';

interface DayViewProps {
  activeDate: Date;
  events: CalendarEvent[];
  onAddEventClick: (timeStr: string) => void;
  onDeleteEvent: (id: string) => void;
}

export default function DayView({
  activeDate,
  events,
  onAddEventClick,
  onDeleteEvent,
}: DayViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to current time or 7 AM on mount
  useEffect(() => {
    if (containerRef.current) {
      const isToday =
        activeDate.getDate() === now.getDate() &&
        activeDate.getMonth() === now.getMonth() &&
        activeDate.getFullYear() === now.getFullYear();

      const scrollHour = isToday ? now.getHours() - 2 : 7;
      const scrollTop = Math.max(0, scrollHour * 80); // 80px per hour
      containerRef.current.scrollTop = scrollTop;
    }
  }, [activeDate, now]);

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [hrs, mins] = timeStr.split(':').map(Number);
    return hrs * 60 + mins;
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'flower':
        return <Flower2 className="w-4 h-4" />;
      case 'mail':
        return <Mail className="w-4 h-4" />;
      case 'laptop':
        return <Laptop className="w-4 h-4" />;
      case 'personal':
        return <Sparkles className="w-4 h-4" />;
      case 'work':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Laptop className="w-4 h-4" />;
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for the active date
  const dayEvents = events.filter((event) => {
    return (
      event.date === activeDate.getDate() &&
      event.month === activeDate.getMonth() &&
      event.year === activeDate.getFullYear()
    );
  });

  // Calculate layout positioning for overlapping events
  const layedOutEvents = (() => {
    const sorted = [...dayEvents].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );

    interface PlacedEvent {
      event: CalendarEvent;
      top: number;
      height: number;
      left: string;
      width: string;
    }

    const placed: PlacedEvent[] = [];
    const columns: CalendarEvent[][] = [];

    sorted.forEach((event) => {
      const start = parseTimeToMinutes(event.startTime);
      const end = Math.max(start + 30, parseTimeToMinutes(event.endTime)); // min 30 mins

      // Find first column where this event doesn't overlap with any existing event
      let colIndex = 0;
      while (true) {
        if (!columns[colIndex]) {
          columns[colIndex] = [event];
          break;
        }

        const hasOverlap = columns[colIndex].some((other) => {
          const oStart = parseTimeToMinutes(other.startTime);
          const oEnd = Math.max(oStart + 30, parseTimeToMinutes(other.endTime));
          return start < oEnd && end > oStart;
        });

        if (!hasOverlap) {
          columns[colIndex].push(event);
          break;
        }
        colIndex++;
      }
    });

    // Generate absolute coordinates based on column indexing
    sorted.forEach((event) => {
      const start = parseTimeToMinutes(event.startTime);
      const end = Math.max(start + 30, parseTimeToMinutes(event.endTime));
      const top = (start / 60) * 80; // 80px per hour
      const height = ((end - start) / 60) * 80;

      // Find how many columns total overlap with this event's vertical span
      let overlappingColsCount = 0;
      let eventColIndex = 0;

      columns.forEach((col, idx) => {
        const hasOverlap = col.some((other) => {
          const oStart = parseTimeToMinutes(other.startTime);
          const oEnd = Math.max(oStart + 30, parseTimeToMinutes(other.endTime));
          return start < oEnd && end > oStart;
        });

        if (hasOverlap) {
          overlappingColsCount++;
          if (col.includes(event)) {
            eventColIndex = overlappingColsCount - 1;
          }
        }
      });

      const widthPercent = 100 / Math.max(1, overlappingColsCount);
      const leftPercent = eventColIndex * widthPercent;

      placed.push({
        event,
        top,
        height,
        left: `${leftPercent}%`,
        width: `calc(${widthPercent}% - 8px)`,
      });
    });

    return placed;
  })();

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${displayHour}:00 ${ampm}`;
  };

  const isToday =
    activeDate.getDate() === now.getDate() &&
    activeDate.getMonth() === now.getMonth() &&
    activeDate.getFullYear() === now.getFullYear();

  const currentTimeTop = isToday
    ? ((now.getHours() * 60 + now.getMinutes()) / 60) * 80
    : null;

  return (
    <div className="flex flex-col bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-gray-100 shadow-sm" style={{ height: '100%', minHeight: 0 }}>
      {/* Day View Header */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/60">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {activeDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </h2>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
            Hourly Schedule
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F9F8F6] rounded-full border border-gray-100">
          <Clock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-600">
            {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>
      </div>

      {/* Grid Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto relative scroll-smooth p-6 pt-0"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="relative min-h-[1920px] w-full pt-4">
          {/* Time Slot Rows */}
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex border-b border-gray-100/70"
              style={{ height: '80px' }}
            >
              {/* Hour Label */}
              <div className="w-20 pr-4 text-right text-xs font-bold text-gray-400 select-none pt-1">
                {formatHour(hour)}
              </div>
              {/* Content box / click placeholder to add event */}
              <div
                onClick={() => {
                  const padHr = hour.toString().padStart(2, '0');
                  onAddEventClick(`${padHr}:00`);
                }}
                className="flex-1 cursor-pointer hover:bg-[#F9F8F6]/40 transition-colors relative group"
              >
                <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 text-[10px] font-bold tracking-widest text-[#FF7D54] uppercase transition-opacity">
                  + Add Event
                </div>
              </div>
            </div>
          ))}

          {/* Current Time Line */}
          {currentTimeTop !== null && (
            <div
              className="absolute left-20 right-0 z-20 flex items-center pointer-events-none"
              style={{ top: `${currentTimeTop}px` }}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-sm" />
              <div className="flex-1 h-[2px] bg-red-500/80 shadow-sm" />
              <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ml-2">
                {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}

          {/* Render Placed Events */}
          <div className="absolute left-20 right-0 top-0 bottom-0 pointer-events-none">
            {layedOutEvents.map(({ event, top, height, left, width }) => (
              <div
                key={event.id}
                style={{
                  top: `${top + 4}px`,
                  height: `${height - 8}px`,
                  left: left,
                  width: width,
                }}
                className={`absolute pointer-events-auto rounded-3xl p-4 ${event.color} border border-black/5 hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden animate-in fade-in duration-200`}
              >
                <div className="flex gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 select-none ${event.iconColor}`}
                  >
                    {getIcon(event.iconName)}
                  </div>
                  <div className="overflow-hidden min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm tracking-tight truncate leading-tight">
                      {event.title}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-bold tracking-wider mt-0.5 select-none">
                      {event.startTime} - {event.endTime}
                    </p>
                    {height > 60 && event.desc && (
                      <p className="text-xs text-gray-600 font-medium truncate mt-1 select-none">
                        {event.desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-white/50 px-2 py-0.5 rounded-full select-none">
                    {event.isGoogleEvent ? 'Google Synced' : 'Fokus'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEvent(event.id);
                    }}
                    className="p-1.5 rounded-full bg-white/60 hover:bg-red-50 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Event"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
