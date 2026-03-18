"use client";
import { useState } from "react";
import { useAddGroceryItem } from "@/hooks/useGroceryList";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export function AddItemForm({ listId }: { listId: string }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const addItem = useAddGroceryItem(listId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addItem.mutate({ name: name.trim(), quantity: quantity.trim() || undefined });
    setName("");
    setQuantity("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-3">
      <div className="flex gap-2">
        <Input
          placeholder="Add item..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20"
        />
        <Button type="submit" disabled={!name.trim() || addItem.isPending} size="md">
          <Plus size={16} />
        </Button>
      </div>
    </form>
  );
}
