'use client';

import { useMemo, useState, type MouseEvent } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  NodeProps,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import { ArrowUpRight, Calendar, FileText, Folder, Link2, Sparkles } from 'lucide-react';
import type { CalendarEvent, Note } from '@/shared/lib/types';

type GraphNodeKind = 'hub' | 'note' | 'tag' | 'calendar' | 'date' | 'event';

type GraphNodeData = {
  kind: GraphNodeKind;
  label: string;
  subtitle?: string;
  accent?: string;
  count?: number;
  noteId?: string;
  eventId?: string;
  onOpenNote?: (noteId: string) => void;
  onOpenCalendar?: (date: Date) => void;
  dateValue?: Date;
};

type GraphViewProps = {
  notes: Note[];
  calendarEvents: CalendarEvent[];
  onOpenNote: (note: Note) => void;
  onOpenCalendar: () => void;
  themeMode?: 'light' | 'dark';
};

const NOTE_MENTION_REGEX = /data-type="mention" data-id="([^"]+)"/g;

const parseLegacyDate = (value?: string) => {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const yearPart = Number(parts[2]);
  const year = yearPart < 100 ? 2000 + yearPart : yearPart;
  const parsed = new Date(year, month - 1, day);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const sameDay = (left: Date, right: Date) => (
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()
);

const formatDateLabel = (date: Date) => date.toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const relationKey = (source: string, target: string) => [source, target].sort().join('|');

const kindColor = (kind: GraphNodeKind, themeMode: 'light' | 'dark') => {
  if (kind === 'hub') return themeMode === 'dark' ? '#f8fafc' : '#111827';
  if (kind === 'calendar') return '#2563eb';
  if (kind === 'date') return '#8b5cf6';
  if (kind === 'event') return '#0f766e';
  if (kind === 'tag') return '#f97316';
  return '#ff7d54';
};

function GraphCardNode({ data, selected }: NodeProps) {
  const typedData = data as GraphNodeData;
  const icon = typedData.kind === 'note'
    ? FileText
    : typedData.kind === 'tag'
      ? Folder
      : typedData.kind === 'calendar' || typedData.kind === 'date' || typedData.kind === 'event'
        ? Calendar
        : Sparkles;

  const Icon = icon;
  const sizeClass = typedData.kind === 'hub'
    ? 'min-w-[11rem]'
    : typedData.kind === 'note'
      ? 'min-w-[13rem]'
      : typedData.kind === 'event'
        ? 'min-w-[12rem]'
        : 'min-w-[10rem]';

  return (
    <div
      className={`rounded-[1.6rem] border px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-200 ${sizeClass} ${
        selected ? 'scale-[1.03]' : 'hover:scale-[1.02]'
      } ${
        data.kind === 'hub'
          ? 'bg-white/90 border-white/70 text-gray-900'
          : 'bg-white/80 border-white/60 text-gray-900'
      }`}
      style={{
        boxShadow: selected
          ? `0 22px 60px color-mix(in srgb, ${typedData.accent || '#ff7d54'} 22%, rgba(0,0,0,0.18))`
          : undefined,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" isConnectable={false} />
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
          style={{ backgroundColor: typedData.accent || '#ff7d54' }}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-bold uppercase tracking-[0.28em] text-gray-400">
            {typedData.kind === 'note' ? 'Note' : typedData.kind === 'tag' ? 'Folder' : typedData.kind === 'event' ? 'Calendar Event' : typedData.kind === 'date' ? 'Event Date' : 'Knowledge Graph'}
          </div>
          <div className="mt-1 truncate text-sm font-semibold leading-snug">{typedData.label}</div>
          {typedData.subtitle && <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{typedData.subtitle}</div>}
          {typeof typedData.count === 'number' && <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-400">{typedData.count} items</div>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" isConnectable={false} />
    </div>
  );
}

export default function GraphView({ notes, calendarEvents, onOpenNote, onOpenCalendar, themeMode = 'light' }: GraphViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { nodes, edges, selected } = useMemo(() => {
    const activeNotes = notes.filter(note => !note.isDeleted);
    const noteMap = new Map(activeNotes.map(note => [note.id, note]));

    const tagCounts = new Map<string, number>();
    activeNotes.forEach(note => {
      const tag = note.tags?.[0] || 'Untagged';
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });

    const tags = Array.from(tagCounts.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));

    const rootId = 'graph-root';
    const calendarHubId = 'graph-calendar';

    const graphNodes: Node<GraphNodeData>[] = [
      {
        id: rootId,
        type: 'graphCard',
        position: { x: 0, y: 0 },
        data: {
          kind: 'hub',
          label: 'Knowledge Graph',
          subtitle: 'Bi-directional links, folders, and calendar touchpoints',
          accent: '#111827',
          count: activeNotes.length,
        },
        draggable: false,
      },
      {
        id: calendarHubId,
        type: 'graphCard',
        position: { x: 720, y: 0 },
        data: {
          kind: 'calendar',
          label: 'Calendar Layer',
          subtitle: 'Events and date anchors from your schedule',
          accent: '#2563eb',
          count: calendarEvents.length,
        },
        draggable: false,
      },
    ];

    const graphEdges: Edge[] = [];
    const edgeMap = new Map<string, Edge>();

    const addEdge = (edge: Edge) => {
      const key = relationKey(edge.source, edge.target) + `:${edge.type || 'default'}`;
      if (edgeMap.has(key)) return;
      edgeMap.set(key, edge);
      graphEdges.push(edge);
    };

    tags.forEach(([tag, count], index) => {
      const angle = (Math.PI * 2 * index) / Math.max(tags.length, 1) - Math.PI / 2;
      const tagNodeId = `tag:${tag}`;
      const tagX = Math.cos(angle) * 330;
      const tagY = Math.sin(angle) * 220;

      graphNodes.push({
        id: tagNodeId,
        type: 'graphCard',
        position: { x: tagX, y: tagY },
        data: {
          kind: 'tag',
          label: tag,
          subtitle: 'Folder cluster',
          accent: '#f97316',
          count,
        },
        draggable: false,
      });

      addEdge({
        id: `${rootId}-${tagNodeId}`,
        source: rootId,
        target: tagNodeId,
        type: 'smoothstep',
        style: { stroke: 'rgba(249, 115, 22, 0.35)', strokeWidth: 1.5 },
      });

      const taggedNotes = activeNotes.filter(note => (note.tags?.[0] || 'Untagged') === tag);
      taggedNotes.forEach((note, noteIndex) => {
        const noteAngle = angle + 0.4 + noteIndex * 0.35;
        const noteRadius = 130 + Math.floor(noteIndex / 4) * 42;
        const noteId = `note:${note.id}`;
        const noteX = tagX + Math.cos(noteAngle) * noteRadius;
        const noteY = tagY + Math.sin(noteAngle) * noteRadius;

        graphNodes.push({
          id: noteId,
          type: 'graphCard',
          position: { x: noteX, y: noteY },
          data: {
            kind: 'note',
            label: note.title || 'Untitled note',
            subtitle: note.content ? note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 92) : 'No preview content.',
            accent: note.color || '#ff7d54',
            noteId: note.id,
            onOpenNote: () => onOpenNote(note),
          },
          draggable: false,
        });

        addEdge({
          id: `${tagNodeId}-${noteId}`,
          source: tagNodeId,
          target: noteId,
          type: 'smoothstep',
          style: { stroke: 'rgba(255, 125, 84, 0.28)', strokeWidth: 1.5 },
        });
      });
    });

    const untaggedNotes = activeNotes.filter(note => (note.tags?.[0] || 'Untagged') === 'Untagged');
    untaggedNotes.forEach((note, index) => {
      const angle = -0.8 + index * 0.45;
      const radius = 210 + Math.floor(index / 5) * 48;
      const noteId = `note:${note.id}`;
      const noteX = Math.cos(angle) * radius;
      const noteY = Math.sin(angle) * radius + 260;

      graphNodes.push({
        id: noteId,
        type: 'graphCard',
        position: { x: noteX, y: noteY },
        data: {
          kind: 'note',
          label: note.title || 'Untitled note',
          subtitle: note.content ? note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 92) : 'No preview content.',
          accent: note.color || '#ff7d54',
          noteId: note.id,
          onOpenNote: () => onOpenNote(note),
        },
        draggable: false,
      });

      addEdge({
        id: `${rootId}-${noteId}`,
        source: rootId,
        target: noteId,
        type: 'smoothstep',
        style: { stroke: 'rgba(17, 24, 39, 0.14)', strokeWidth: 1.5 },
      });
    });

    const eventGroups = new Map<string, CalendarEvent[]>();
    calendarEvents.forEach(event => {
      const dateKey = `${event.year}-${event.month}-${event.date}`;
      const existing = eventGroups.get(dateKey) || [];
      existing.push(event);
      eventGroups.set(dateKey, existing);
    });

    const calendarDates = Array.from(eventGroups.entries())
      .map(([key, events]) => {
        const [year, month, day] = key.split('-').map(Number);
        return { key, events, date: new Date(year, month, day) };
      })
      .sort((left, right) => left.date.getTime() - right.date.getTime());

    calendarDates.forEach((group, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(calendarDates.length, 1) - Math.PI / 2;
      const dateNodeId = `date:${group.key}`;
      const dateX = 720 + Math.cos(angle) * 260;
      const dateY = Math.sin(angle) * 210;

      graphNodes.push({
        id: dateNodeId,
        type: 'graphCard',
        position: { x: dateX, y: dateY },
        data: {
          kind: 'date',
          label: formatDateLabel(group.date),
          subtitle: `${group.events.length} scheduled event${group.events.length === 1 ? '' : 's'}`,
          accent: '#8b5cf6',
          count: group.events.length,
          dateValue: group.date,
        },
        draggable: false,
      });

      addEdge({
        id: `${calendarHubId}-${dateNodeId}`,
        source: calendarHubId,
        target: dateNodeId,
        type: 'smoothstep',
        style: { stroke: 'rgba(37, 99, 235, 0.32)', strokeWidth: 1.5, strokeDasharray: '6 6' },
      });

      group.events.forEach((event, eventIndex) => {
        const eventAngle = angle + 0.2 + eventIndex * 0.32;
        const eventRadius = 128 + Math.floor(eventIndex / 3) * 28;
        const eventNodeId = `event:${event.id}`;
        const eventX = dateX + Math.cos(eventAngle) * eventRadius;
        const eventY = dateY + Math.sin(eventAngle) * eventRadius;

        graphNodes.push({
          id: eventNodeId,
          type: 'graphCard',
          position: { x: eventX, y: eventY },
          data: {
            kind: 'event',
            label: event.title,
            subtitle: `${event.time} · ${event.desc || 'Calendar event'}`,
            accent: event.iconColor || '#0f766e',
            eventId: event.id,
            onOpenCalendar: () => onOpenCalendar(),
          },
          draggable: false,
        });

        addEdge({
          id: `${dateNodeId}-${eventNodeId}`,
          source: dateNodeId,
          target: eventNodeId,
          type: 'smoothstep',
          style: { stroke: 'rgba(15, 118, 110, 0.3)', strokeWidth: 1.5 },
        });
      });
    });

    activeNotes.forEach(note => {
      const noteNodeId = `note:${note.id}`;

      if (note.parentId && noteMap.has(note.parentId)) {
        addEdge({
          id: `${noteNodeId}-${note.parentId}`,
          source: `note:${note.parentId}`,
          target: noteNodeId,
          type: 'smoothstep',
          style: { stroke: 'rgba(139, 92, 246, 0.22)', strokeWidth: 1.4 },
        });
      }

      note.connections?.forEach(targetId => {
        if (!noteMap.has(targetId)) return;
        addEdge({
          id: `${noteNodeId}-${targetId}`,
          source: noteNodeId,
          target: `note:${targetId}`,
          type: 'smoothstep',
          style: { stroke: 'rgba(255, 125, 84, 0.32)', strokeWidth: 1.7 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255, 125, 84, 0.42)' },
        });
      });

      NOTE_MENTION_REGEX.lastIndex = 0;
      const mentionIds = new Set<string>();
      let match: RegExpExecArray | null;
      while ((match = NOTE_MENTION_REGEX.exec(note.content)) !== null) {
        mentionIds.add(match[1]);
      }
      mentionIds.forEach(targetId => {
        if (!noteMap.has(targetId)) return;
        addEdge({
          id: `${noteNodeId}-mention-${targetId}`,
          source: noteNodeId,
          target: `note:${targetId}`,
          type: 'smoothstep',
          style: { stroke: 'rgba(249, 115, 22, 0.26)', strokeWidth: 1.2, strokeDasharray: '5 5' },
        });
      });

      const parsedDate = parseLegacyDate(note.date);
      if (parsedDate) {
        const dateKey = `${parsedDate.getFullYear()}-${parsedDate.getMonth()}-${parsedDate.getDate()}`;
        if (eventGroups.has(dateKey)) {
          addEdge({
            id: `${noteNodeId}-${dateKey}`,
            source: noteNodeId,
            target: `date:${dateKey}`,
            type: 'smoothstep',
            style: { stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 1.3, strokeDasharray: '4 6' },
          });
        }
      }
    });

    return {
      nodes: graphNodes,
      edges: graphEdges,
      selected: selectedNodeId ? graphNodes.find(node => node.id === selectedNodeId) || null : null,
    };
  }, [calendarEvents, notes, onOpenCalendar, onOpenNote, selectedNodeId]);

  const minimapColor = (node: Node<GraphNodeData>) => kindColor(node.data.kind, themeMode);

  const handleNodeClick = (_: MouseEvent, node: Node<GraphNodeData>) => {
    setSelectedNodeId(node.id);
  };

  const handlePaneClick = () => setSelectedNodeId(null);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/40 bg-[#f8f6f2]/80 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">
      <div className="absolute left-6 top-6 z-20 max-w-[34rem] rounded-[1.8rem] border border-white/60 bg-white/75 px-5 py-4 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
          <Link2 size={12} />
          Bi-directional graph
        </div>
        <h2 className="mt-2 text-balance text-2xl font-extrabold tracking-tight text-gray-900">Your notes, folders, and calendar layers in one map.</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Linked notes appear as connected nodes, folders become clusters, and calendar events anchor the timeline side of the graph.
        </p>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ graphCard: GraphCardNode }}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnDrag
        panOnScroll
        zoomOnScroll
        zoomOnPinch
        fitView
        minZoom={0.2}
        maxZoom={1.5}
        className={themeMode === 'dark' ? 'bg-neutral-900 text-white' : 'bg-transparent text-gray-900'}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(148, 163, 184, 0.45)' },
        }}
      >
        <Background gap={28} size={1} color={themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'} />
        <MiniMap
          position="bottom-left"
          zoomable
          pannable
          nodeColor={minimapColor}
          className="!rounded-[1.4rem] !border !border-white/60 !bg-white/70 !backdrop-blur-xl"
        />
        <Controls
          position="bottom-right"
          className="!rounded-[1.4rem] !border !border-white/60 !bg-white/75 !backdrop-blur-xl !shadow-xl"
          showInteractive={false}
        />
      </ReactFlow>

      <div className="absolute bottom-6 left-6 z-20 flex flex-wrap gap-2">
        {[
          { label: 'Note links', color: '#ff7d54' },
          { label: 'Folders', color: '#f97316' },
          { label: 'Calendar', color: '#2563eb' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2 rounded-full border border-white/60 bg-white/75 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500 shadow-sm backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

      {selected && (
        <div className="absolute right-6 top-6 z-20 w-[20rem] rounded-[1.8rem] border border-white/60 bg-white/80 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">Selected node</div>
          <h3 className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">{selected.data.label}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{selected.data.subtitle || 'No additional details available.'}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {selected.data.kind === 'note' && selected.data.noteId && selected.data.onOpenNote && (
              <button
                onClick={() => selected.data.onOpenNote?.(selected.data.noteId!)}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
              >
                Open note <ArrowUpRight size={12} />
              </button>
            )}
                {(selected.data.kind === 'calendar' || selected.data.kind === 'event' || selected.data.kind === 'date') && (
              <button
                onClick={() => selected.data.onOpenCalendar?.(selected.data.dateValue || new Date())}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
              >
                Open calendar <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}