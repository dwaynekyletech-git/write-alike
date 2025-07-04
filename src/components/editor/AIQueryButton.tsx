'use client';

import { useState, useEffect } from 'react';
import { SelectionInfo } from './SelectionPlugin';

interface AIQueryButtonProps {
  selection: SelectionInfo | null;
  onQueryClick: (selectedText: string) => void;
}

export function AIQueryButton({ selection, onQueryClick }: AIQueryButtonProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (selection && selection.rect) {
      const rect = selection.rect;
      const buttonWidth = 140; // Approximate width of the button
      const buttonHeight = 36; // Approximate height of the button
      
      // Calculate position above the selection
      const top = rect.top + window.scrollY - buttonHeight - 8; // 8px gap above selection
      let left = rect.left + window.scrollX + (rect.width / 2) - (buttonWidth / 2);
      
      // Ensure button doesn't go off screen
      const windowWidth = window.innerWidth;
      if (left < 10) left = 10;
      if (left + buttonWidth > windowWidth - 10) left = windowWidth - buttonWidth - 10;
      
      setPosition({ top, left });
    } else {
      setPosition(null);
    }
  }, [selection]);

  if (!selection || !position || selection.text.trim().length === 0) {
    return null;
  }

  return (
    <div
      className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-200"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <button
        onClick={() => onQueryClick(selection.text)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium text-gray-700"
      >
        <svg
          className="w-4 h-4 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span>Improve with AI</span>
      </button>
    </div>
  );
}