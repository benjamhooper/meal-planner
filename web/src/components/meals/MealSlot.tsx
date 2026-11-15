"use client";
import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
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
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clearedSlot, setClearedSlot] = useState<MealPlanSlot | null>(null);
  const busy = useRef(false);
  const { showToast } = useToast();
  const upsertSlot = useUpsertSlot();
  const deleteSlot = useDeleteSlot();

  const run = async (message: string, failure: string, action: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    setPending(message);
    setError(null);
    try {
      await action();
    } catch {
      setError(failure);
    } finally {
      busy.current = false;
      setPending(null);
    }
  };

  const handleClear = () => {
    if (!slot) return;
    const previous = { ...slot };
    void run("Clearing meal...", "Could not clear this meal. Please try again.", async () => {
      await deleteSlot.mutateAsync(previous.id);
      setClearedSlot(previous);
      setShowPicker(false);
    });
  };

  const handleSelect = (recipeId: string | null, customLabel: string | null) => {
    if (recipeId === null && customLabel === null) {
      handleClear();
      return;
    }
    void run("Saving meal...", "Could not save this meal. Your entry is still here. Please try again.", async () => {
      await upsertSlot.mutateAsync({ weekStartDate, dayOfWeek: dayIndex, mealType, recipeId: recipeId ?? undefined, customLabel: customLabel ?? undefined, notes: slot?.notes });
      setClearedSlot(null);
      setShowPicker(false);
      showToast("Meal saved");
    });
  };

  const handleUndo = () => {
    if (!clearedSlot || slot) return;
    void run("Restoring meal...", "Could not restore this meal. Try Undo again.", async () => {
      await upsertSlot.mutateAsync({ weekStartDate, dayOfWeek: dayIndex, mealType, recipeId: clearedSlot.recipeId, customLabel: clearedSlot.customLabel, notes: clearedSlot.notes });
      setClearedSlot(null);
      showToast("Meal restored");
    });
  };

  return (
    <div>
      <div className="flex items-center">
      <button
        disabled={!!pending}
        onClick={() => { setError(null); setShowPicker(true); }}
        className="min-w-0 flex-1 flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-left group disabled:opacity-50"
      >
        <span className="text-xs text-gray-400 w-16 shrink-0">{MEAL_LABELS[mealType]}</span>
        {slot?.recipeName || slot?.customLabel ? (
          <span className="flex-1 text-sm text-gray-800 truncate">{slot.recipeName || slot.customLabel}</span>
        ) : (
          <span className="flex-1 text-sm text-gray-300 italic">Add meal</span>
        )}
        {!slot && <Plus size={16} className="text-gray-300 group-hover:text-green-500" />}
      </button>
        {slot && (
          <button disabled={!!pending} aria-label={`Clear ${MEAL_LABELS[mealType].toLowerCase()}`} onClick={handleClear} className="p-3 rounded hover:bg-gray-200 disabled:opacity-50">
            <X size={14} className="text-gray-400" />
          </button>
        )}
      </div>
      {!showPicker && pending && <p role="status" className="px-3 pb-2 text-sm text-gray-500">{pending}</p>}
      {!showPicker && error && <p role="alert" className="px-3 pb-2 text-sm text-red-600">{error}</p>}
      {clearedSlot && !slot && !showPicker && (
        <div className="flex items-center gap-3 px-3 pb-2 text-sm">
          <span role="status">Meal cleared.</span>
          <button disabled={!!pending} onClick={handleUndo} className="text-green-700 font-medium underline disabled:opacity-50">Undo</button>
          <button disabled={!!pending} aria-label="Dismiss undo" onClick={() => { setClearedSlot(null); setError(null); }} className="p-2"><X size={14} /></button>
        </div>
      )}
      {showPicker && (
        <RecipePicker
          isOpen
          onClose={() => { if (!busy.current) setShowPicker(false); }}
          currentSlot={slot}
          onSelect={handleSelect}
          pending={pending}
          error={error}
        />
      )}
    </div>
  );
}
