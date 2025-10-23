import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BookOpen, Save, X } from 'lucide-react';

interface SynopsisEditorProps {
  synopsis: string;
  onSave: (synopsis: string) => void;
  onClose: () => void;
}

export default function SynopsisEditor({ synopsis, onSave, onClose }: SynopsisEditorProps) {
  const [content, setContent] = useState(synopsis);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(synopsis);
    setHasChanges(false);
  }, [synopsis]);

  const handleSave = () => {
    onSave(content);
    setHasChanges(false);
  };

  const handleChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== synopsis);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">あらすじ</h2>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="default" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              保存
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* エディタ */}
      <div className="flex-1 overflow-hidden p-4">
        <Textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="あらすじを入力してください..."
          className="w-full h-full resize-none font-sans"
        />
      </div>

      {/* フッター */}
      <div className="px-4 py-2 border-t border-border text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>{content.length.toLocaleString()} 文字</span>
          {hasChanges && <span className="text-amber-500">未保存の変更があります</span>}
        </div>
      </div>
    </div>
  );
}

