import { Note, CalendarDay, CalendarEvent } from './types';


export const initialNotes: Note[] = [
  {
    id: 'n1',
    tags: ['Begin'],
    title: 'How to take a note',
    content: 'Write a sentence to capture the core of your idea. Clear, brief, and concise.',
    date: '20.09.21',
    attachments: [],
    updatedAt: Date.now() - 500000,
  },
  {
    id: 'n2',
    tags: ['Ideas'],
    title: 'Inspiration',
    content: 'Key words: Natural elements, warm textures, spacious typography, smooth grids.',
    date: '19.09.21',
    attachments: [],
    updatedAt: Date.now() - 1000000,
  },
  {
    id: 'n3',
    tags: ['Begin'],
    title: 'Sorting your thoughts',
    content: 'Start small, one step at a time. Put feelings to paper, then organize.',
    date: '15.09.21',
    attachments: [],
    updatedAt: Date.now() - 1500000,
  },
  {
    id: 'n4',
    tags: ['Self care'],
    title: 'Mindfulness',
    content: 'Practice mindfulness. Pay attention to the quiet moments in between busy tasks.',
    date: '10.09.21',
    attachments: [],
    updatedAt: Date.now() - 2000000,
  },
];

export const initialCalendarDays: CalendarDay[] = [
  { day: 'Sun', date: 17, active: false, hasEvent: false },
  { day: 'Mon', date: 18, active: false, hasEvent: false },
  { day: 'Tue', date: 19, active: false, hasEvent: false },
  { day: 'Wed', date: 20, active: true, hasEvent: true },
  { day: 'Thur', date: 21, active: false, hasEvent: true },
  { day: 'Fri', date: 22, active: false, hasEvent: false },
  { day: 'Sat', date: 23, active: false, hasEvent: false },
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'e1',
    date: 20,
    month: 4, // May
    year: 2026,
    time: '08:00 AM - 08:30 AM',
    startTime: '08:00',
    endTime: '08:30',
    title: 'Meditate for 10 min',
    desc: 'meditation to calm your body and mind',
    color: 'bg-[#FFEBE4]',
    iconColor: 'bg-[#FF7D54]',
    iconName: 'flower',
  },
  {
    id: 'e2',
    date: 20,
    month: 4,
    year: 2026,
    time: '09:30 AM - 10:00 AM',
    startTime: '09:30',
    endTime: '10:00',
    title: 'Respond to emma',
    desc: 'Clear unread emails from the inbox.',
    color: 'bg-[#EAE4FF]',
    iconColor: 'bg-[#7D54FF]',
    iconName: 'mail',
  },
  {
    id: 'e3',
    date: 21,
    month: 4,
    year: 2026,
    time: '10:00 AM - 11:30 AM',
    startTime: '10:00',
    endTime: '11:30',
    title: 'Complete project',
    desc: 'Finalize the UI and send for review.',
    color: 'bg-[#FFF5D1]',
    iconColor: 'bg-[#E6B800]',
    iconName: 'laptop',
  },
];

export const designQuotes = [
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: "John Carmack" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The art of being wise is the art of knowing what to overlook.", author: "William James" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
];
