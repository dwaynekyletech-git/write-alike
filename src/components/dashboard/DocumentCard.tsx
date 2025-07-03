import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui';
import { Document } from '@/types';

interface DocumentCardProps {
  document: Document;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'sample':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'generated':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'draft':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'sample':
        return 'Writing Sample';
      case 'generated':
        return 'AI Generated';
      case 'draft':
        return 'Draft';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPreviewText = (content: string) => {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\n/g, ' ');
    return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
  };

  return (
    <Link href={`/dashboard/document/${document.id}`}>
      <Card hover className="h-full">
        <CardContent className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-text-primary line-clamp-2 flex-1">
              {document.title}
            </h3>
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getDocumentTypeColor(document.documentType)}`}>
              {getDocumentTypeLabel(document.documentType)}
            </span>
          </div>

          {/* Preview */}
          <p className="text-sm text-text-secondary line-clamp-3">
            {getPreviewText(document.content)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-text-tertiary pt-2 border-t border-border">
            <span>Updated {formatDate(document.updatedAt)}</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{document.content.length > 0 ? `${Math.ceil(document.content.length / 1000)}k chars` : 'Empty'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};