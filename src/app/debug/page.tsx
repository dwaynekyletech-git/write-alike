'use client';

import { useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

export default function DebugPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // Minimal Lexical config
  const minimalConfig = {
    namespace: 'MinimalEditor',
    onError: (error: Error) => {
      console.error('Minimal editor error:', error);
      addResult(`Error: ${error.message}`);
    },
  };

  // Rich text config
  const richConfig = {
    namespace: 'RichEditor',
    theme: {},
    onError: (error: Error) => {
      console.error('Rich editor error:', error);
      addResult(`Rich Error: ${error.message}`);
    },
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lexical Debug Page</h1>
      
      {/* Test Results */}
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">Test Results:</h2>
        <div className="text-sm space-y-1">
          {testResults.map((result, i) => (
            <div key={i}>{result}</div>
          ))}
        </div>
        <button 
          onClick={() => setTestResults([])}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Clear Results
        </button>
      </div>

      {/* Test 1: Regular contenteditable */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 1: Regular contenteditable</h2>
        <div 
          contentEditable
          className="border p-4 min-h-[100px] bg-white"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            direction: 'ltr',
            textAlign: 'left',
          }}
          onInput={(e) => {
            const target = e.target as HTMLElement;
            addResult(`Regular contenteditable: "${target.textContent}"`);
          }}
        />
        <p className="text-sm text-gray-600 mt-1">Type here to test basic contenteditable behavior</p>
      </div>

      {/* Test 2: Minimal Lexical with PlainText */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 2: Minimal Lexical (PlainText)</h2>
        <LexicalComposer initialConfig={minimalConfig}>
          <PlainTextPlugin
            contentEditable={
              <ContentEditable 
                className="border p-4 min-h-[100px] bg-white"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  direction: 'ltr',
                  textAlign: 'left',
                }}
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                Type here (PlainText)...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
        </LexicalComposer>
        <p className="text-sm text-gray-600 mt-1">Test minimal Lexical setup</p>
      </div>

      {/* Test 3: Lexical with RichText */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 3: Lexical RichText (like current setup)</h2>
        <LexicalComposer initialConfig={richConfig}>
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className="border p-4 min-h-[100px] bg-white"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    direction: 'ltr',
                    textAlign: 'left',
                  }}
                />
              }
              placeholder={
                <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                  Type here (RichText)...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          <HistoryPlugin />
        </LexicalComposer>
        <p className="text-sm text-gray-600 mt-1">Test RichText plugin behavior</p>
      </div>

      {/* Test 4: System Information */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test 4: System Information</h2>
        <div className="p-4 bg-gray-50 rounded text-sm">
          <div><strong>User Agent:</strong> {navigator.userAgent}</div>
          <div><strong>Language:</strong> {navigator.language}</div>
          <div><strong>Languages:</strong> {navigator.languages.join(', ')}</div>
          <div><strong>Platform:</strong> {navigator.platform}</div>
          <div><strong>Document Dir:</strong> {document.documentElement.dir || 'default'}</div>
          <div><strong>Document Lang:</strong> {document.documentElement.lang || 'default'}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Testing Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Type the same word "test" in each editor above</li>
          <li>Observe cursor position (left vs right of characters)</li>
          <li>Check if characters appear vertically or horizontally</li>
          <li>Open browser DevTools and inspect the DOM structure</li>
          <li>Note any differences between the editors</li>
        </ol>
      </div>
    </div>
  );
}