import { ChevronRight, ChevronDown } from 'lucide-react';
import { OutlineItem } from '@/types';
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

interface OutlineViewProps {
  items: OutlineItem[];
  onItemClick: (item: OutlineItem) => void;
  onToggle: (itemId: string) => void;
  onReorder: (items: OutlineItem[]) => void;
}

export default function OutlineView({ items, onItemClick, onToggle, onReorder }: OutlineViewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background border-r border-border p-4">
      <h2 className="text-lg font-semibold mb-4">アウトライン</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {items.map((item) => (
              <SortableOutlineItem
                key={item.id}
                item={item}
                onClick={() => onItemClick(item)}
                onToggle={() => onToggle(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableOutlineItemProps {
  item: OutlineItem;
  onClick: () => void;
  onToggle: () => void;
}

function SortableOutlineItem({ item, onClick, onToggle }: SortableOutlineItemProps) {
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
    paddingLeft: `${(item.level - 1) * 16 + 8}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1 py-1 px-2 hover:bg-accent rounded cursor-pointer group"
      {...attributes}
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
        {...listeners}
        className="flex-1 text-sm truncate"
        style={{ fontSize: `${16 - item.level}px` }}
      >
        {item.text}
      </span>
    </div>
  );
}

