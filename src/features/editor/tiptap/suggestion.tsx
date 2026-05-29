import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { Type, Heading1, Heading2, List, CheckSquare, Code, FileText, Layers } from 'lucide-react';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Text',
      description: 'Just start typing with plain text.',
      icon: Type,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run();
      },
    },
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: Heading1,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: Heading2,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list.',
      icon: List,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Task List',
      description: 'Track tasks with a to-do list.',
      icon: CheckSquare,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet.',
      icon: Code,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: 'Page',
      description: 'Embed a sub-page inside this note.',
      icon: FileText,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).run();
        if (editor.storage.pageCreation && editor.storage.pageCreation.onCreatePage) {
          editor.storage.pageCreation.onCreatePage();
        }
      },
    },
    {
      title: 'Embed Note',
      description: 'Insert a live portal to another note.',
      icon: Layers,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({
          type: 'embedBlock',
          attrs: { noteId: null }
        }).run();
      },
    },
  ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase())).slice(0, 10);
};

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
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
    onKeyDown: ({ event }: any) => {
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

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-72 max-h-[300px] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
              index === selectedIndex ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className={`p-2 rounded-lg ${index === selectedIndex ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
              <item.icon className={`w-5 h-5 ${index === selectedIndex ? 'text-gray-900' : 'text-gray-500'}`} />
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900">{item.title}</div>
              <div className="text-xs text-gray-400 font-medium">{item.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="px-4 py-3 text-sm text-gray-500 text-center font-medium">
          No results
        </div>
      )}
    </div>
  );
});

CommandList.displayName = 'CommandList';

export const renderSuggestion = () => {
  let component: any;
  let popup: any;

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) return;

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },

    onUpdate(props: any) {
      component.updateProps(props);
      if (!props.clientRect) return;
      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }
      return component.ref?.onKeyDown(props);
    },

    onExit() {
      popup[0].destroy();
      component.destroy();
    },
  };
};
