import ReactMarkdown from 'react-markdown';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface MarkdownPreviewProps {
  content: string;
  onChange?: (content: string) => void;
}

export default function MarkdownPreview({ content, onChange }: MarkdownPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="h-full flex">
      {/* 編集エリア */}
      <div className="flex-1 overflow-y-auto p-8 border-r border-border">
        <Textarea
          value={content}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full h-full min-h-[calc(100vh-200px)] resize-none font-mono text-sm"
          placeholder="Markdownを入力..."
        />
      </div>
      
      {/* プレビューエリア */}
      <div className="flex-1 overflow-y-auto p-8 bg-background">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

