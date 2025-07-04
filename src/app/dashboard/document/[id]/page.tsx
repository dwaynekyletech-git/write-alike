'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Loading } from '@/components/ui/Spinner';
import { DocumentEditView } from '@/components/document/DocumentEditView';
import { DocumentReadView } from '@/components/document/DocumentReadView';

interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  documentType: 'sample' | 'generated' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string>('');

  // Extract document ID from params
  useEffect(() => {
    params.then(({ id }) => {
      setDocumentId(id);
    });
  }, [params]);

  // Fetch document when ID is available
  useEffect(() => {
    if (!documentId) return;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/documents/${documentId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Document not found');
          }
          throw new Error('Failed to fetch document');
        }

        const data = await response.json();
        
        // Map database fields to frontend types
        const mappedDocument: Document = {
          id: data.document.id,
          userId: data.document.clerk_user_id,
          title: data.document.title,
          content: data.document.content,
          documentType: data.document.document_type,
          createdAt: data.document.created_at,
          updatedAt: data.document.updated_at
        };

        setDocument(mappedDocument);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
        setError(errorMessage);
        addToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, addToast]);

  // Handle navigation back to dashboard
  const handleBack = () => {
    router.push('/dashboard');
  };

  // Handle document updates
  const handleDocumentUpdate = (updatedDocument: Document) => {
    setDocument(updatedDocument);
  };

  // Handle document deletion
  const handleDocumentDelete = async () => {
    if (!document) return;

    // Using browser confirm for now - could be replaced with a custom modal
    if (confirm(`Are you sure you want to delete "${document.title}"?`)) {
      try {
        const response = await fetch(`/api/documents/${document.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          addToast('Document deleted successfully', 'success');
          router.push('/dashboard');
        } else {
          throw new Error('Failed to delete document');
        }
      } catch (err) {
        addToast('Failed to delete document', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading message="Loading document..." size="lg" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Document not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            The document you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Route to appropriate view based on document type
  if (document.documentType === 'sample') {
    // Writing samples are read-only
    return (
      <DocumentReadView
        document={document}
        onBack={handleBack}
        onDelete={handleDocumentDelete}
      />
    );
  } else {
    // Drafts and AI generated content are editable
    return (
      <DocumentEditView
        document={document}
        onBack={handleBack}
        onUpdate={handleDocumentUpdate}
        onDelete={handleDocumentDelete}
      />
    );
  }
}