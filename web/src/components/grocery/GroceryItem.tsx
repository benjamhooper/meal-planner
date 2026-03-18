"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { usePatchGroceryItem, useDeleteGroceryItem } from "@/hooks/useGroceryList";
import type { GroceryItem as GroceryItemType } from "@/types";

export function GroceryItem({ item, listId }: { item: GroceryItemType; listId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const patch = usePatchGroceryItem(listId);
  const del = useDeleteGroceryItem(listId);

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border group">
      <button {...attributes} {...listeners} className="text-gray-300 touch-none cursor-grab">
        <GripVertical size={16} />
      </button>
      <Checkbox
        checked={item.isChecked}
        onChange={(checked) => patch.mutate({ id: item.id, isChecked: checked })}
      />
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${item.isChecked ? "line-through text-gray-400" : "text-gray-800"}`}>{item.name}</span>
        {item.quantity && <span className="text-xs text-gray-400 ml-1">· {item.quantity}</span>}
        {item.category && <span className="text-xs text-gray-400 ml-1">({item.category})</span>}
      </div>
      <button
        onClick={() => del.mutate(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 rounded"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
