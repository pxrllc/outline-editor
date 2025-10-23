import { ChevronRight, ChevronDown } from 'lucide-react';
import { OutlineItem } from '@/types';
import { useState } from 'react';

interface OutlineViewProps {
  items: OutlineItem[];
  onItemClick: (item: OutlineItem) => void;
  onToggle: (itemId: string) => void;
}

export default function OutlineView({ items, onItemClick, onToggle }: OutlineViewProps) {
  return (
    <div className="h-full overflow-y-auto bg-background border-r border-border p-4">
      <h2 className="text-lg font-semibold mb-4">アウトライン</h2>
      <div className="space-y-1">
        {items.map((item) => (
          <OutlineItemComponent
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
            onToggle={() => onToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface OutlineItemComponentProps {
  item: OutlineItem;
  onClick: () => void;
  onToggle: () => void;
}

function OutlineItemComponent({ item, onClick, onToggle }: OutlineItemComponentProps) {
  const indent = (item.level - 1) * 16;
  
  return (
    <div
      className="flex items-center gap-1 py-1 px-2 hover:bg-accent rounded cursor-pointer group"
      style={{ paddingLeft: `${indent + 8}px` }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {item.collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      <span
        onClick={onClick}
        className="flex-1 text-sm truncate"
        style={{ fontSize: `${16 - item.level}px` }}
      >
        {item.text}
      </span>
    </div>
  );
}

