"use client";
import { useState } from "react";
import { useRecipes } from "@/hooks/useRecipes";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/Input";
import { Search, ExternalLink } from "lucide-react";
import type { MealPlanSlot } from "@/types";

interface RecipePickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlot?: MealPlanSlot;
  onSelect: (recipeId: string | null, customLabel: string | null) => void;
}

export function RecipePicker({ isOpen, onClose, currentSlot, onSelect }: RecipePickerProps) {
  const currentName = currentSlot?.recipeName || currentSlot?.customLabel || "";
  const isEditing = !!currentName;
  const [search, setSearch] = useState("");
  const [customLabel, setCustomLabel] = useState(currentName);
  const { data } = useRecipes({ search: search || undefined });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customLabel.trim();
    if (!name) return;
    // Saving an unchanged name must not turn a recipe meal into free text.
    if (name === currentName) {
      onClose();
      return;
    }
    onSelect(null, name);
  };

  const nameForm = (
    <form onSubmit={handleSubmit} className={isEditing ? "border-b pb-3" : "border-t pt-3"}>
      <p className="text-xs text-gray-500 mb-2">{isEditing ? "Meal name" : "Or type a custom label"}</p>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="e.g. Takeout, Leftovers..."
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
        >
          {isEditing ? "Save" : "Set"}
        </button>
      </div>
    </form>
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit meal" : "Pick a meal"}>
      <div className="flex flex-col gap-3">
        {isEditing && nameForm}
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
          <button
            onClick={() => onSelect(null, null)}
            className="text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
          >
            Clear meal
          </button>
          {data?.items.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect(r.id, null)}
              className="text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg"
            >
              <span className="flex-1 text-sm">{r.name}</span>
              {r.type === "link" && <ExternalLink size={14} className="text-gray-400" />}
            </button>
          ))}
        </div>
        {!isEditing && nameForm}
      </div>
    </BottomSheet>
  );
}
