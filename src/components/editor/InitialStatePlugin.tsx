'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode } from 'lexical';

export function InitialStatePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.update(() => {
      try {
        const root = $getRoot();
        if (root.getFirstChild() === null) {
          const paragraph = $createParagraphNode();
          root.append(paragraph);
          // Set focus to the paragraph to ensure proper cursor positioning
          paragraph.selectEnd();
        }
      } catch (error) {
        console.error('InitialStatePlugin error:', error);
      }
    });
  }, [editor]);

  return null;
}