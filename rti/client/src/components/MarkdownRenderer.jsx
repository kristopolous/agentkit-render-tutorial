import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import Prism from 'prismjs';

// Import Prism CSS themes - we're using a dark theme to match our UI
import 'prismjs/themes/prism-tomorrow.css';

// Import additional languages support
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

function MarkdownRenderer({ markdown }) {
  const markdownRef = useRef(null);

  useEffect(() => {
    // Set up Prism highlighting for code blocks
    marked.setOptions({
      highlight: function(code, lang) {
        if (Prism.languages[lang]) {
          return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
      }
    });

    // Highlight all code blocks after rendering
    if (markdownRef.current) {
      Prism.highlightAllUnder(markdownRef.current);
    }
  }, [markdown]);

  // Convert markdown to HTML
  const renderMarkdown = () => {
    if (!markdown) return '';
    return marked(markdown);
  };

  return (
    <div 
      className="markdown-content" 
      ref={markdownRef} 
      dangerouslySetInnerHTML={{ __html: renderMarkdown() }}
    />
  );
}

export default MarkdownRenderer;