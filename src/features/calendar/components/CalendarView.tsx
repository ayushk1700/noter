import { useState, useEffect } from 'react';
import {
  X,
  Bell,
  CalendarIcon,
  Plus,
  Trash2,
  Flower2,
  Mail,
  Laptop,
  Sparkles,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Settings2,
  RefreshCw,
  CalendarDays,
  ListCollapse,
  Activity,
  Moon,
  Sun,
} from 'lucide-react';
import { CalendarDay, CalendarEvent, CalendarLayout, GoogleSyncConfig } from '@/shared/lib/types';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AgendaView from './AgendaView';
import GlobalNavbar from '@/shared/components/GlobalNavbar';

interface CalendarViewProps {
  calendarDays: CalendarDay[];
  calendarEvents: CalendarEvent[];
  activeDateObj: Date;
  onActiveDateChange: (date: Date) => void;
  calendarLayout: CalendarLayout;
  onLayoutChange: (layout: CalendarLayout) => void;
  googleSyncConfig: GoogleSyncConfig;
  onSaveSyncConfig: (config: GoogleSyncConfig) => void;
  onTriggerSync: (useSimulation: boolean) => Promise<void>;
  onClose: () => void;
  onDayClick: (date: number) => void; // Legacy compatibility
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  themeMode?: 'light' | 'dark';
  isChronoEnabled?: boolean;
  onToggleTheme?: () => void;
  onToggleChrono?: () => void;
}

export default function CalendarView({
  calendarEvents,
  activeDateObj,
  onActiveDateChange,
  calendarLayout,
  onLayoutChange,
  googleSyncConfig,
  onSaveSyncConfig,
  onTriggerSync,
  onClose,
  onAddEvent,
  onDeleteEvent,
  themeMode = 'light',
  isChronoEnabled = false,
  onToggleTheme,
  onToggleChrono,
}: CalendarViewProps) {
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [colorType, setColorType] = useState<'orange' | 'purple' | 'yellow'>('orange');
  const [iconName, setIconName] = useState<'flower' | 'mail' | 'laptop' | 'personal' | 'work'>('flower');

  // Google Panel Settings State
  const [isGooglePanelOpen, setIsGooglePanelOpen] = useState(false);
  const [clientId, setClientId] = useState(googleSyncConfig.clientId || '');
  const [apiKey, setApiKey] = useState(googleSyncConfig.apiKey || '');
  const [isSyncing, setIsSyncing] = useState(false);

  // Date Picker Month State
  const [pickerMonth, setPickerMonth] = useState(new Date(activeDateObj));

  useEffect(() => {
    setClientId(googleSyncConfig.clientId);
    setApiKey(googleSyncConfig.apiKey);
  }, [googleSyncConfig]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let color = 'bg-[#FFEBE4]';
    let iconColor = 'bg-[#FF7D54]';

    if (colorType === 'purple') {
      color = 'bg-[#EAE4FF]';
      iconColor = 'bg-[#7D54FF]';
    } else if (colorType === 'yellow') {
      color = 'bg-[#FFF5D1]';
      iconColor = 'bg-[#E6B800]';
    }

    // Format legacy time label string for list-agenda view
    const formatTimeLabel = (time24: string) => {
      const [hrsStr, minsStr] = time24.split(':');
      const hrs = parseInt(hrsStr);
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      const displayHour = hrs % 12 === 0 ? 12 : hrs % 12;
      return `${displayHour}:${minsStr} ${ampm}`;
    };

    const timeLabel = `${formatTimeLabel(startTime)} - ${formatTimeLabel(endTime)}`;

    onAddEvent({
      date: activeDateObj.getDate(),
      month: activeDateObj.getMonth(),
      year: activeDateObj.getFullYear(),
      time: timeLabel,
      startTime,
      endTime,
      title,
      desc,
      color,
      iconColor,
      iconName,
    });

    // Reset Form fields
    setTitle('');
    setDesc('');
    setStartTime('09:00');
    setEndTime('10:00');
    setColorType('orange');
    setIconName('flower');
    setIsModalOpen(false);
  };

  // Save Sync Keys
  const handleSaveConfig = () => {
    onSaveSyncConfig({
      clientId,
      apiKey,
      isConnected: googleSyncConfig.isConnected,
      lastSyncedAt: googleSyncConfig.lastSyncedAt,
    });
  };

  // Sync Calendar
  const handleSync = async (useSimulation: boolean) => {
    setIsSyncing(true);
    try {
      await onTriggerSync(useSimulation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate date picker grid cells for pickerMonth
  const getPickerDays = () => {
    const year = pickerMonth.getFullYear();
    const month = pickerMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotal = new Date(year, month, 0).getDate();

    const days = [];
    // Previous Month Trailing cells
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthTotal - i),
        isCurrentMonth: false,
      });
    }
    // Current Month cells
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    // Next Month Leading cells
    const totalCells = 42; // standard grid
    const remaining = totalCells - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handlePickerMonthShift = (shift: number) => {
    const nextDate = new Date(pickerMonth);
    nextDate.setMonth(pickerMonth.getMonth() + shift);
    setPickerMonth(nextDate);
  };

  // Check if date has events scheduled
  const dateHasEvents = (d: Date) => {
    return calendarEvents.some(
      (e) =>
        e.date === d.getDate() &&
        e.month === d.getMonth() &&
        e.year === d.getFullYear()
    );
  };

  // Helper for quick hour navigation from views
  const handleAddEventAtTime = (date: Date, timeStr: string) => {
    onActiveDateChange(date);
    setStartTime(timeStr);
    // Auto set endtime to starttime + 1 hour
    const [hrs, mins] = timeStr.split(':').map(Number);
    const endHrs = (hrs + 1) % 24;
    setEndTime(`${endHrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
    setIsModalOpen(true);
  };

  return (
    <div className="absolute inset-0 bg-[#F9F8F6] z-40 flex flex-col items-center overflow-hidden animate-in slide-in-from-bottom-8 duration-300 pt-24 md:pt-28">
      <div className="w-full max-w-7xl h-full flex flex-col relative">
        
        <GlobalNavbar themeMode={themeMode}>
            {/* Back */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="w-px h-4 bg-white/15 mx-1" />

            {/* Current Date */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white/90 text-sm font-bold tracking-wide select-none">
              <CalendarIcon size={14} className="text-[#FF7D54]" />
              <span className="hidden sm:inline">
                {activeDateObj.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Today Button */}
            <button
              onClick={() => {
                const today = new Date();
                onActiveDateChange(today);
                setPickerMonth(new Date(today));
              }}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold transition-all focus:outline-none"
              title="Go to Today"
            >
              Today
            </button>

            <div className="w-px h-4 bg-white/15 mx-1" />

            {/* Theme & Chrono */}
            {onToggleTheme && (
              <button 
                onClick={onToggleTheme}
                className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
                title="Toggle Theme"
              >
                {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
            )}
            {onToggleChrono && (
              <button 
                onClick={onToggleChrono}
                className={`p-2 rounded-full transition-all ${isChronoEnabled ? 'bg-indigo-500/80 text-white' : 'hover:bg-white/10 text-white/40 hover:text-white/80'}`}
                title="Chrono Mode"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}

            <div className="w-px h-4 bg-white/15 mx-1 hidden md:block" />

            {/* Google Settings */}
            <button
              onClick={() => setIsGooglePanelOpen(!isGooglePanelOpen)}
              className={`p-2 rounded-full transition-all ${
                isGooglePanelOpen
                  ? 'bg-blue-500/80 text-white'
                  : 'hover:bg-white/10 text-white/40 hover:text-white/80'
              }`}
              title="Google Integration Panel"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
        </GlobalNavbar>

        {/* Master Content Pane layout */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 px-6 md:px-12 gap-6 md:gap-10 pb-6 z-10">
          
          {/* LEFT SIDEBAR: Heading, Mini Date Picker & Google Connections */}
          <div className="md:w-72 lg:w-80 flex flex-col shrink-0 gap-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            
            {/* Header branding block */}
            <div className="pt-2 md:pt-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight select-none">
                Schedule in your
                <br />
                calendar 🕰️
              </h1>
            </div>

            {/* HIGH-FIDELITY SIDEBAR MINI DATE PICKER */}
            <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col">
              <div className="flex justify-between items-center mb-4 px-1">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {pickerMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => handlePickerMonthShift(-1)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePickerMonthShift(1)}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span>S</span>
                <span>M</span>
                <span>T</span>
                <span>W</span>
                <span>T</span>
                <span>F</span>
                <span>S</span>
              </div>

              {/* Days Grid Cells */}
              <div className="grid grid-cols-7 gap-y-1.5 text-center">
                {getPickerDays().map(({ date, isCurrentMonth }, pIdx) => {
                  const isSelected =
                    date.getDate() === activeDateObj.getDate() &&
                    date.getMonth() === activeDateObj.getMonth() &&
                    date.getFullYear() === activeDateObj.getFullYear();
                  
                  const hasEvt = dateHasEvents(date);
                  const isToday =
                    date.getDate() === new Date().getDate() &&
                    date.getMonth() === new Date().getMonth() &&
                    date.getFullYear() === new Date().getFullYear();

                  return (
                    <div
                      key={pIdx}
                      onClick={() => {
                        onActiveDateChange(date);
                        setPickerMonth(new Date(date));
                      }}
                      className="flex flex-col items-center justify-center cursor-pointer group relative"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all relative ${
                          isSelected
                            ? 'bg-[#FF7D54] text-white shadow-md'
                            : isToday
                            ? 'bg-gray-200 text-gray-900'
                            : isCurrentMonth
                            ? 'text-gray-700 hover:bg-gray-50'
                            : 'text-gray-300 hover:bg-gray-50/50'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                      {/* Orange Dot indicator for Events */}
                      {hasEvt && (
                        <div
                          className={`w-1 h-1 rounded-full absolute bottom-0 transition-colors ${
                            isSelected ? 'bg-white' : 'bg-[#FF7D54]'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* COLLAPSIBLE GOOGLE CALENDAR CONNECTION DRAWER */}
            {isGooglePanelOpen && (
              <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-blue-100 flex flex-col space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">
                      Google Settings
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {googleSyncConfig.isConnected ? 'Connected' : 'Offline'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      OAuth Client ID
                    </label>
                    <input
                      type="password"
                      placeholder="Enter Client ID..."
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      onBlur={handleSaveConfig}
                      className="w-full bg-[#F9F8F6] border border-gray-100 hover:border-gray-200 focus:border-blue-300 focus:bg-white outline-none rounded-xl px-3 py-2 text-xs font-medium transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                      Calendar API Key
                    </label>
                    <input
                      type="password"
                      placeholder="Enter API Key..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onBlur={handleSaveConfig}
                      className="w-full bg-[#F9F8F6] border border-gray-100 hover:border-gray-200 focus:border-blue-300 focus:bg-white outline-none rounded-xl px-3 py-2 text-xs font-medium transition-all"
                    />
                  </div>
                </div>

                {googleSyncConfig.lastSyncedAt && (
                  <p className="text-[9px] font-bold text-gray-400 select-none text-center">
                    Last Synced: {googleSyncConfig.lastSyncedAt}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSync(false)}
                    disabled={isSyncing}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    <span>Sync Live</span>
                  </button>
                  <button
                    onClick={() => handleSync(true)}
                    disabled={isSyncing}
                    className="flex-1 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span>Simulate</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action scheduled buttons */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 bg-gray-950 text-white font-bold text-xs tracking-widest uppercase hover:bg-black hover:scale-[1.01] transition-all rounded-[2rem] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 focus:outline-none"
            >
              <Plus size={16} /> Add New Event
            </button>
          </div>

          {/* RIGHT VIEW: Responsive layout switch toolbar + dynamic layout views */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col md:pt-4">
            
            {/* View Selector Selector Bar */}
            <div className="flex justify-between items-center mb-6 bg-white/40 backdrop-blur-md rounded-2xl p-1.5 border border-gray-100 shrink-0">
              <div className="flex gap-1">
                {/* Day Selector */}
                <button
                  onClick={() => onLayoutChange('day')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    calendarLayout === 'day'
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <CalendarIcon size={14} />
                  <span className="hidden sm:inline">Day</span>
                </button>
                {/* Week Selector */}
                <button
                  onClick={() => onLayoutChange('week')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    calendarLayout === 'week'
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <CalendarDays size={14} />
                  <span className="hidden sm:inline">Week</span>
                </button>
                {/* Month Selector */}
                <button
                  onClick={() => onLayoutChange('month')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    calendarLayout === 'month'
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Activity size={14} />
                  <span className="hidden sm:inline">Month</span>
                </button>
                {/* Agenda Selector */}
                <button
                  onClick={() => onLayoutChange('agenda')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    calendarLayout === 'agenda'
                      ? 'bg-gray-950 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <ListCollapse size={14} />
                  <span className="hidden sm:inline">Agenda</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pr-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 select-none">
                Layout engine: {calendarLayout}
              </div>
            </div>

            {/* Dynamic View container injection */}
            <div className="flex-1 min-h-0">
              {calendarLayout === 'day' && (
                <DayView
                  activeDate={activeDateObj}
                  events={calendarEvents}
                  onAddEventClick={(time) => handleAddEventAtTime(activeDateObj, time)}
                  onDeleteEvent={onDeleteEvent}
                />
              )}

              {calendarLayout === 'week' && (
                <WeekView
                  activeDate={activeDateObj}
                  events={calendarEvents}
                  onAddEventClick={handleAddEventAtTime}
                  onDeleteEvent={onDeleteEvent}
                  onNavigateDate={onActiveDateChange}
                />
              )}

              {calendarLayout === 'month' && (
                <MonthView
                  activeDate={activeDateObj}
                  events={calendarEvents}
                  onAddEventClick={(d) => {
                    onActiveDateChange(d);
                    setIsModalOpen(true);
                  }}
                  onNavigateDate={onActiveDateChange}
                />
              )}

              {calendarLayout === 'agenda' && (
                <AgendaView
                  activeDate={activeDateObj}
                  events={calendarEvents}
                  onDeleteEvent={onDeleteEvent}
                  onNavigateDate={onActiveDateChange}
                  onAddEventClick={() => setIsModalOpen(true)}
                />
              )}
            </div>

          </div>
        </div>

        {/* Modal: Beautiful, interactive glassmorphic scheduling wizard */}
        {isModalOpen && (
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in">
            <div className="bg-white p-8 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 p-2.5 rounded-full transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-bold mb-1 text-gray-900">Schedule Event</h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-6">
                {activeDateObj.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>

              <form onSubmit={handleCreateEvent} className="space-y-6">
                
                {/* Event Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="E.g., Meditation, Respond to emails..."
                    className="w-full bg-transparent border-b-2 border-gray-100 focus:border-gray-900 outline-none pb-2 text-lg text-gray-900 transition-colors placeholder:text-gray-300 font-medium"
                  />
                </div>

                {/* Event Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Add more details (optional)..."
                    rows={2}
                    className="w-full bg-transparent border-b-2 border-gray-100 focus:border-gray-950 outline-none pb-2 text-base text-gray-900 transition-colors placeholder:text-gray-300 resize-none leading-relaxed font-medium"
                  />
                </div>

                {/* Event Time and Color Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Start Time</label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-gray-100 focus:border-gray-900 outline-none pb-2 text-base text-gray-900 transition-colors placeholder:text-gray-300 font-medium cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">End Time</label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-gray-100 focus:border-gray-900 outline-none pb-2 text-base text-gray-900 transition-colors placeholder:text-gray-300 font-medium cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Color Theme</label>
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setColorType('orange')}
                        className={`w-7 h-7 rounded-full bg-[#FF7D54] border-4 transition-all ${
                          colorType === 'orange' ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        title="Orange Accent"
                      />
                      <button
                        type="button"
                        onClick={() => setColorType('purple')}
                        className={`w-7 h-7 rounded-full bg-[#7D54FF] border-4 transition-all ${
                          colorType === 'purple' ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        title="Purple Accent"
                      />
                      <button
                        type="button"
                        onClick={() => setColorType('yellow')}
                        className={`w-7 h-7 rounded-full bg-[#E6B800] border-4 transition-all ${
                          colorType === 'yellow' ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'
                        }`}
                        title="Gold Accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Event Category / Icon Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Event Icon / Category</label>
                  <div className="grid grid-cols-5 gap-3">
                    <button
                      type="button"
                      onClick={() => setIconName('flower')}
                      className={`py-3 rounded-2xl flex items-center justify-center border transition-all ${
                        iconName === 'flower'
                          ? 'bg-[#FF7D54]/10 border-[#FF7D54] text-[#FF7D54] scale-[1.05] font-bold'
                          : 'border-gray-150 hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Mindfulness / Health"
                    >
                      <Flower2 size={22} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIconName('mail')}
                      className={`py-3 rounded-2xl flex items-center justify-center border transition-all ${
                        iconName === 'mail'
                          ? 'bg-[#7D54FF]/10 border-[#7D54FF] text-[#7D54FF] scale-[1.05] font-bold'
                          : 'border-gray-150 hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Communications"
                    >
                      <Mail size={22} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIconName('laptop')}
                      className={`py-3 rounded-2xl flex items-center justify-center border transition-all ${
                        iconName === 'laptop'
                          ? 'bg-[#E6B800]/10 border-[#E6B800] text-[#E6B800] scale-[1.05] font-bold'
                          : 'border-gray-150 hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Coding / Focus Work"
                    >
                      <Laptop size={22} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIconName('personal')}
                      className={`py-3 rounded-2xl flex items-center justify-center border transition-all ${
                        iconName === 'personal'
                          ? 'bg-rose-500/10 border-rose-500 text-rose-500 scale-[1.05] font-bold'
                          : 'border-gray-150 hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Self Care / Personal"
                    >
                      <Sparkles size={22} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIconName('work')}
                      className={`py-3 rounded-2xl flex items-center justify-center border transition-all ${
                        iconName === 'work'
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 scale-[1.05] font-bold'
                          : 'border-gray-150 hover:bg-gray-50 text-gray-400 hover:text-gray-600'
                      }`}
                      title="Task / Deadline"
                    >
                      <CheckCircle size={22} />
                    </button>
                  </div>
                </div>

                {/* View Toggles & Theme */}
                <div className="flex items-center space-x-2">
                  <div className="flex bg-gray-100 rounded-lg p-1 mr-4">
                    <button
                      onClick={() => onLayoutChange('day')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${calendarLayout === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Day
                    </button>
                    <button
                      onClick={() => onLayoutChange('week')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${calendarLayout === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => onLayoutChange('month')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${calendarLayout === 'month' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => onLayoutChange('agenda')}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${calendarLayout === 'agenda' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Agenda
                    </button>
                  </div>

                  <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                  {onToggleTheme && (
                    <button 
                      onClick={onToggleTheme}
                      title="Toggle Theme"
                      className={`p-2 rounded-xl border shadow-sm transition-colors ${themeMode === 'dark' ? 'bg-neutral-800 border-neutral-700 text-gray-300 hover:text-white hover:bg-neutral-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                    >
                      {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                  )}
                  {onToggleChrono && (
                    <button 
                      onClick={onToggleChrono}
                      title="Toggle Chrono Mode"
                      className={`p-2 rounded-xl border shadow-sm transition-colors ${isChronoEnabled ? 'bg-indigo-500 text-white border-indigo-500' : (themeMode === 'dark' ? 'bg-neutral-800 border-neutral-700 text-gray-300 hover:text-white hover:bg-neutral-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700')}`}
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Form Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3.5 font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors focus:outline-none text-sm tracking-wide"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gray-950 hover:bg-black text-white py-3.5 font-bold rounded-2xl hover:scale-[1.01] transition-all shadow-md focus:outline-none text-sm tracking-wide"
                  >
                    Schedule Event
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
