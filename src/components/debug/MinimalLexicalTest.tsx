'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

// Minimal test component with no custom styling
export function MinimalLexicalTest() {
  const initialConfig = {
    namespace: 'MinimalTest',
    onError: (error: Error) => {
      console.error('Minimal Lexical error:', error);
    },
    theme: {}, // No custom theme
    nodes: [], // No custom nodes
  };

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '10px', 
      margin: '10px',
      backgroundColor: 'white'
    }}>
      <h3>Minimal Lexical Test (No Custom Styles)</h3>
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={
            <ContentEditable
              style={{
                minHeight: '100px',
                padding: '10px',
                border: '1px solid #ddd',
                outline: 'none',
              }}
            />
          }
          placeholder={
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              left: '10px', 
              color: '#999',
              pointerEvents: 'none'
            }}>
              Type here (plain text)...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={(editorState) => {
          console.log('Minimal editor state change:', editorState);
        }} />
        <HistoryPlugin />
      </LexicalComposer>
    </div>
  );
}