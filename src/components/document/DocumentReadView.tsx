'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface Document {
  id: string;
  userId: string;
  title: string;
  content: string;
  documentType: 'sample' | 'generated' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface DocumentReadViewProps {
  document: Document;
  onBack: () => void;
  onDelete: () => void;
}

export function DocumentReadView({ document, onBack, onDelete }: DocumentReadViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  };

  const getReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  };

  const wordCount = getWordCount(document.content);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={onBack}
              variant="secondary"
              className="text-gray-600"
            >
              ← Back to Dashboard
            </Button>

            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-sm font-medium rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                Writing Sample
              </span>
              
              <Button
                onClick={onDelete}
                variant="secondary"
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {document.title}
            </h1>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Uploaded {formatDate(document.createdAt)}</span>
              <span>•</span>
              <span>{wordCount.toLocaleString()} words</span>
              <span>•</span>
              <span>{getReadingTime(wordCount)}</span>
              <span>•</span>
              <span>{document.content.length.toLocaleString()} characters</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              <div 
                className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '18px',
                  lineHeight: '1.7'
                }}
              >
                {document.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Card */}
        <Card className="mt-6 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Document Analysis
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {wordCount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Words</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {document.content.split(/[.!?]+/).filter(s => s.trim().length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Sentences</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {document.content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Paragraphs</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {getReadingTime(wordCount)}
                </div>
                <div className="text-sm text-gray-600">Reading Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}