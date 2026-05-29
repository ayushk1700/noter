import React from 'react';
import { CalendarIcon, Trash2, Flower2, Mail, Laptop, Sparkles, CheckCircle, Search } from 'lucide-react';
import { CalendarEvent } from '@/shared/lib/types';

interface AgendaViewProps {
  activeDate: Date;
  events: CalendarEvent[];
  onDeleteEvent: (id: string) => void;
  onNavigateDate: (date: Date) => void;
  onAddEventClick: () => void;
}

export default function AgendaView({
  activeDate,
  events,
  onDeleteEvent,
  onNavigateDate,
  onAddEventClick,
}: AgendaViewProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const getIcon = (name: string) => {
    switch (name) {
      case 'flower':
        return <Flower2 className="w-5 h-5" />;
      case 'mail':
        return <Mail className="w-5 h-5" />;
      case 'laptop':
        return <Laptop className="w-5 h-5" />;
      case 'personal':
        return <Sparkles className="w-5 h-5" />;
      case 'work':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Laptop className="w-5 h-5" />;
    }
  };

  // Group events by date, filtered by search term
  const filteredEvents = events.filter((e) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      e.title.toLowerCase().includes(term) ||
      e.desc.toLowerCase().includes(term) ||
      e.startTime.includes(term)
    );
  });

  // Sort events chronologically: Year -> Month -> Date -> Start Time
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    if (a.month !== b.month) return a.month - b.month;
    if (a.date !== b.date) return a.date - b.date;
    return a.startTime.localeCompare(b.startTime);
  });

  // Group by unique date string: e.g. "2026-05-20"
  type GroupedEvents = {
    dateObj: Date;
    events: CalendarEvent[];
  };

  const grouped = sortedEvents.reduce<Record<string, GroupedEvents>>((acc, event) => {
    const key = `${event.year}-${event.month}-${event.date}`;
    if (!acc[key]) {
      acc[key] = {
        dateObj: new Date(event.year, event.month, event.date),
        events: [],
      };
    }
    acc[key].events.push(event);
    return acc;
  }, {});

  const groupedList = Object.values(grouped);

  const isSelected = (date: Date) => {
    return (
      date.getDate() === activeDate.getDate() &&
      date.getMonth() === activeDate.getMonth() &&
      date.getFullYear() === activeDate.getFullYear()
    );
  };

  return (
    <div className="flex flex-col bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-gray-100 shadow-sm" style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Agenda View Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Workspace Agenda</h2>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
            Chronological Task Timeline
          </p>
        </div>

        {/* Search bar inside Agenda */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search agenda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#F9F8F6] border border-gray-100 hover:border-gray-200 focus:border-gray-300 focus:bg-white outline-none rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-700 font-bold transition-all w-48 md:w-56"
            />
          </div>
          <button
            onClick={onAddEventClick}
            className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-full transition-colors shrink-0"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Timeline Scrolling List */}
      <div
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8"
        style={{ scrollbarWidth: 'thin' }}
      >
        {groupedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] text-gray-400 bg-white/40 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 select-none">
            <CalendarIcon className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="font-semibold text-lg text-gray-700 mb-1">Agenda is Clear</h3>
            <p className="text-sm text-center text-gray-500 max-w-xs leading-relaxed">
              No matching events in your calendar database. Time to plan or sync your workspace.
            </p>
          </div>
        ) : (
          groupedList.map(({ dateObj, events: dayEvts }, gIdx) => {
            const selected = isSelected(dateObj);

            return (
              <div
                key={gIdx}
                onClick={() => onNavigateDate(dateObj)}
                className={`flex flex-col md:flex-row gap-6 p-4 rounded-3xl cursor-pointer transition-all ${
                  selected
                    ? 'bg-orange-50/10 border border-orange-100 shadow-xs'
                    : 'border border-transparent hover:bg-white/40'
                }`}
              >
                {/* Date Left Marker */}
                <div className="md:w-32 shrink-0 flex md:flex-col items-baseline md:items-end select-none">
                  <span className="text-2xl font-bold text-gray-800 leading-none">
                    {dateObj.getDate()}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-2 md:ml-0 md:mt-1.5">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short' })}
                  </span>
                  {dateObj.getFullYear() !== new Date().getFullYear() && (
                    <span className="text-[10px] font-bold text-gray-400/70 ml-1.5 md:ml-0 md:mt-0.5">
                      {dateObj.getFullYear()}
                    </span>
                  )}
                </div>

                {/* Vertical Divider line in desktop */}
                <div className="hidden md:block w-px bg-gray-200/60 self-stretch my-1 shrink-0" />

                {/* Right Cards Stack */}
                <div className="flex-1 space-y-4">
                  {dayEvts.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        // Prevent row-navigation triggers when editing/deleting specific card
                        e.stopPropagation();
                      }}
                      className={`rounded-3xl p-5 md:p-6 ${event.color} border border-black/5 shadow-xs hover:shadow-md transition-shadow relative flex justify-between gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className="flex gap-4 md:gap-5 min-w-0">
                        <div
                          className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white shadow-sm shrink-0 select-none ${event.iconColor}`}
                        >
                          {getIcon(event.iconName)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 text-lg tracking-tight truncate leading-tight">
                            {event.title}
                          </h4>
                          <p className="text-[10px] text-gray-500 font-bold tracking-wider mt-0.5 select-none uppercase">
                            {event.startTime} - {event.endTime}
                          </p>
                          {event.desc && (
                            <p className="text-xs md:text-sm text-gray-700 font-medium mt-1.5 leading-relaxed">
                              {event.desc}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-2 shrink-0">
                        {event.isGoogleEvent && (
                          <span className="text-[8px] font-bold tracking-widest uppercase text-white bg-blue-500/70 border border-blue-500/20 px-2 py-0.5 rounded-full select-none">
                            Google
                          </span>
                        )}
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white/60 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete Event"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
