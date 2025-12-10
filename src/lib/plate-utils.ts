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
 * Escapes HTML special characters to prevent XSS attacks
 * Works in both client and server contexts
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Convert Plate editor JSON value to HTML
 * Useful for displaying rich text content
 * Note: Text content is escaped to prevent XSS attacks
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
              // Escape HTML in string values
              return escapeHtml(child);
            }
            if (child && typeof child === 'object' && 'text' in child) {
              // Escape HTML content before wrapping in tags
              const textContent = escapeHtml(child.text || '');
              // Handle formatting (bold, italic, etc.)
              if (child.bold) {
                return `<strong>${textContent}</strong>`;
              }
              if (child.italic) {
                return `<em>${textContent}</em>`;
              }
              if (child.underline) {
                return `<u>${textContent}</u>`;
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



















