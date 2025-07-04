'use client';

import { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createTextNode, $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';

import { SelectionPlugin, SelectionInfo } from './SelectionPlugin';
import { AIQueryButton } from './AIQueryButton';
import { AIQueryModal } from './AIQueryModal';
import { RevisionPreview } from './RevisionPreview';
import { useToast } from '@/components/ui/Toast';

interface CleanAIEditorProps {
  initialContent?: string;
  placeholder?: string;
  onContentChange?: (content: string) => void;
}

interface RevisionData {
  originalText: string;
  revisedText: string;
  explanation: string;
  confidence: number;
  changes: Array<{
    type: 'grammar' | 'style' | 'clarity' | 'tone' | 'structure' | 'word_choice';
    description: string;
  }>;
  query: string;
}

// Error boundary component for plugin-level error handling
class PluginErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Plugin error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div style={{ color: 'red', fontSize: '12px' }}>Plugin error occurred</div>;
    }

    return this.props.children;
  }
}


// Clean text replacement using Lexical's proper selection API
function TextReplacementPlugin({ 
  originalText, 
  revisedText, 
  selectionState,
  onComplete 
}: { 
  originalText: string; 
  revisedText: string;
  selectionState: any; // Preserved selection state
  onComplete: () => void; 
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    console.log('🔄 TextReplacementPlugin: Starting multi-strategy replacement');
    console.log('🔄 Original text:', JSON.stringify(originalText));
    console.log('🔄 Revised text:', JSON.stringify(revisedText));
    console.log('🔄 Selection state:', selectionState);
    
    let replacementSuccess = false;
    
    editor.update(() => {
      try {
        // Strategy 1: Direct selection replacement (if current selection matches)
        const currentSelection = $getSelection();
        if ($isRangeSelection(currentSelection) && !currentSelection.isCollapsed()) {
          const selectedText = currentSelection.getTextContent();
          if (selectedText === originalText) {
            console.log('✅ Strategy 1: Using current selection for direct replacement');
            currentSelection.insertText(revisedText);
            replacementSuccess = true;
            console.log('✅ Strategy 1: Text replacement completed');
            return;
          }
        }
        
        // Strategy 2: TextNode iteration (most reliable for any content structure)
        console.log('🔄 Strategy 2: Using TextNode iteration');
        const root = $getRoot();
        const textNodes: any[] = [];
        
        // Collect all text nodes recursively
        const collectTextNodes = (node: any) => {
          if (node.getType && node.getType() === 'text') {
            textNodes.push(node);
          } else if (node.getChildren && typeof node.getChildren === 'function') {
            const children = node.getChildren();
            children.forEach(collectTextNodes);
          }
        };
        
        collectTextNodes(root);
        console.log(`🔍 Strategy 2: Found ${textNodes.length} text nodes`);
        
        // Find target text across all text nodes
        let documentText = '';
        const nodePositions: Array<{node: any, start: number, end: number}> = [];
        
        textNodes.forEach(node => {
          const nodeText = node.getTextContent();
          const start = documentText.length;
          const end = start + nodeText.length;
          nodePositions.push({ node, start, end });
          documentText += nodeText;
        });
        
        const targetIndex = documentText.indexOf(originalText);
        
        if (targetIndex !== -1) {
          console.log(`✅ Strategy 2: Found target text at index ${targetIndex}`);
          const targetEnd = targetIndex + originalText.length;
          
          // Find which text nodes contain our target text
          const affectedNodes: Array<{node: any, localStart: number, localEnd: number}> = [];
          
          for (const {node, start, end} of nodePositions) {
            if (start < targetEnd && end > targetIndex) {
              const localStart = Math.max(0, targetIndex - start);
              const localEnd = Math.min(node.getTextContent().length, targetEnd - start);
              affectedNodes.push({ node, localStart, localEnd });
            }
          }
          
          if (affectedNodes.length === 1) {
            // Simple case: text is within a single node
            const {node, localStart, localEnd} = affectedNodes[0];
            const nodeText = node.getTextContent();
            const before = nodeText.substring(0, localStart);
            const after = nodeText.substring(localEnd);
            const newText = before + revisedText + after;
            
            node.setTextContent(newText);
            replacementSuccess = true;
            console.log('✅ Strategy 2: Single-node replacement completed');
            
          } else if (affectedNodes.length > 1) {
            // Complex case: text spans multiple nodes
            console.log('🔄 Strategy 2: Multi-node replacement');
            
            affectedNodes.forEach(({node, localStart, localEnd}, index) => {
              const nodeText = node.getTextContent();
              
              if (index === 0) {
                // First node: keep text before + add revised text
                const newText = nodeText.substring(0, localStart) + revisedText;
                node.setTextContent(newText);
              } else if (index === affectedNodes.length - 1) {
                // Last node: keep text after
                const newText = nodeText.substring(localEnd);
                node.setTextContent(newText);
              } else {
                // Middle nodes: clear completely
                node.setTextContent('');
              }
            });
            
            replacementSuccess = true;
            console.log('✅ Strategy 2: Multi-node replacement completed');
          }
        }
        
        // Strategy 3: Selection creation fallback (for edge cases)
        if (!replacementSuccess) {
          console.log('🔄 Strategy 3: Creating new selection for replacement');
          const fullText = root.getTextContent();
          const startIndex = fullText.indexOf(originalText);
          
          if (startIndex !== -1) {
            // Use the old method as final fallback
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.removeText();
              selection.insertText(revisedText);
              replacementSuccess = true;
              console.log('✅ Strategy 3: Selection-based replacement completed');
            }
          }
        }
        
        if (!replacementSuccess) {
          console.warn('⚠️ All replacement strategies failed');
          console.log('🔍 Document content:', JSON.stringify(root.getTextContent().substring(0, 100)) + '...');
          console.log('🔍 Target text:', JSON.stringify(originalText));
        }
        
      } catch (error) {
        console.error('❌ TextReplacementPlugin error:', error);
      }
    });
    
    // Complete the replacement
    setTimeout(() => {
      onComplete();
      if (replacementSuccess) {
        console.log('✅ Text replacement operation completed successfully');
      }
    }, 50);
  }, [editor, originalText, revisedText, selectionState, onComplete]);

  return null;
}

// Optimized plugin to track content changes with memoization
function OnChangePlugin({ 
  onChange 
}: { 
  onChange?: (content: string) => void; 
}) {
  const [editor] = useLexicalComposerContext();

  // Memoize the content change handler to prevent unnecessary re-registrations
  const memoizedOnChange = useCallback((content: string) => {
    if (onChange) {
      onChange(content);
    }
  }, [onChange]);

  useEffect(() => {
    if (!memoizedOnChange) return;
    
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root = $getRoot();
        const content = root.getTextContent();
        memoizedOnChange(content);
      });
    });
  }, [editor, memoizedOnChange]);

  return null;
}

// Plugin to capture editor reference
function EditorRefPlugin({ 
  setEditorRef 
}: { 
  setEditorRef: (editor: any) => void; 
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    setEditorRef(editor);
  }, [editor, setEditorRef]);

  return null;
}



export function CleanAIEditor({ 
  initialContent, 
  placeholder, 
  onContentChange 
}: CleanAIEditorProps) {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showRevisionPreview, setShowRevisionPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [preservedSelection, setPreservedSelection] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [revisionData, setRevisionData] = useState<RevisionData | null>(null);
  const [pendingReplacement, setPendingReplacement] = useState<{
    originalText: string;
    revisedText: string;
    selectionState: any;
  } | null>(null);
  const [isReplacementInProgress, setIsReplacementInProgress] = useState(false);
  
  const { addToast } = useToast();
  
  // Create a ref to store the editor instance
  const [editorRef, setEditorRef] = useState<any>(null);

  // Create initial editor state from content if provided
  const createInitialState = () => {
    if (!initialContent) return null;
    
    return () => {
      const root = $getRoot();
      root.clear();
      
      // Create content structure that matches natural typing
      if (initialContent.trim()) {
        // Split by double newlines for true paragraphs
        const paragraphs = initialContent.split(/\n\s*\n/);
        
        paragraphs.forEach((paragraphText) => {
          if (paragraphText.trim()) {
            const paragraphNode = $createParagraphNode();
            // Keep text as single node to match natural typing
            paragraphNode.append($createTextNode(paragraphText.trim()));
            root.append(paragraphNode);
          }
        });
        
        // If no double-newlines found, treat as single paragraph
        if (paragraphs.length === 1 && paragraphs[0] === initialContent) {
          root.clear();
          const paragraphNode = $createParagraphNode();
          paragraphNode.append($createTextNode(initialContent));
          root.append(paragraphNode);
        }
      } else {
        // Ensure at least one empty paragraph
        root.append($createParagraphNode());
      }
    };
  };

  // Using the same proven config as SimpleDocumentEditor
  const initialConfig = {
    namespace: 'CleanAIEditor',
    theme: {},
    editorState: createInitialState(),
    onError: (error: Error) => {
      console.error('Clean AI editor error:', error);
    },
  };

  const handleSelectionChange = useCallback((selectionInfo: SelectionInfo | null) => {
    setSelection(selectionInfo);
  }, []);

  const handleQueryClick = (text: string) => {
    console.log('🎯 CleanAIEditor: handleQueryClick called with text:', JSON.stringify(text));
    console.log('🎯 CleanAIEditor: Current selection state:', selection);
    setSelectedText(text);
    
    // Preserve the current selection state for later use in replacement
    if (editorRef) {
      editorRef.getEditorState().read(() => {
        const currentSelection = $getSelection();
        if ($isRangeSelection(currentSelection)) {
          // Store the selection state for use during replacement
          console.log('✅ CleanAIEditor: Preserving selection state for replacement');
          setPreservedSelection({
            anchorKey: currentSelection.anchor.key,
            anchorOffset: currentSelection.anchor.offset,
            focusKey: currentSelection.focus.key,
            focusOffset: currentSelection.focus.offset
          });
        } else {
          console.log('🔄 CleanAIEditor: No range selection available, using text-based fallback');
          setPreservedSelection(null);
        }
      });
    }
    
    setShowQueryModal(true);
  };

  const handleQuerySubmit = useCallback(async (query: string, text: string) => {
    setIsProcessing(true);
    setShowQueryModal(false);
    
    try {
      const response = await fetch('/api/ai/revise-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedText: text,
          query: query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Response Error:', response.status, errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to revise text`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        setRevisionData(data);
        setShowRevisionPreview(true);
      } else {
        throw new Error(data.error || 'Failed to revise text');
      }
    } catch (error) {
      console.error('Revision error:', error);
      addToast('Failed to revise text. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [addToast]);

  const handleAcceptRevision = (revisedText: string) => {
    if (isReplacementInProgress) {
      console.log('🔄 CleanAIEditor: Replacement already in progress, ignoring duplicate request');
      return;
    }
    
    console.log('🔄 CleanAIEditor: handleAcceptRevision called with:', {
      revisedText,
      hasRevisionData: !!revisionData,
      hasPreservedSelection: !!preservedSelection,
      revisionData,
      preservedSelection
    });
    
    if (revisionData) {
      console.log('🔄 CleanAIEditor: Starting text replacement with preserved selection');
      setIsAccepting(true);
      setIsReplacementInProgress(true);
      const replacementData = {
        originalText: revisionData.originalText,
        revisedText: revisedText,
        selectionState: preservedSelection
      };
      console.log('🔄 CleanAIEditor: Setting pendingReplacement to:', replacementData);
      setPendingReplacement(replacementData);
    } else {
      console.error('❌ CleanAIEditor: Missing revision data');
      console.error('   - revisionData:', revisionData);
      addToast('Error: Cannot replace text - revision data lost', 'error');
    }
  };

  // Debug when pendingReplacement changes
  useEffect(() => {
    if (pendingReplacement) {
      console.log('🔄 CleanAIEditor: pendingReplacement state changed, will render TextReplacementPlugin:', pendingReplacement);
    }
  }, [pendingReplacement]);

  const handleRejectRevision = () => {
    setShowRevisionPreview(false);
    setRevisionData(null);
    addToast('Revision rejected', 'info');
  };

  const handleReplacementComplete = useCallback(() => {
    console.log('🔄 CleanAIEditor: handleReplacementComplete called');
    setTimeout(() => {
      setIsAccepting(false);
      setIsReplacementInProgress(false);
      setShowRevisionPreview(false);
      setRevisionData(null);
      setPendingReplacement(null);
      setSelection(null);
      setPreservedSelection(null); // Clear preserved selection
      addToast('Text revised successfully!', 'success');
      console.log('✅ CleanAIEditor: Replacement cleanup completed');
    }, 0);
  }, [addToast]);

  const handleCloseQueryModal = () => {
    setShowQueryModal(false);
    setSelectedText('');
  };

  const handleCloseRevisionPreview = () => {
    setShowRevisionPreview(false);
    setRevisionData(null);
  };

  function EditorContent({ placeholder }: { placeholder?: string }) {
    return (
      <div style={{ position: 'relative', minHeight: '500px' }}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable 
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                lineHeight: '1.6',
                direction: 'ltr',
                textAlign: 'left',
                padding: '24px',
                minHeight: '500px',
                outline: 'none',
                border: 'none',
              }}
            />
          }
          placeholder={
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              color: '#9CA3AF',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              {placeholder || 'Start writing...'}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <PluginErrorBoundary>
          <OnChangePlugin onChange={onContentChange} />
        </PluginErrorBoundary>
        <PluginErrorBoundary>
          <EditorRefPlugin setEditorRef={setEditorRef} />
        </PluginErrorBoundary>
        <PluginErrorBoundary>
          <SelectionPlugin onSelectionChange={handleSelectionChange} />
        </PluginErrorBoundary>
        
        {/* Handle text replacement */}
        {pendingReplacement && (
          <PluginErrorBoundary>
            <TextReplacementPlugin
              originalText={pendingReplacement.originalText}
              revisedText={pendingReplacement.revisedText}
              selectionState={pendingReplacement.selectionState}
              onComplete={handleReplacementComplete}
            />
          </PluginErrorBoundary>
        )}
      </div>
    );
  }

  return (
    <>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        height: '100%',
        position: 'relative',
      }}>
        <LexicalComposer initialConfig={initialConfig}>
          <EditorContent placeholder={placeholder} />
        </LexicalComposer>
        
        {/* Show processing indicator */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Processing with AI...</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Query Button */}
      <AIQueryButton
        selection={selection}
        onQueryClick={handleQueryClick}
      />

      {/* AI Query Modal */}
      <AIQueryModal
        isOpen={showQueryModal}
        onClose={handleCloseQueryModal}
        selectedText={selectedText}
        onSubmitQuery={handleQuerySubmit}
        isLoading={isProcessing}
      />

      {/* Revision Preview Modal */}
      <RevisionPreview
        isOpen={showRevisionPreview}
        onClose={handleCloseRevisionPreview}
        revision={revisionData}
        onAccept={handleAcceptRevision}
        onReject={handleRejectRevision}
        isAccepting={isAccepting}
      />
    </>
  );
}