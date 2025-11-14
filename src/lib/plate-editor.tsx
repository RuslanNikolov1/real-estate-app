'use client';

import React, { useRef, useEffect } from 'react';

// Define Value type locally for Plate editor
export type Value = Array<{
  type?: string;
  children?: Array<{ text?: string }>;
}>;

export interface PlateEditorProps {
  value: Value;
  onChange: (value: Value) => void;
  placeholder?: string;
}

// Simple rich text editor using contentEditable
// This is a simplified version until Plate packages are properly configured
export function PlateEditor({ value, onChange, placeholder }: PlateEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && value) {
      // Convert value to HTML if it's a JSON structure
      try {
        if (typeof value === 'string') {
          editorRef.current.innerHTML = value;
        } else if (Array.isArray(value)) {
          // Convert Plate value to HTML
          const html = (value as Array<{ type?: string; children?: Array<{ text?: string }> }>)
            .map((node) => {
              if (node.type === 'p') {
                const text = node.children
                  ?.map((child) => (child as { text?: string }).text || '')
                  .join('') || '';
                return `<p>${text}</p>`;
              }
              return '';
            })
            .join('');
          editorRef.current.innerHTML = html || '';
        }
      } catch (error) {
        console.error('Error parsing value:', error);
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // Convert HTML to Plate value structure
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const paragraphs = doc.querySelectorAll('p');
      
      const plateValue: Value = Array.from(paragraphs).map((p: HTMLParagraphElement) => ({
        type: 'p',
        children: [{ text: p.textContent || '' }],
      }));

      if (plateValue.length === 0) {
        plateValue.push({
          type: 'p',
          children: [{ text: '' }],
        });
      }

      onChange(plateValue);
    }
  };

  return (
    <div className="rich-text-editor">
      <div className="toolbar">
        <button
          type="button"
          onClick={() => document.execCommand('bold', false)}
          className="toolbar-button"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => document.execCommand('italic', false)}
          className="toolbar-button"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => document.execCommand('underline', false)}
          className="toolbar-button"
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) {
              document.execCommand('createLink', false, url);
            }
          }}
          className="toolbar-button"
          title="Insert Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter image URL:');
            if (url) {
              document.execCommand('insertImage', false, url);
            }
          }}
          className="toolbar-button"
          title="Insert Image"
        >
          🖼️
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="editor-content"
        data-placeholder={placeholder || 'Въведете текст...'}
        suppressContentEditableWarning
      />
      <style jsx>{`
        .rich-text-editor {
          border: 1px solid #f4f4f4;
          border-radius: 12px;
          overflow: hidden;
          background: white;
        }
        .toolbar {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: #f4f4f4;
          border-bottom: 1px solid #e0e0e0;
        }
        .toolbar-button {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toolbar-button:hover {
          background: #e0e0e0;
        }
        .editor-content {
          min-height: 300px;
          padding: 16px;
          outline: none;
          font-size: 1rem;
          line-height: 1.6;
          color: #222;
        }
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #999;
        }
        .editor-content p {
          margin: 0 0 12px 0;
        }
        .editor-content p:last-child {
          margin-bottom: 0;
        }
        .editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .editor-content a {
          color: #e10600;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
