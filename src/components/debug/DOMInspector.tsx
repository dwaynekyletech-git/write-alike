'use client';

import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical';

export function DOMInspector() {
  const [editor] = useLexicalComposerContext();
  const [domInfo, setDomInfo] = useState<any>({});

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const selection = $getSelection();
        
        // Get DOM element
        const domElement = editor.getRootElement();
        const computedStyle = domElement ? window.getComputedStyle(domElement) : null;
        
        // Inspect text nodes
        const textNodes: any[] = [];
        if (domElement) {
          const walker = document.createTreeWalker(
            domElement,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          while (node = walker.nextNode()) {
            if (node.textContent?.trim()) {
              textNodes.push({
                content: node.textContent,
                parentElement: node.parentElement?.tagName,
                computedStyle: node.parentElement ? {
                  direction: window.getComputedStyle(node.parentElement).direction,
                  writingMode: window.getComputedStyle(node.parentElement).writingMode,
                  textAlign: window.getComputedStyle(node.parentElement).textAlign,
                  unicodeBidi: window.getComputedStyle(node.parentElement).unicodeBidi,
                } : null
              });
            }
          }
        }

        setDomInfo({
          rootHTML: domElement?.innerHTML,
          rootTextContent: domElement?.textContent,
          computedStyles: computedStyle ? {
            direction: computedStyle.direction,
            writingMode: computedStyle.writingMode,
            textAlign: computedStyle.textAlign,
            unicodeBidi: computedStyle.unicodeBidi,
            whiteSpace: computedStyle.whiteSpace,
            wordWrap: computedStyle.wordWrap,
          } : null,
          textNodes,
          selection: $isRangeSelection(selection) ? {
            anchorOffset: selection.anchor.offset,
            focusOffset: selection.focus.offset,
            isCollapsed: selection.isCollapsed(),
            isBackward: selection.isBackward(),
          } : null,
          lexicalState: {
            rootChildrenCount: root.getChildrenSize(),
            rootType: root.getType(),
          }
        });
      });
    });

    return unregister;
  }, [editor]);

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '10px', 
      border: '1px solid #ccc',
      backgroundColor: '#f9f9f9',
      fontSize: '12px',
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <h4>DOM Inspector</h4>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(domInfo, null, 2)}
      </pre>
    </div>
  );
}