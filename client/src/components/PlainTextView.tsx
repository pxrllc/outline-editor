interface PlainTextViewProps {
  content: string;
}

export default function PlainTextView({ content }: PlainTextViewProps) {
  // Markdownの記号を除去してプレーンテキストに変換
  const plainText = content
    .replace(/^#{1,6}\s+/gm, '') // ヘッダー
    .replace(/\*\*(.+?)\*\*/g, '$1') // 太字
    .replace(/\*(.+?)\*/g, '$1') // イタリック
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // リンク
    .replace(/`(.+?)`/g, '$1') // インラインコード
    .replace(/^>\s+/gm, '') // 引用
    .replace(/^[-*+]\s+/gm, '') // リスト
    .replace(/^\d+\.\s+/gm, ''); // 番号付きリスト

  return (
    <div className="h-full overflow-y-auto bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
          {plainText}
        </pre>
      </div>
    </div>
  );
}

