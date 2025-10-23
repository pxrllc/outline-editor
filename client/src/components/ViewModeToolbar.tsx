import { Button } from '@/components/ui/button';
import { ViewMode } from '@/types';
import { FileText, Eye, Code, AlignLeft } from 'lucide-react';

interface ViewModeToolbarProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewModeToolbar({ currentMode, onModeChange }: ViewModeToolbarProps) {
  const modes: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
    { value: 'outline', label: 'アウトライン', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'markdown', label: 'Markdown', icon: <Code className="w-4 h-4" /> },
    { value: 'preview', label: 'プレビュー', icon: <Eye className="w-4 h-4" /> },
    { value: 'plain', label: 'プレーン', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center gap-1 p-2 bg-background border-b border-border">
      {modes.map((mode) => (
        <Button
          key={mode.value}
          variant={currentMode === mode.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onModeChange(mode.value)}
          className="gap-2"
        >
          {mode.icon}
          {mode.label}
        </Button>
      ))}
    </div>
  );
}

