'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
} from 'lexical';

export function CursorPositionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Listen for editor updates to monitor selection state
    const unregisterUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Debug logging to understand cursor position
          console.log('Selection state:', {
            anchorOffset: selection.anchor.offset,
            focusOffset: selection.focus.offset,
            anchorKey: selection.anchor.key,
            focusKey: selection.focus.key,
            isCollapsed: selection.isCollapsed(),
          });
        }
      });
    });

    return () => {
      unregisterUpdateListener();
    };
  }, [editor]);

  return null;
}