import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  filter: 'all' | 'sample' | 'generated' | 'draft';
}

export const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const getEmptyStateContent = () => {
    switch (filter) {
      case 'sample':
        return {
          icon: (
            <svg className="w-12 h-12 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ),
          title: 'No writing samples yet',
          description: 'Upload your writing samples to help AI learn your unique style and voice.',
          actionText: 'Upload Samples',
          actionHref: '/dashboard/samples/upload'
        };
      case 'generated':
        return {
          icon: (
            <svg className="w-12 h-12 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          ),
          title: 'No AI-generated content yet',
          description: 'Generate your first document by providing a topic. AI will write in your style.',
          actionText: 'Generate Content',
          actionHref: '/dashboard/generate'
        };
      case 'draft':
        return {
          icon: (
            <svg className="w-12 h-12 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ),
          title: 'No drafts yet',
          description: 'Start writing your first draft or generate content with AI assistance.',
          actionText: 'New Document',
          actionHref: '/dashboard/new'
        };
      default:
        return {
          icon: (
            <svg className="w-12 h-12 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          title: 'Welcome to Write Alike',
          description: 'Start by uploading writing samples so AI can learn your style, then create your first document.',
          actionText: 'Get Started',
          actionHref: '/dashboard/samples/upload'
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <div className="text-center py-16">
      <div className="mb-6">
        {content.icon}
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {content.title}
      </h3>
      <p className="text-text-secondary mb-8 max-w-md mx-auto">
        {content.description}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link href={content.actionHref}>
          <Button variant="primary" size="md">
            {content.actionText}
          </Button>
        </Link>
        {filter === 'all' && (
          <Link href="/dashboard/new">
            <Button variant="secondary" size="md">
              New Document
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};