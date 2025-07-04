'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

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

interface RevisionPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  revision: RevisionData | null;
  onAccept: (revisedText: string) => void;
  onReject: () => void;
  isAccepting?: boolean;
}

export function RevisionPreview({ 
  isOpen, 
  onClose, 
  revision, 
  onAccept, 
  onReject, 
  isAccepting = false 
}: RevisionPreviewProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !revision) return null;

  const handleAccept = () => {
    onAccept(revision.revisedText);
  };

  const handleReject = () => {
    onReject();
  };

  const getChangeTypeColor = (type: string) => {
    const colors = {
      grammar: 'bg-red-100 text-red-800',
      style: 'bg-blue-100 text-blue-800',
      clarity: 'bg-green-100 text-green-800',
      tone: 'bg-purple-100 text-purple-800',
      structure: 'bg-yellow-100 text-yellow-800',
      word_choice: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getChangeTypeLabel = (type: string) => {
    const labels = {
      grammar: 'Grammar',
      style: 'Style',
      clarity: 'Clarity',
      tone: 'Tone',
      structure: 'Structure',
      word_choice: 'Word Choice'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                AI Revision Preview
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Request: "{revision.query}"
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">Confidence:</span>
                <div className="flex items-center space-x-1">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${revision.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(revision.confidence * 100)}%
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isAccepting}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original Text */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Original
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{revision.originalText}</p>
              </div>
            </div>

            {/* Revised Text */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Revised
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{revision.revisedText}</p>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Explanation</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {revision.explanation}
            </p>
          </div>

          {/* Changes Details */}
          {revision.changes && revision.changes.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                <span>Changes Made ({revision.changes.length})</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDetails && (
                <div className="mt-3 space-y-2">
                  {revision.changes.map((change, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getChangeTypeColor(change.type)}`}>
                        {getChangeTypeLabel(change.type)}
                      </span>
                      <p className="text-sm text-gray-700 flex-1">{change.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <Button
            onClick={handleReject}
            variant="secondary"
            disabled={isAccepting}
          >
            Keep Original
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isAccepting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Applying...</span>
              </div>
            ) : (
              'Accept Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}