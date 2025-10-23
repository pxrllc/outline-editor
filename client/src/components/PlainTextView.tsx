import { Textarea } from '@/components/ui/textarea';

interface PlainTextViewProps {
  content: string;
  onChange?: (content: string) => void;
}

export default function PlainTextView({ content, onChange }: PlainTextViewProps) {
  // Markdownの記号を除去してプレーンテキストに変換
  const toPlainText = (markdown: string): string => {
    return markdown
      .replace(/^#{1,6}\s+/gm, '') // ヘッダー
      .replace(/\*\*(.+?)\*\*/g, '$1') // 太字
      .replace(/\*(.+?)\*/g, '$1') // イタリック
      .replace(/\[(.+?)\]\(.+?\)/g, '$1') // リンク
      .replace(/`(.+?)`/g, '$1') // インラインコード
      .replace(/^>\s+/gm, '') // 引用
      .replace(/^[-*+]\s+/gm, '') // リスト
      .replace(/^\d+\.\s+/gm, ''); // 番号付きリスト
  };

  const plainText = toPlainText(content);

  const handleChange = (newPlainText: string) => {
    // プレーンテキストの変更をそのままMarkdownとして保存
    // （装飾を削除した状態で編集できるようにする）
    onChange?.(newPlainText);
  };

  return (
    <div className="h-full overflow-y-auto bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Textarea
          value={plainText}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-full min-h-[calc(100vh-200px)] resize-none font-sans text-base leading-relaxed border-none shadow-none focus-visible:ring-0"
          placeholder="プレーンテキストを入力..."
        />
      </div>
    </div>
  );
}

