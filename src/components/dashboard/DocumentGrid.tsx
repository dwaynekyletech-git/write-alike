'use client';

import React, { useState, useEffect } from 'react';
import { DocumentCard } from './DocumentCard';
import { EmptyState } from './EmptyState';
import { Button } from '@/components/ui';
import { Document } from '@/types';

interface DocumentGridProps {
  userId: string;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({ userId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'sample' | 'generated' | 'draft'>('all');

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const filterParam = filter !== 'all' ? `?type=${filter}` : '';
      const response = await fetch(`/api/documents${filterParam}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      // Map database fields (snake_case) to frontend types (camelCase)
      const mappedDocuments = (data.documents || []).map((doc: any) => ({
        id: doc.id,
        userId: doc.clerk_user_id,
        title: doc.title,
        content: doc.content,
        documentType: doc.document_type,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      }));
      setDocuments(mappedDocuments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, filter]);

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.documentType === filter;
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-surface rounded-lg border border-border p-4 space-y-3">
              <div className="h-4 bg-border rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-border rounded"></div>
                <div className="h-3 bg-border rounded w-5/6"></div>
              </div>
              <div className="h-3 bg-border rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-error mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Failed to load documents
        </h3>
        <p className="text-text-secondary mb-4">{error}</p>
        <Button onClick={fetchDocuments} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {[
          { key: 'all', label: 'All Documents' },
          { key: 'draft', label: 'Drafts' },
          { key: 'generated', label: 'AI Generated' },
          { key: 'sample', label: 'Writing Samples' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as 'all' | 'sample' | 'generated' | 'draft')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
};