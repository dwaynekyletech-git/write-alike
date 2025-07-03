'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  $getNodeByKey,
  $createParagraphNode,
} from 'lexical';
import {
  $isHeadingNode,
  $createHeadingNode,
  HeadingTagType,
} from '@lexical/rich-text';
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

const LowPriority = 1;

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNodeByKey(elementKey);
          const type = $isListNode(parentList) ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          setBlockType(type);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      LowPriority,
    );
  }, [editor, updateToolbar]);

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach((node) => {
            const parent = node.getParent();
            if (parent) {
              const heading = $createHeadingNode(headingSize);
              parent.replace(heading);
              heading.append(...parent.getChildren());
            }
          });
        }
      });
    }
  };

  const formatList = (listType: 'bullet' | 'number') => {
    if (listType === 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode; 
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${isActive 
          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
        }
      `}
    >
      {children}
    </button>
  );

  const DropdownButton = ({ 
    value, 
    onChange, 
    options 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    options: { value: string; label: string }[];
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const blockTypeOptions = [
    { value: 'paragraph', label: 'Normal' },
    { value: 'h1', label: 'Heading 1' },
    { value: 'h2', label: 'Heading 2' },
    { value: 'h3', label: 'Heading 3' },
  ];

  const handleBlockTypeChange = (newBlockType: string) => {
    if (newBlockType === 'paragraph') {
      // Convert heading to paragraph
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const nodes = selection.getNodes();
          nodes.forEach((node) => {
            const parent = node.getParent();
            if (parent && $isHeadingNode(parent)) {
              const paragraph = $createParagraphNode();
              parent.replace(paragraph);
              paragraph.append(...parent.getChildren());
            }
          });
        }
      });
    } else if (['h1', 'h2', 'h3'].includes(newBlockType)) {
      formatHeading(newBlockType as HeadingTagType);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
      {/* Block Type Dropdown */}
      <DropdownButton
        value={blockType}
        onChange={handleBlockTypeChange}
        options={blockTypeOptions}
      />

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => formatText('bold')}
        isActive={isBold}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => formatText('italic')}
        isActive={isItalic}
        title="Italic (Ctrl+I)"
      >
        <em>I</em>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => formatText('underline')}
        isActive={isUnderline}
        title="Underline (Ctrl+U)"
      >
        <u>U</u>
      </ToolbarButton>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <ToolbarButton
        onClick={() => formatList('bullet')}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        onClick={() => formatList('number')}
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </ToolbarButton>
    </div>
  );
}