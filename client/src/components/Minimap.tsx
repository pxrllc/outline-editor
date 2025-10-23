import { useEffect, useRef } from 'react';
import { OutlineItem } from '@/types';

interface MinimapProps {
  content: string;
  outlineItems: OutlineItem[];
  onLineClick: (line: number) => void;
}

export default function Minimap({ content, outlineItems, onLineClick }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const lines = content.split('\n');
    const lineHeight = 2; // ミニマップ上での1行の高さ（ピクセル）
    const width = canvas.width;
    const height = Math.max(lines.length * lineHeight, canvas.height);
    
    // キャンバスの高さを調整
    canvas.height = height;
    
    // 背景をクリア
    ctx.fillStyle = 'rgba(30, 30, 40, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    // 各行を描画
    lines.forEach((line, index) => {
      const y = index * lineHeight;
      
      if (line.trim().length === 0) {
        // 空行
        return;
      } else if (line.match(/^#{1,6}\s/)) {
        // ヘッダー行（明るい色）
        ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
      } else if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
        // リスト行（中間色）
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
      } else {
        // 通常のテキスト行
        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
      }
      
      // 行の長さに応じて幅を調整
      const lineWidth = Math.min(line.length / 100, 1) * width;
      ctx.fillRect(0, y, lineWidth, lineHeight);
    });
    
    // アウトライン項目をハイライト
    outlineItems.forEach(item => {
      const y = item.line * lineHeight;
      ctx.strokeStyle = 'rgba(100, 200, 255, 1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, y, width, lineHeight * 2);
    });
    
  }, [content, outlineItems]);
  
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const lineHeight = 2;
    const line = Math.floor(y / lineHeight);
    
    onLineClick(line);
  };
  
  return (
    <div className="w-24 bg-background/80 border-l border-border overflow-y-auto">
      <div className="sticky top-0 p-2 text-xs text-muted-foreground border-b border-border">
        ミニマップ
      </div>
      <canvas
        ref={canvasRef}
        width={96}
        height={800}
        className="w-full cursor-pointer"
        onClick={handleClick}
      />
    </div>
  );
}

