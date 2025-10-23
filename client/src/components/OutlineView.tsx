import { ChevronRight, ChevronDown, GripVertical, ChevronLeft } from 'lucide-react';
import { OutlineItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

interface OutlineViewProps {
  items: OutlineItem[];
  onItemClick: (item: OutlineItem) => void;
  onToggle: (itemId: string) => void;
  onReorder: (items: OutlineItem[]) => void;
  onIndentChange: (itemId: string, newLevel: number) => void;
}

export default function OutlineView({ items, onItemClick, onToggle, onReorder, onIndentChange }: OutlineViewProps) {
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const [moveWithChildren, setMoveWithChildren] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 子要素を取得
  const getChildren = (parentItem: OutlineItem): OutlineItem[] => {
    const parentIndex = items.indexOf(parentItem);
    const children: OutlineItem[] = [];
    
    for (let i = parentIndex + 1; i < items.length; i++) {
      if (items[i].level <= parentItem.level) {
        break;
      }
      children.push(items[i]);
    }
    
    return children;
  };

  // 表示すべきアイテムをフィルタリング
  const getVisibleItems = (): OutlineItem[] => {
    const visible: OutlineItem[] = [];
    const hiddenParents = new Set<number>();

    items.forEach((item, index) => {
      // 親が折りたたまれているかチェック
      let isHidden = false;
      for (let i = index - 1; i >= 0; i--) {
        if (items[i].level < item.level && collapsedItems.has(items[i].id)) {
          isHidden = true;
          break;
        }
        if (items[i].level < item.level) {
          break;
        }
      }

      if (!isHidden) {
        visible.push(item);
      }
    });

    return visible;
  };

  const handleToggle = (itemId: string) => {
    const newCollapsed = new Set(collapsedItems);
    if (newCollapsed.has(itemId)) {
      newCollapsed.delete(itemId);
    } else {
      newCollapsed.add(itemId);
    }
    setCollapsedItems(newCollapsed);
    onToggle(itemId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      if (moveWithChildren) {
        // 子要素を含めて移動
        const itemToMove = items[oldIndex];
        const children = getChildren(itemToMove);
        const itemsToMove = [itemToMove, ...children];
        
        // 移動するアイテムを除外
        const remainingItems = items.filter(item => !itemsToMove.includes(item));
        
        // 新しい位置を計算
        let insertIndex = remainingItems.findIndex(item => item.id === over.id);
        if (oldIndex < newIndex) {
          insertIndex += 1;
        }
        
        // 挿入
        const newItems = [
          ...remainingItems.slice(0, insertIndex),
          ...itemsToMove,
          ...remainingItems.slice(insertIndex)
        ];
        
        onReorder(newItems);
      } else {
        // 単独で移動
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
      }
    }
  };

  const handleIndentIncrease = (item: OutlineItem) => {
    if (item.level < 6) {
      onIndentChange(item.id, item.level + 1);
    }
  };

  const handleIndentDecrease = (item: OutlineItem) => {
    if (item.level > 1) {
      onIndentChange(item.id, item.level - 1);
    }
  };

  const visibleItems = getVisibleItems();
  const hasChildren = (item: OutlineItem) => {
    const children = getChildren(item);
    return children.length > 0;
  };

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-2">アウトライン</h2>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={moveWithChildren}
            onChange={(e) => setMoveWithChildren(e.target.checked)}
            className="rounded"
          />
          子要素以下も含めて移動
        </label>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleItems.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {visibleItems.map((item) => (
                <SortableOutlineItem
                  key={item.id}
                  item={item}
                  hasChildren={hasChildren(item)}
                  isCollapsed={collapsedItems.has(item.id)}
                  onClick={() => onItemClick(item)}
                  onToggle={() => handleToggle(item.id)}
                  onIndentIncrease={() => handleIndentIncrease(item)}
                  onIndentDecrease={() => handleIndentDecrease(item)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

interface SortableOutlineItemProps {
  item: OutlineItem;
  hasChildren: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  onToggle: () => void;
  onIndentIncrease: () => void;
  onIndentDecrease: () => void;
}

function SortableOutlineItem({ 
  item, 
  hasChildren,
  isCollapsed,
  onClick, 
  onToggle,
  onIndentIncrease,
  onIndentDecrease
}: SortableOutlineItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group hover:bg-accent rounded"
      {...attributes}
    >
      <div 
        className="flex items-center gap-1 py-1 px-2"
        style={{ paddingLeft: `${(item.level - 1) * 16 + 8}px` }}
      >
        {/* ドラッグハンドル */}
        <div 
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-3 h-3 text-muted-foreground" />
        </div>

        {/* 折りたたみボタン */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`transition-opacity ${hasChildren ? 'opacity-100' : 'opacity-0'}`}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* インデント調整ボタン */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onIndentDecrease();
            }}
            disabled={item.level <= 1}
            className="h-5 w-5 p-0"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onIndentIncrease();
            }}
            disabled={item.level >= 6}
            className="h-5 w-5 p-0"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {/* テキスト */}
        <span
          onClick={onClick}
          className="flex-1 text-sm truncate cursor-pointer"
          style={{ fontSize: `${16 - item.level}px` }}
        >
          {item.text}
        </span>
      </div>
    </div>
  );
}

