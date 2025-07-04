'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, SELECTION_CHANGE_COMMAND, $getRoot } from 'lexical';
import { useEffect, useState } from 'react';

export interface SelectionInfo {
  text: string;
  anchorOffset: number;
  focusOffset: number;
  isCollapsed: boolean;
  rect: DOMRect | null;
  documentStartOffset?: number;
  documentEndOffset?: number;
}

interface SelectionPluginProps {
  onSelectionChange: (selection: SelectionInfo | null) => void;
}

export function SelectionPlugin({ onSelectionChange }: SelectionPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [activeSelection, setActiveSelection] = useState<SelectionInfo | null>(null);

  // Early return if editor is not ready
  if (!editor) {
    return null;
  }


  useEffect(() => {
    const updateSelection = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        
        if ($isRangeSelection(selection)) {
          const selectedText = selection.getTextContent();
          const isCollapsed = selection.isCollapsed();
          
          // Enhanced selection validation with safer offset checking
          const anchorNode = selection.anchor.getNode();
          const focusNode = selection.focus.getNode();
          const anchorMaxOffset = anchorNode?.getTextContentSize?.() || 0;
          const focusMaxOffset = focusNode?.getTextContentSize?.() || 0;
          
          const hasValidSelection = selectedText.trim().length > 0 && 
                                  !isCollapsed && 
                                  selectedText.length <= 10000 && // Prevent extremely large selections
                                  !selectedText.includes('\uFEFF') && // Filter out zero-width characters
                                  selection.anchor.offset <= anchorMaxOffset &&
                                  selection.focus.offset <= focusMaxOffset; // Validate offsets
          
          // Debug validation issues
          if (selectedText.trim().length > 0 && !isCollapsed) {
            if (selection.anchor.offset > anchorMaxOffset) {
              console.warn('⚠️ SelectionPlugin: Invalid anchor offset', {
                anchorOffset: selection.anchor.offset,
                maxOffset: anchorMaxOffset,
                nodeContent: anchorNode?.getTextContent()
              });
            }
            if (selection.focus.offset > focusMaxOffset) {
              console.warn('⚠️ SelectionPlugin: Invalid focus offset', {
                focusOffset: selection.focus.offset,
                maxOffset: focusMaxOffset,
                nodeContent: focusNode?.getTextContent()
              });
            }
          }
          
          if (hasValidSelection) {
            
            // Get the DOM selection to calculate position
            const domSelection = window.getSelection();
            let rect: DOMRect | null = null;
            
            try {
              if (domSelection && domSelection.rangeCount > 0) {
                const range = domSelection.getRangeAt(0);
                rect = range.getBoundingClientRect();
                
                // Validate rect has meaningful dimensions
                if (rect && (rect.width === 0 && rect.height === 0)) {
                  // Try to get a better rect by cloning and modifying the range
                  const clonedRange = range.cloneRange();
                  clonedRange.collapse(false); // Collapse to end
                  const tempRect = clonedRange.getBoundingClientRect();
                  if (tempRect.width > 0 || tempRect.height > 0) {
                    rect = tempRect;
                  }
                }
              }
            } catch (error) {
              console.error('SelectionPlugin: Error getting selection rect:', error);
            }
            
            // Calculate document-level offsets with validation
            const root = $getRoot();
            const fullText = root.getTextContent();
            
            // Try exact match
            const documentStartOffset = fullText.indexOf(selectedText);
            let documentEndOffset = undefined;
            
            if (documentStartOffset !== -1) {
              const calculatedEndOffset = documentStartOffset + selectedText.length;
              // Validate the end offset doesn't exceed document length
              documentEndOffset = Math.min(calculatedEndOffset, fullText.length);
            }
            
            const selectionInfo: SelectionInfo = {
              text: selectedText,
              anchorOffset: selection.anchor.offset,
              focusOffset: selection.focus.offset,
              isCollapsed: selection.isCollapsed(),
              rect,
              documentStartOffset: documentStartOffset !== -1 ? documentStartOffset : undefined,
              documentEndOffset
            };
            
            setActiveSelection(selectionInfo);
            onSelectionChange(selectionInfo);
          } else {
            setActiveSelection(null);
            onSelectionChange(null);
          }
        } else {
          setActiveSelection(null);
          onSelectionChange(null);
        }
      });
    };

    // Listen for selection changes
    const removeListener = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateSelection();
        return false;
      },
      1 // Priority
    );

    // Also listen for mouseup events to catch selections
    const handleMouseUp = () => {
      // Small delay to ensure selection is finalized
      setTimeout(updateSelection, 10);
    };

    // Listen for keyboard events that might change selection
    const handleKeyUp = (event: KeyboardEvent) => {
      // Handle arrow keys, shift+arrow, etc.
      if (event.key.includes('Arrow') || event.key === 'Home' || event.key === 'End') {
        setTimeout(updateSelection, 10);
      }
    };

    const editorElement = editor.getRootElement();
    
    if (editorElement) {
      editorElement.addEventListener('mouseup', handleMouseUp);
      editorElement.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      removeListener();
      if (editorElement) {
        editorElement.removeEventListener('mouseup', handleMouseUp);
        editorElement.removeEventListener('keyup', handleKeyUp);
      }
    };
  }, [editor, onSelectionChange]);

  return null; // This plugin doesn't render anything
}