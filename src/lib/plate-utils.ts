import type { Value } from '@/lib/plate-editor';

/**
 * Convert Plate editor JSON value to plain text
 * Extracts all text content from the Plate value structure
 */
export function plateValueToPlainText(value: Value): string {
  if (!value || !Array.isArray(value)) {
    return '';
  }

  return value
    .map((node) => {
      if (node.children && Array.isArray(node.children)) {
        return node.children
          .map((child: any) => {
            if (typeof child === 'string') {
              return child;
            }
            if (child && typeof child === 'object' && 'text' in child) {
              return child.text || '';
            }
            return '';
          })
          .join('');
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Convert Plate editor JSON value to HTML
 * Useful for displaying rich text content
 */
export function plateValueToHTML(value: Value): string {
  if (!value || !Array.isArray(value)) {
    return '';
  }

  return value
    .map((node) => {
      if (node.type === 'p' && node.children) {
        const text = node.children
          .map((child: any) => {
            if (typeof child === 'string') {
              return child;
            }
            if (child && typeof child === 'object' && 'text' in child) {
              let textContent = child.text || '';
              // Handle formatting (bold, italic, etc.)
              if (child.bold) {
                textContent = `<strong>${textContent}</strong>`;
              }
              if (child.italic) {
                textContent = `<em>${textContent}</em>`;
              }
              if (child.underline) {
                textContent = `<u>${textContent}</u>`;
              }
              return textContent;
            }
            return '';
          })
          .join('');
        return `<p>${text}</p>`;
      }
      return '';
    })
    .filter(Boolean)
    .join('');
}










