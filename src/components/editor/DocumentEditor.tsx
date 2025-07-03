'use client';

import { useEffect } from 'react';
import { $getRoot, $createParagraphNode } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { ToolbarPlugin } from './ToolbarPlugin';

interface DocumentEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  className?: string;
}

function EditorContent({ placeholder, onChange }: { placeholder?: string; onChange?: (content: string) => void }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = () => {
    editor.update(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onChange?.(htmlString);
    });
  };

  return (
    <>
      <ToolbarPlugin />
      <div className="relative min-h-[500px]">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="outline-none px-6 py-4 min-h-[500px] text-gray-900 leading-relaxed focus:outline-none"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                direction: 'ltr',
                textAlign: 'left',
              }}
            />
          }
          placeholder={
            <div className="absolute top-4 left-6 text-gray-400 pointer-events-none select-none">
              {placeholder || 'Start writing...'}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={handleChange} />
        <HistoryPlugin />
        <ListPlugin />
      </div>
    </>
  );
}

function LoadContentPlugin({ content }: { content?: string }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (content) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      });
    }
  }, [content, editor]);

  return null;
}

export function DocumentEditor({ initialContent, placeholder, onChange, className = '' }: DocumentEditorProps) {
  const initialConfig = {
    namespace: 'WriteAlikeEditor',
    editorState: null,
    theme: {
      root: 'p-0',
      paragraph: 'mb-4 last:mb-0',
      heading: {
        h1: 'text-3xl font-bold mb-6 mt-8 first:mt-0',
        h2: 'text-2xl font-semibold mb-4 mt-6 first:mt-0',
        h3: 'text-xl font-medium mb-3 mt-4 first:mt-0',
      },
      list: {
        listitem: 'ml-4 mb-1',
        ul: 'list-disc mb-4',
        ol: 'list-decimal mb-4',
      },
      link: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
      text: {
        bold: 'font-semibold',
        italic: 'italic',
        underline: 'underline',
        strikethrough: 'line-through',
        code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
      },
      quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4',
      code: 'bg-gray-100 p-4 rounded-lg mb-4 text-sm font-mono overflow-x-auto',
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical editor error:', error);
    },
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <LexicalComposer initialConfig={initialConfig}>
        <LoadContentPlugin content={initialContent} />
        <EditorContent placeholder={placeholder} onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}