'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';

interface SavePluginProps {
  onSave: (content: string) => void;
  saveInterval?: number; // in milliseconds
}

export function SavePlugin({ onSave, saveInterval = 30000 }: SavePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleSave = () => {
      editor.getEditorState().read(() => {
        const htmlString = $generateHtmlFromNodes(editor, null);
        onSave(htmlString);
      });
    };

    const startAutoSave = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleSave();
        startAutoSave(); // Schedule next save
      }, saveInterval);
    };

    // Start auto-save cycle
    startAutoSave();

    // Listen for editor changes to reset the timer
    const removeUpdateListener = editor.registerUpdateListener(() => {
      startAutoSave(); // Reset timer on each change
    });

    return () => {
      clearTimeout(timeoutId);
      removeUpdateListener();
    };
  }, [editor, onSave, saveInterval]);

  return null;
}