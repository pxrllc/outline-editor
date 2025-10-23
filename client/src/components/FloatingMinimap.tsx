import { useEffect, useRef, useState } from 'react';
import { OutlineItem } from '@/types';
import { X, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingMinimapProps {
  content: string;
  outlineItems: OutlineItem[];
  onLineClick: (line: number) => void;
  onClose: () => void;
}

export default function FloatingMinimap({ content, outlineItems, onLineClick, onClose }: FloatingMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 150, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const lines = content.split('\n');
    const lineHeight = 2;
    const width = canvas.width;
    const height = Math.max(lines.length * lineHeight, canvas.height);
    
    canvas.height = height;
    
    // 背景をクリア
    ctx.fillStyle = 'rgba(30, 30, 40, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    // 各行を描画
    lines.forEach((line, index) => {
      const y = index * lineHeight;
      
      if (line.trim().length === 0) {
        return;
      } else if (line.match(/^#{1,6}\s/)) {
        ctx.fillStyle = 'rgba(100, 150, 255, 0.8)';
      } else if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
        ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
      } else {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.4)';
      }
      
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
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const lineHeight = 2;
    const line = Math.floor(y / lineHeight);
    
    onLineClick(line);
  };
  
  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '120px',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between p-2 border-b border-border drag-handle cursor-move">
        <div className="flex items-center gap-1">
          <Move className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">ミニマップ</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-5 w-5 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="p-2">
        <canvas
          ref={canvasRef}
          width={96}
          height={400}
          className="w-full cursor-pointer"
          onClick={handleCanvasClick}
        />
      </div>
    </div>
  );
}

