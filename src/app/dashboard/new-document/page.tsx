'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CleanAIEditor } from '@/components/editor/CleanAIEditor';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function NewDocumentPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  // Auto-save functionality
  const saveDocument = useCallback(async (isManual = false) => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    try {
      let response;
      
      if (documentId) {
        // Update existing document
        response = await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title || 'Untitled Document',
            content,
          }),
        });
      } else {
        // Create new document
        response = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title || 'Untitled Document',
            content,
            documentType: 'draft',
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (!documentId) {
          setDocumentId(data.document.id);
        }
        setLastSaved(new Date());
        
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
  }, [title, content, documentId]);

  // Auto-save every 30 seconds when there are changes
  useEffect(() => {
    if (title.trim() || content.trim()) {
      const autoSaveTimer = setTimeout(() => {
        saveDocument();
      }, 30000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [title, content, saveDocument]);

  const handleManualSave = () => {
    saveDocument(true);
  };

  const handleClose = () => {
    if (title.trim() || content.trim()) {
      if (confirm('You have unsaved changes. Do you want to save before leaving?')) {
        saveDocument(true).then(() => {
          router.push('/dashboard');
        });
      } else {
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
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
              onClick={handleClose}
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
          </div>

          <div className="flex items-center space-x-4">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                Saved {formatLastSaved(lastSaved)}
              </span>
            )}
            
            <Button
              onClick={handleManualSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto py-6 px-6">
          <CleanAIEditor
            placeholder="Start writing your document..."
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