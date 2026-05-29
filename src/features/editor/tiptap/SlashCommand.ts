import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { getSuggestionItems, renderSuggestion } from './suggestion';

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        items: getSuggestionItems,
        render: renderSuggestion,
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
