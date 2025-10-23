import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="h-full overflow-y-auto bg-background p-8">
      <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

