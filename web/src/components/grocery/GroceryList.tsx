"use client";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useGroceryItems, useReorderGroceryItems, useClearCheckedItems } from "@/hooks/useGroceryList";
import { GroceryItem } from "./GroceryItem";
import { AddItemForm } from "./AddItemForm";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

export function GroceryList({ listId }: { listId: string }) {
  const { data: items = [], isLoading } = useGroceryItems(listId);
  const reorder = useReorderGroceryItems(listId);
  const clearChecked = useClearCheckedItems(listId);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorder.mutate(reordered.map((item, idx) => ({ id: item.id, sortOrder: idx })));
  };

  const checkedCount = items.filter((i) => i.isChecked).length;

  return (
    <div className="flex flex-col gap-4">
      <AddItemForm listId={listId} />
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-1">
                {items.filter((i) => !i.isChecked).map((item) => (
                  <GroceryItem key={item.id} item={item} listId={listId} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {checkedCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-medium">{checkedCount} checked</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearChecked.mutate()}
                  className="text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} className="mr-1" /> Clear checked
                </Button>
              </div>
              <div className="flex flex-col gap-1 opacity-60">
                {items.filter((i) => i.isChecked).map((item) => (
                  <GroceryItem key={item.id} item={item} listId={listId} />
                ))}
              </div>
            </div>
          )}
          {items.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Your list is empty. Add some items above!</p>
          )}
        </>
      )}
    </div>
  );
}
