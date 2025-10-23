import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tag, Plus, X, Book } from 'lucide-react';
import { detectTags } from '@/lib/outline';

interface TagManagerProps {
  content: string;
  tags: Record<string, string>;
  onTagUpdate: (tags: Record<string, string>) => void;
}

export default function TagManager({ content, tags, onTagUpdate }: TagManagerProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [editingDefinition, setEditingDefinition] = useState('');
  
  // コンテンツから検出されたタグ
  const detectedTags = detectTags(content);
  
  // 未定義のタグ
  const undefinedTags = detectedTags.filter(tag => !tags[tag]);
  
  const handleAddTag = () => {
    if (newTagName && !tags[newTagName]) {
      onTagUpdate({
        ...tags,
        [newTagName]: ''
      });
      setSelectedTag(newTagName);
      setEditingDefinition('');
      setNewTagName('');
    }
  };
  
  const handleUpdateDefinition = () => {
    if (selectedTag) {
      onTagUpdate({
        ...tags,
        [selectedTag]: editingDefinition
      });
    }
  };
  
  const handleDeleteTag = (tagName: string) => {
    const newTags = { ...tags };
    delete newTags[tagName];
    onTagUpdate(newTags);
    if (selectedTag === tagName) {
      setSelectedTag(null);
    }
  };
  
  const handleSelectTag = (tagName: string) => {
    setSelectedTag(tagName);
    setEditingDefinition(tags[tagName] || '');
  };
  
  const handleAddUndefinedTag = (tagName: string) => {
    onTagUpdate({
      ...tags,
      [tagName]: ''
    });
    setSelectedTag(tagName);
    setEditingDefinition('');
  };
  
  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Book className="w-5 h-5" />
          <h2 className="text-lg font-semibold">タグ辞書</h2>
        </div>
        
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="新しいタグ名"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddTag}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {undefinedTags.length > 0 && (
        <div className="p-4 bg-accent/50 border-b border-border">
          <div className="text-sm font-semibold mb-2 text-muted-foreground">
            未定義のタグ ({undefinedTags.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {undefinedTags.map(tag => (
              <Button
                key={tag}
                variant="outline"
                size="sm"
                onClick={() => handleAddUndefinedTag(tag)}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {Object.keys(tags).map(tagName => (
            <div
              key={tagName}
              className={`p-2 rounded border cursor-pointer transition-colors ${
                selectedTag === tagName
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-accent'
              }`}
              onClick={() => handleSelectTag(tagName)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="font-semibold">[[{tagName}]]</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTag(tagName);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              {tags[tagName] && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {tags[tagName]}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {selectedTag && (
        <div className="p-4 border-t border-border bg-background">
          <div className="mb-2">
            <span className="text-sm font-semibold">[[{selectedTag}]]</span>
            <span className="text-xs text-muted-foreground ml-2">の定義</span>
          </div>
          <Textarea
            value={editingDefinition}
            onChange={(e) => setEditingDefinition(e.target.value)}
            placeholder="タグの定義や説明を入力..."
            className="min-h-24 mb-2"
          />
          <Button size="sm" onClick={handleUpdateDefinition} className="w-full">
            定義を保存
          </Button>
        </div>
      )}
    </div>
  );
}

