'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface AIQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onSubmitQuery: (query: string, selectedText: string) => void;
  isLoading?: boolean;
}

export function AIQueryModal({ 
  isOpen, 
  onClose, 
  selectedText, 
  onSubmitQuery, 
  isLoading = false 
}: AIQueryModalProps) {
  const [query, setQuery] = useState('');

  // Common suggestion buttons
  const quickSuggestions = [
    'Make this stronger',
    'Fix grammar and style',
    'Make it more concise',
    'Improve the flow',
    'Make it more formal',
    'Make it more conversational',
    'Add more detail',
    'Simplify the language'
  ];

  const handleSubmit = (customQuery?: string) => {
    const queryToUse = customQuery || query;
    if (queryToUse.trim() && selectedText.trim()) {
      onSubmitQuery(queryToUse.trim(), selectedText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Reset query when modal opens
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Improve with AI
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Selected Text Preview */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Selected text:</div>
          <div className="text-gray-900 bg-white p-3 rounded border italic">
            "{selectedText}"
          </div>
        </div>

        {/* Query Input */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How would you like to improve this text?
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., Make this more persuasive, Fix the grammar, Add more detail..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={isLoading}
            autoFocus
          />
          <div className="text-xs text-gray-500 mt-1">
            Press Cmd+Enter to submit
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Quick suggestions:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSubmit(suggestion)}
                disabled={isLoading}
                className="px-3 py-2 text-sm text-left border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmit()}
            disabled={!query.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Improving...</span>
              </div>
            ) : (
              'Improve Text'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}