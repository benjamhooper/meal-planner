"use client";
import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { useUpsertSlot, useDeleteSlot } from "@/hooks/useWeekMealPlan";
import { RecipePicker } from "./RecipePicker";
import type { MealPlanSlot } from "@/types";

interface MealSlotProps {
  mealType: "breakfast" | "lunch" | "dinner";
  dayIndex: number;
  weekStartDate: string;
  slot?: MealPlanSlot;
}

const MEAL_LABELS: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };

export function MealSlot({ mealType, dayIndex, weekStartDate, slot }: MealSlotProps) {
  const [showPicker, setShowPicker] = useState(false);
  const upsertSlot = useUpsertSlot();
  const deleteSlot = useDeleteSlot();

  const handleSelect = (recipeId: string | null, customLabel: string | null) => {
    upsertSlot.mutate({ weekStartDate, dayOfWeek: dayIndex, mealType, recipeId: recipeId ?? undefined, customLabel: customLabel ?? undefined });
    setShowPicker(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slot) deleteSlot.mutate(slot.id);
  };

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left group"
      >
        <span className="text-xs text-gray-400 w-16 shrink-0">{MEAL_LABELS[mealType]}</span>
        {slot?.recipeName || slot?.customLabel ? (
          <span className="flex-1 text-sm text-gray-800 truncate">{slot.recipeName || slot.customLabel}</span>
        ) : (
          <span className="flex-1 text-sm text-gray-300 italic">Add meal</span>
        )}
        {slot ? (
          <button onClick={handleClear} className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200">
            <X size={14} className="text-gray-400" />
          </button>
        ) : (
          <Plus size={16} className="text-gray-300 group-hover:text-green-500" />
        )}
      </button>
      <RecipePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        currentSlot={slot}
        onSelect={handleSelect}
      />
    </>
  );
}
