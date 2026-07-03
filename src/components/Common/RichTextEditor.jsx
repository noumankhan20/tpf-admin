import React, { useRef, useEffect } from 'react';

export default function RichTextEditor({ value, onChange, placeholder, className, style, id }) {
  const editorRef = useRef(null);

  // Convert database string (replaces newlines with <br> for rich text area)
  const toHTML = (text) => {
    if (!text) return "";
    return text.replace(/\n/g, "<br>");
  };

  // Convert HTML back to clean string with only <b>, <i>, <u> tags and \n newlines
  const toBackendFormat = (html) => {
    if (!html) return "";
    let clean = html;

    // Normalize formatting tags
    clean = clean.replace(/<strong>/g, "<b>").replace(/<\/strong>/g, "</b>");
    clean = clean.replace(/<em>/g, "<i>").replace(/<\/em>/g, "</i>");

    // Remove dummy browser br tags right before closing block tags to avoid double spacing
    clean = clean.replace(/<br\s*\/?>\s*<\/div>/gi, "</div>");
    clean = clean.replace(/<br\s*\/?>\s*<\/p>/gi, "</p>");

    // Replace linebreaks and block containers with newlines
    clean = clean.replace(/<br\s*\/?>/gi, "\n");
    clean = clean.replace(/<\/div>/gi, "\n").replace(/<\/p>/gi, "\n");
    clean = clean.replace(/<div[^>]*>/gi, "").replace(/<p[^>]*>/gi, "");

    // Strip everything else except <b>, <i>, and <u>
    clean = clean.replace(/<(?!b\b|i\b|u\b|\/b\b|\/i\b|\/u\b)[^>]+>/gi, "");

    // Automatic sentence spacing: punctuation followed by space/newlines gets converted to exactly \n\n (one line space).
    // Avoid formatting if preceded by common abbreviations or single uppercase letters (initials).
    const sentenceEndRegex = /(?<!\b(?:Mr|Mrs|Ms|Dr|Prof|Sr|Jr|Co|Corp|Inc|Ltd|vs|e\.g|i\.e))(?<!\b[A-Z])([.?!])((?:<\/b>|<\/i>|<\/u>)*)\s+(?=(?:<b>|<i>|<u>)*[A-Za-z0-9])/gi;
    clean = clean.replace(sentenceEndRegex, "$1$2\n\n");

    // Collapse consecutive newlines (3 or more) to exactly \n\n
    clean = clean.replace(/\n\s*\n\s*\n+/g, "\n\n");

    return clean.trim();
  };

  useEffect(() => {
    if (editorRef.current) {
      const expectedHTML = toHTML(value || "");
      // Only overwrite innerHTML if the editor is not currently focused
      // to prevent caret jumping, selection loss, and input blocks (backspace/enter)
      if (document.activeElement !== editorRef.current) {
        if (editorRef.current.innerHTML !== expectedHTML) {
          editorRef.current.innerHTML = expectedHTML;
        }
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(toBackendFormat(editorRef.current.innerHTML));
    }
  };

  const executeCommand = (command) => {
    document.execCommand(command, false, null);
    handleInput();
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex gap-1.5 p-2 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="px-2.5 py-1 hover:bg-gray-200 rounded font-bold text-sm text-gray-700 transition-colors"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="px-2.5 py-1 hover:bg-gray-200 rounded italic text-sm text-gray-700 transition-colors"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          className="px-2.5 py-1 hover:bg-gray-200 rounded underline text-sm text-gray-700 transition-colors"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className={`focus:outline-none min-h-[120px] p-4 text-sm text-gray-900 ${className || ''}`}
          style={style}
          id={id}
        />
        {(!value || value.trim() === "") && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none select-none text-sm">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
