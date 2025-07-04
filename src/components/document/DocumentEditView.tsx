'use client';

import { useState, useCallback } from 'react';
import { CleanAIEditor } from '@/components/editor/CleanAIEditor';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  documentType: 'sample' | 'generated' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface DocumentEditViewProps {
  document: Document;
  onBack: () => void;
  onUpdate: (document: Document) => void;
  onDelete: () => void;
}

export function DocumentEditView({ document, onBack, onUpdate, onDelete }: DocumentEditViewProps) {
  const { addToast } = useToast();
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(document.updatedAt));

  // Save document
  const saveDocument = useCallback(async (isManual = false) => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'Untitled Document',
          content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Map the updated document
        const updatedDocument: Document = {
          id: data.document.id,
          userId: data.document.clerk_user_id,
          title: data.document.title,
          content: data.document.content,
          documentType: data.document.document_type,
          createdAt: data.document.created_at,
          updatedAt: data.document.updated_at
        };

        setLastSaved(new Date());
        onUpdate(updatedDocument);
        
        if (isManual) {
          addToast('Document saved successfully!', 'success');
        }
      } else {
        throw new Error('Failed to save document');
      }
    } catch (error) {
      console.error('Save error:', error);
      if (isManual) {
        addToast('Failed to save document. Please try again.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  }, [title, content, document.id, onUpdate, addToast]);

  const handleManualSave = () => {
    saveDocument(true);
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'draft':
        return 'Draft';
      case 'generated':
        return 'AI Generated';
      case 'sample':
        return 'Writing Sample';
      default:
        return type;
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'draft':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'generated':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'sample':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    return date.toLocaleTimeString();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Button
              onClick={onBack}
              variant="secondary"
              className="text-gray-600"
            >
              ← Back to Dashboard
            </Button>
            
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                // Prevent event bubbling that might cause focus issues
                e.stopPropagation();
              }}
              placeholder="Untitled Document"
              className="text-xl font-semibold text-gray-900 bg-white border border-transparent rounded px-2 py-1 placeholder-gray-400 flex-1 max-w-md focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
              style={{
                direction: 'ltr'
              }}
            />

            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDocumentTypeColor(document.documentType)}`}>
              {getDocumentTypeLabel(document.documentType)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Saved {formatLastSaved(lastSaved)}
            </span>
            
            <Button
              onClick={handleManualSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            <Button
              onClick={onDelete}
              variant="secondary"
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto py-6 px-6">
          <CleanAIEditor
            initialContent={document.content}
            placeholder="Start writing..."
            onContentChange={setContent}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>{content.length} characters</span>
            <span>{content.split(/\s+/).filter(word => word.length > 0).length} words</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {isSaving && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}