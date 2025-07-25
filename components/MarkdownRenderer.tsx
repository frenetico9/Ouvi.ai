
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    // A more robust implementation would use a proper parser.
    // This is a simplified version for demonstration.
    const blocks = content.split('\n\n');

    return blocks.map((block, index) => {
      // Unordered lists
      if (block.match(/^(\s*(\*|-)\s.*(?:\n|$))+/)) {
        const items = block.split('\n').filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'));
        return (
          <ul key={index} className="list-disc list-inside space-y-1 my-2">
            {items.map((item, i) => (
              <li key={i}>{parseInline(item.replace(/^\s*(\*|-)\s/, ''))}</li>
            ))}
          </ul>
        );
      }
      
      // Paragraphs
      return <p key={index} className="my-2">{parseInline(block)}</p>;
    });
  };

  const parseInline = (text: string) => {
    // **bold**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // `code`
    text = text.replace(/`(.*?)`/g, '<code class="bg-slate-700 text-cyan-300 px-1 py-0.5 rounded text-sm">$1</code>');
    
    const parts = text.split(/(<strong>.*?<\/strong>|<code.*?>.*?<\/code>)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('<strong>') || part.startsWith('<code>')) {
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return <div className="prose prose-invert prose-p:my-0">{renderContent()}</div>;
};

export default MarkdownRenderer;
