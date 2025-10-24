import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Project, Document } from '@/types';

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProject: Project | null;
  currentDocument: Document | null;
}

type SaveType = 'project' | 'document';

export default function SaveDialog({
  open,
  onOpenChange,
  currentProject,
  currentDocument
}: SaveDialogProps) {
  const [saveType, setSaveType] = useState<SaveType>('project');
  const [filename, setFilename] = useState('');
  
  const handleSave = () => {
    if (!filename.trim()) return;
    
    if (saveType === 'project' && currentProject) {
      // プロジェクト全体をJSONファイルとしてエクスポート
      const dataStr = JSON.stringify(currentProject, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename.trim()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (saveType === 'document' && currentDocument) {
      // 現在のドキュメントをMarkdownファイルとしてエクスポート
      const dataBlob = new Blob([currentDocument.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename.trim()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    onOpenChange(false);
  };
  
  // ダイアログが開かれたときにデフォルトのファイル名を設定
  const handleOpenChange = (open: boolean) => {
    if (open) {
      if (saveType === 'project' && currentProject) {
        setFilename(currentProject.name);
      } else if (saveType === 'document' && currentDocument) {
        setFilename(currentDocument.title);
      }
    }
    onOpenChange(open);
  };
  
  // 保存タイプが変更されたときにファイル名を更新
  const handleSaveTypeChange = (type: SaveType) => {
    setSaveType(type);
    if (type === 'project' && currentProject) {
      setFilename(currentProject.name);
    } else if (type === 'document' && currentDocument) {
      setFilename(currentDocument.title);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>保存</DialogTitle>
          <DialogDescription>
            プロジェクトまたはドキュメントをファイルとして保存します。
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <RadioGroup value={saveType} onValueChange={handleSaveTypeChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="project" id="project" />
              <Label htmlFor="project">プロジェクト全体 (JSON)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="document" id="document" disabled={!currentDocument} />
              <Label htmlFor="document" className={!currentDocument ? 'text-muted-foreground' : ''}>
                現在のドキュメント (Markdown)
              </Label>
            </div>
          </RadioGroup>
          
          <div>
            <Label htmlFor="filename">ファイル名</Label>
            <Input
              id="filename"
              type="text"
              placeholder="ファイル名"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <p className="text-sm text-muted-foreground mt-1">
              拡張子は自動的に追加されます ({saveType === 'project' ? '.json' : '.md'})
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!filename.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

