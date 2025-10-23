import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onSave: (name: string) => void;
}

export default function SaveDialog({
  open,
  onOpenChange,
  currentName,
  onSave
}: SaveDialogProps) {
  const [name, setName] = useState(currentName);
  
  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>プロジェクトを保存</DialogTitle>
          <DialogDescription>
            プロジェクトに名前を付けて保存します。
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            type="text"
            placeholder="プロジェクト名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

