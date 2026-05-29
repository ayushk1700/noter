import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FileText } from 'lucide-react';

interface MentionListProps {
  items: any[];
  command: (item: any) => void;
}

export const MentionList = forwardRef((props: MentionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.title });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (!props.items.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[240px] text-sm text-gray-500 p-4">
        No matching notes found
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden min-w-[280px]">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-widest">
        Link Note
      </div>
      <div className="max-h-[300px] overflow-y-auto p-1">
        {props.items.map((item, index) => (
          <button
            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
              index === selectedIndex ? 'bg-indigo-50 text-indigo-700' : 'bg-transparent text-gray-700 hover:bg-gray-50'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <FileText className={`w-4 h-4 ${index === selectedIndex ? 'text-indigo-500' : 'text-gray-400'}`} />
            <span className="truncate font-medium">{item.title || 'Untitled Note'}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

MentionList.displayName = 'MentionList';
