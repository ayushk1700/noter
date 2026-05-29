// Folder concept removed in favor of tags in Note
export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'audio';
  data: string;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  blockAnchorId?: string;
  zIndex?: number;
}

export interface Note {
  id: string;
  parentId?: string | null;
  connections?: string[];
  title: string;
  content: string;
  tags: string[];
  date: string;
  attachments: Attachment[];
  updatedAt: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  isPinned?: boolean;
  coverImage?: string;
  coverPositionY?: number;
  icon?: string;
  status?: 'Draft' | 'In Progress' | 'Completed';
}

export interface Toast {
  message: string;
  type: 'error' | 'success';
  actionText?: string;
  onAction?: () => void;
}

export interface CalendarDay {
  day: string;
  date: number;
  active: boolean;
  hasEvent: boolean;
}

export type CalendarLayout = 'day' | 'week' | 'month' | 'agenda';

export interface CalendarEvent {
  id: string;
  date: number; // Day of the month (1-31)
  month: number; // Month index (0-11)
  year: number; // Year (e.g. 2026)
  time: string; // e.g. "09:00 AM - 10:30 AM" or similar legacy time label
  startTime: string; // "09:00" (24h format HH:MM)
  endTime: string; // "10:30" (24h format HH:MM)
  title: string;
  desc: string;
  color: string;
  iconColor: string;
  iconName: string;
  isGoogleEvent?: boolean;
  googleEventId?: string;
}

export interface GoogleSyncConfig {
  clientId: string;
  apiKey: string;
  isConnected: boolean;
  lastSyncedAt: string | null;
}
