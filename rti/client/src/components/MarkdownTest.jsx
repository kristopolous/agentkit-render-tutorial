import { useState } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

function MarkdownTest() {
  const [markdownText, setMarkdownText] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTextChange = (e) => {
    setMarkdownText(e.target.value);
  };

  const handleTestMarkdown = async () => {
    if (!markdownText.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Send result to main content area
      const event = new CustomEvent('markdown-render', { 
        detail: { 
          html: '', // We're not using this anymore 
          originalMarkdown: markdownText 
        } 
      });
      window.dispatchEvent(event);
      
      // Show the preview
      setShowPreview(true);
    } catch (error) {
      console.error('Error processing markdown:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Example markdown to help users
  const exampleMarkdown = 
`### Example Markdown

You can write formatted text with **bold** and *italic*.

\`\`\`javascript
// Code with syntax highlighting
function hello() {
  console.log("Hello world!");
}
\`\`\`

\`\`\`bash
# Shell commands
npm install
npm start
\`\`\`

- Bullet points
- Another item

> Blockquotes look like this
`;

  return (
    <div className="markdown-test">
      <h3>Test Markdown Rendering</h3>
      <textarea
        value={markdownText}
        onChange={handleTextChange}
        placeholder={exampleMarkdown}
        rows={6}
        disabled={isProcessing}
      ></textarea>
      <button 
        className="test-markdown-button"
        onClick={handleTestMarkdown}
        disabled={isProcessing || !markdownText.trim()}
      >
        {isProcessing ? 'Processing...' : 'Test Markdown'}
      </button>
      
      {showPreview && (
        <div className="preview">
          <h4>Preview:</h4>
          <div className="preview-content">
            <MarkdownRenderer markdown={markdownText} />
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkdownTest;